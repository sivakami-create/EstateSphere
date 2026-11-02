import { Router } from "express";
import mongoose from "mongoose";
import Property, { propertyCategories } from "../models/Property.js";
import { findLocation } from "../data/indiaLocations.js";

const router = Router();
const supportedTransactionTypes = ["rent", "sale"];

function readListQuery(request, key, { maxItems = 10, maxItemLength = 80 } = {}) {
  const value = request.query[key];
  if (value === undefined) return undefined;
  if (typeof value !== "string") {
    const error = new Error(`Query parameter "${key}" must be a comma-separated list.`);
    error.status = 400;
    throw error;
  }
  const items = value.split(",").map((item) => item.trim()).filter(Boolean);
  if (!items.length || items.length > maxItems || items.some((item) => item.length > maxItemLength)) {
    const error = new Error(`Query parameter "${key}" must contain 1 to ${maxItems} values, each up to ${maxItemLength} characters.`);
    error.status = 400;
    throw error;
  }
  return [...new Set(items)];
}

function readStringQuery(request, key, { maxLength = 120 } = {}) {
  const value = request.query[key];
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !value.trim() || value.trim().length > maxLength) {
    const error = new Error(`Query parameter "${key}" must be a non-empty string up to ${maxLength} characters.`);
    error.status = 400;
    throw error;
  }
  return value.trim();
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function publicVisibilityFilter() {
  return {
    availability: "available",
    $or: [
      { isDemo: true, listingStatus: "demo" },
      { isDemo: false, listingStatus: "approved" },
    ],
  };
}

function transactionTypeFilter(transactionType) {
  if (transactionType === "rent") {
    return {
      $and: [
        { transactionType: { $in: ["rent", null] } },
        { category: { $ne: "residential-sale" } },
      ],
    };
  }
  return transactionType ? { transactionType } : {};
}

router.get("/", async (request, response, next) => {
  try {
    const category = readStringQuery(request, "category", { maxLength: 40 });
    const location = readStringQuery(request, "location");
    const stateValue = readStringQuery(request, "state", { maxLength: 80 });
    const cityValue = readStringQuery(request, "city", { maxLength: 100 });
    const localityValue = readStringQuery(request, "locality", { maxLength: 120 });
    const propertyType = readStringQuery(request, "propertyType", { maxLength: 80 });
    const propertyTypeContains = readStringQuery(request, "propertyTypeContains", { maxLength: 80 });
    const propertyTypeExcludes = readListQuery(request, "propertyTypeExcludes", { maxItems: 5 });
    const categories = readListQuery(request, "categories", { maxItems: propertyCategories.length, maxItemLength: 40 });
    const propertyTypes = readListQuery(request, "propertyTypes");
    const transactionType = readStringQuery(request, "transactionType", { maxLength: 10 });
    const sort = readStringQuery(request, "sort", { maxLength: 20 });
    const budgetValue = readStringQuery(request, "budget", { maxLength: 20 });
    const minBudgetValue = readStringQuery(request, "minBudget", { maxLength: 20 });
    const maxBudgetValue = readStringQuery(request, "maxBudget", { maxLength: 20 });
    const filter = publicVisibilityFilter();

    if (category) {
      if (!propertyCategories.includes(category)) {
        return response.status(400).json({
          success: false,
          error: {
            code: "INVALID_CATEGORY",
            message: `Category must be one of: ${propertyCategories.join(", ")}.`,
          },
        });
      }
      filter.category = category;
    }

    if (categories) {
      if (categories.some((value) => !propertyCategories.includes(value))) {
        return response.status(400).json({
          success: false,
          error: {
            code: "INVALID_CATEGORIES",
            message: `Categories must be selected from: ${propertyCategories.join(", ")}.`,
          },
        });
      }
      filter.category = { $in: categories };
    }

    if (transactionType) {
      if (!supportedTransactionTypes.includes(transactionType)) {
        return response.status(400).json({
          success: false,
          error: {
            code: "INVALID_TRANSACTION_TYPE",
            message: "Transaction type must be rent or sale.",
          },
        });
      }
      Object.assign(filter, transactionTypeFilter(transactionType));
    }

    if (sort !== undefined && sort !== "recent") {
      return response.status(400).json({
        success: false,
        error: {
          code: "INVALID_SORT",
          message: 'Sort must be "recent".',
        },
      });
    }

    if (location) {
      filter.location = { $regex: escapeRegex(location), $options: "i" };
    }

    if ((cityValue && !stateValue) || (localityValue && !cityValue)) {
      return response.status(400).json({
        success: false,
        error: {
          code: "INVALID_LOCATION_FILTER",
          message: "Select a state before filtering by city, and a city before filtering by locality.",
        },
      });
    }

    if (stateValue || cityValue || localityValue) {
      const structuredLocation = findLocation(stateValue, cityValue || undefined, localityValue || undefined);
      if (!structuredLocation) {
        return response.status(400).json({
          success: false,
          error: {
            code: "INVALID_LOCATION_FILTER",
            message: "Choose a state, city and locality from the EstateSphere location options.",
          },
        });
      }
      filter.state = structuredLocation.state;
      if (cityValue) filter.city = structuredLocation.city;
      if (localityValue) filter.locality = structuredLocation.locality;
    }

    if (propertyType) {
      filter.propertyType = propertyType;
    }

    if (propertyTypes) {
      filter.propertyType = { $in: propertyTypes };
    }

    if (propertyTypeContains) {
      filter.propertyType = { $regex: escapeRegex(propertyTypeContains), $options: "i" };
    }

    if (propertyTypeExcludes) {
      filter.$nor = propertyTypeExcludes.map((value) => ({
        propertyType: { $regex: escapeRegex(value), $options: "i" },
      }));
    }

    if (budgetValue !== undefined) {
      const budget = Number(budgetValue);
      if (!Number.isFinite(budget) || budget < 0 || budget > 100000000) {
        return response.status(400).json({
          success: false,
          error: {
            code: "INVALID_BUDGET",
            message: "Budget must be a non-negative number no greater than 100000000.",
          },
        });
      }
      filter.monthlyRent = { $lte: budget };
    }

    if (minBudgetValue !== undefined || maxBudgetValue !== undefined) {
      const maxAllowedBudget = transactionType === "sale" ? 1000000000 : 100000000;
      const minBudget = minBudgetValue === undefined ? undefined : Number(minBudgetValue);
      const maxBudget = maxBudgetValue === undefined ? undefined : Number(maxBudgetValue);
      if (
        (minBudget !== undefined && (!Number.isFinite(minBudget) || minBudget < 0 || minBudget > maxAllowedBudget))
        || (maxBudget !== undefined && (!Number.isFinite(maxBudget) || maxBudget < 0 || maxBudget > maxAllowedBudget))
        || (minBudget !== undefined && maxBudget !== undefined && minBudget > maxBudget)
      ) {
        return response.status(400).json({
          success: false,
          error: {
            code: "INVALID_BUDGET_RANGE",
            message: `Budget bounds must be non-negative, no greater than ${maxAllowedBudget}, and minimum must not exceed maximum.`,
          },
        });
      }
      const priceFilter = {};
      if (minBudget !== undefined) priceFilter.$gte = minBudget;
      if (maxBudget !== undefined) priceFilter.$lte = maxBudget;
      filter[transactionType === "sale" ? "askingPrice" : "monthlyRent"] = priceFilter;
    }

    if (mongoose.connection.readyState !== 1) {
      return response.status(503).json({
        success: false,
        error: {
          code: "DATABASE_UNAVAILABLE",
          message: "The property database is not connected.",
        },
      });
    }

    const [properties, locations, availablePropertyTypes] = await Promise.all([
      Property.find(filter)
        .select("-owner -reviewedBy -reviewedAt -rejectionReason -reviewHistory")
        .sort({ createdAt: -1 })
        .lean(),
      Property.distinct("location", {
        ...(category ? { category } : {}),
        ...(categories ? { category: { $in: categories } } : {}),
        ...transactionTypeFilter(transactionType),
        ...publicVisibilityFilter(),
        availability: "available",
      }),
      Property.distinct("propertyType", {
        ...(category ? { category } : {}),
        ...(categories ? { category: { $in: categories } } : {}),
        ...transactionTypeFilter(transactionType),
        ...publicVisibilityFilter(),
        availability: "available",
      }),
    ]);
    return response.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
      filters: {
        locations: locations.sort((left, right) => left.localeCompare(right)),
        propertyTypes: availablePropertyTypes.sort((left, right) => left.localeCompare(right)),
      },
    });
  } catch (error) {
    if (error.status === 400) {
      return response.status(400).json({
        success: false,
        error: { code: "INVALID_QUERY", message: error.message },
      });
    }
    return next(error);
  }
});

router.get("/:id", async (request, response, next) => {
  try {
    const { id } = request.params;
    if (!/^[a-z0-9-]{3,100}$/.test(id)) {
      return response.status(400).json({
        success: false,
        error: {
          code: "INVALID_PROPERTY_ID",
          message: "Property ID has an invalid format.",
        },
      });
    }

    if (mongoose.connection.readyState !== 1) {
      return response.status(503).json({
        success: false,
        error: {
          code: "DATABASE_UNAVAILABLE",
          message: "The property database is not connected.",
        },
      });
    }

    const property = await Property.findOne({
      _id: id,
      ...publicVisibilityFilter(),
    })
      .select("-owner -reviewedBy -reviewedAt -rejectionReason -reviewHistory")
      .lean();

    if (!property) {
      return response.status(404).json({
        success: false,
        error: {
          code: "PROPERTY_NOT_FOUND",
          message: "The requested property was not found.",
        },
      });
    }

    return response.status(200).json({ success: true, data: property });
  } catch (error) {
    return next(error);
  }
});

export default router;
