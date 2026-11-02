import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Router } from "express";
import multer from "multer";
import mongoose from "mongoose";
import Property from "../models/Property.js";
import { findLocation } from "../data/indiaLocations.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = Router();
const uploadDirectory = fileURLToPath(new URL("../../uploads/", import.meta.url));
const maxImageBytes = 5 * 1024 * 1024;
const maxImages = 8;
const rentalCategories = ["shared-flats", "1rk-1bhk", "2bhk-3bhk", "independent-houses"];
const pgCategories = ["girls-pg", "boys-pg", "shared-flats"];
const ownerRoles = ["owner", "pg_operator"];
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxImageBytes, files: maxImages, fields: 24, fieldSize: 10 * 1024 },
});

const editableFields = [
  "title",
  "description",
  "category",
  "propertyType",
  "state",
  "city",
  "locality",
  "address",
  "transactionType",
  "monthlyRent",
  "askingPrice",
  "securityDeposit",
  "furnishing",
  "amenities",
  "availability",
  "bedrooms",
  "accommodation",
];

function fail(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  throw error;
}

function parseAmenities(value) {
  if (typeof value !== "string") fail(400, "INVALID_AMENITIES", "Provide amenities as a JSON array of text values.");
  let amenities;
  try {
    amenities = JSON.parse(value);
  } catch {
    fail(400, "INVALID_AMENITIES", "Amenities must be a valid JSON array.");
  }
  if (!Array.isArray(amenities) || amenities.length > 30
    || amenities.some((item) => typeof item !== "string" || !item.trim() || item.trim().length > 80)) {
    fail(400, "INVALID_AMENITIES", "Provide up to 30 non-empty amenities, each no longer than 80 characters.");
  }
  return amenities.map((item) => item.trim());
}

function parseListing(request, existingProperty = null) {
  const body = request.body ?? {};
  const protectedFields = ["owner", "ownerId", "listingStatus", "isDemo", "_id", "status"];
  if (protectedFields.some((field) => Object.hasOwn(body, field))) {
    fail(400, "PROTECTED_FIELD", "Ownership, listing status and demonstration fields are managed by EstateSphere.");
  }

  const input = {};
  for (const field of editableFields) {
    if (Object.hasOwn(body, field)) input[field] = body[field];
  }
  if (!existingProperty && editableFields.some((field) => !Object.hasOwn(input, field))) {
    fail(400, "MISSING_PROPERTY_FIELDS", "Complete all required property listing fields.");
  }
  if (Object.hasOwn(input, "amenities")) input.amenities = parseAmenities(input.amenities);

  const transactionType = input.transactionType ?? existingProperty?.transactionType ?? "rent";
  if (!["rent", "sale"].includes(transactionType)) {
    fail(400, "INVALID_TRANSACTION_TYPE", "Transaction type must be rent or sale.");
  }
  const category = input.category ?? existingProperty?.category;
  const allowedCategories = request.user.role === "owner"
    ? [...rentalCategories, "residential-sale"]
    : pgCategories;
  if (!allowedCategories.includes(category)) {
    fail(403, "CATEGORY_NOT_ALLOWED", request.user.role === "owner"
      ? "Property owners may create residential rental or sale listings."
      : "PG operators may create Girls PG, Boys PG or shared-accommodation listings.");
  }
  if (request.user.role === "pg_operator" && transactionType !== "rent") {
    fail(403, "TRANSACTION_NOT_ALLOWED", "PG operators may only create rental and accommodation listings.");
  }
  if ((category === "residential-sale") !== (transactionType === "sale")) {
    fail(400, "CATEGORY_TRANSACTION_MISMATCH", "Use the residential sale category for sale listings and a rental category for rentals.");
  }

  const location = findLocation(
    input.state ?? existingProperty?.state,
    input.city ?? existingProperty?.city,
    (input.locality ?? existingProperty?.locality) || undefined,
  );
  if (!location) fail(400, "INVALID_LOCATION", "Choose a valid state, city and locality from the EstateSphere location selectors.");
  const propertyType = input.propertyType ?? existingProperty?.propertyType;
  if (typeof propertyType !== "string" || propertyType.trim().length < 2 || propertyType.trim().length > 80) {
    fail(400, "INVALID_PROPERTY_TYPE", "Property type must be between 2 and 80 characters.");
  }

  const numeric = (field, { required, min = 0, max = 100000000 } = {}) => {
    const value = input[field] ?? existingProperty?.[field];
    if (value === undefined || value === "") {
      if (required) fail(400, `INVALID_${field.toUpperCase()}`, `${field} is required.`);
      return undefined;
    }
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
      fail(400, `INVALID_${field.toUpperCase()}`, `${field} must be a number between ${min} and ${max}.`);
    }
    return parsed;
  };
  const requiredString = (field, minLength, maxLength) => {
    const value = input[field] ?? existingProperty?.[field];
    if (typeof value !== "string" || value.trim().length < minLength || value.trim().length > maxLength) {
      fail(400, `INVALID_${field.toUpperCase()}`, `${field} must be between ${minLength} and ${maxLength} characters.`);
    }
    return value.trim();
  };

  const result = {
    title: requiredString("title", 5, 140),
    description: requiredString("description", 20, 2000),
    category,
    propertyType: propertyType.trim(),
    state: location.state,
    city: location.city,
    locality: location.locality,
    location: location.locality ? `${location.locality}, ${location.city}` : location.city,
    address: requiredString("address", 5, 240),
    transactionType,
    furnishing: input.furnishing ?? existingProperty?.furnishing,
    availability: input.availability ?? existingProperty?.availability ?? "available",
    amenities: input.amenities ?? existingProperty?.amenities ?? [],
    bedrooms: requiredString("bedrooms", 1, 80),
    accommodation: requiredString("accommodation", 1, 240),
  };

  if (!["Unfurnished", "Semi-furnished", "Furnished", "Fully furnished"].includes(result.furnishing)) {
    fail(400, "INVALID_FURNISHING", "Choose a valid furnishing option.");
  }
  if (!["available", "unavailable"].includes(result.availability)) {
    fail(400, "INVALID_AVAILABILITY", "Availability must be available or unavailable.");
  }

  if (transactionType === "sale") {
    result.askingPrice = numeric("askingPrice", { required: true, max: 1000000000 });
  } else {
    result.monthlyRent = numeric("monthlyRent", { required: true });
    result.securityDeposit = numeric("securityDeposit", { required: true });
  }
  return result;
}

function validateImageFiles(files) {
  for (const file of files) {
    const validJpeg = file.mimetype === "image/jpeg"
      && file.buffer[0] === 0xff && file.buffer[1] === 0xd8 && file.buffer[2] === 0xff;
    const validPng = file.mimetype === "image/png"
      && file.buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    const validWebp = file.mimetype === "image/webp"
      && file.buffer.toString("ascii", 0, 4) === "RIFF"
      && file.buffer.toString("ascii", 8, 12) === "WEBP";
    if (!validJpeg && !validPng && !validWebp) {
      fail(400, "INVALID_IMAGE", "Only valid JPEG, PNG or WebP image files are accepted.");
    }
  }
}

async function storeImages(files) {
  if (files.length === 0) return [];
  await mkdir(uploadDirectory, { recursive: true });
  const paths = [];
  try {
    for (const file of files) {
      const extension = file.mimetype === "image/jpeg" ? ".jpg" : file.mimetype === "image/png" ? ".png" : ".webp";
      const filename = `${randomUUID()}${extension}`;
      await writeFile(join(uploadDirectory, filename), file.buffer, { flag: "wx" });
      paths.push(`/uploads/${filename}`);
    }
    return paths;
  } catch (error) {
    await removeStoredImages(paths);
    throw error;
  }
}

async function removeStoredImages(paths) {
  await Promise.all(paths.map((imagePath) => {
    const filename = imagePath.slice("/uploads/".length);
    return unlink(join(uploadDirectory, filename)).catch(() => {});
  }));
}

function isValidId(id) {
  return /^[a-z0-9-]{3,100}$/.test(id);
}

function ownerQuery(request) {
  return { _id: request.params.id, owner: request.user._id, isDemo: false };
}

router.use(requireAuth, requireRole(...ownerRoles));

router.get("/", async (request, response, next) => {
  try {
    const properties = await Property.find({ owner: request.user._id, isDemo: false })
      .sort({ updatedAt: -1 })
      .lean();
    return response.status(200).json({ success: true, count: properties.length, data: properties });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", async (request, response, next) => {
  try {
    if (!isValidId(request.params.id)) fail(400, "INVALID_PROPERTY_ID", "Property ID has an invalid format.");
    const property = await Property.findOne(ownerQuery(request)).lean();
    if (!property) fail(404, "PROPERTY_NOT_FOUND", "Your property listing could not be found.");
    return response.status(200).json({ success: true, data: property });
  } catch (error) {
    return next(error);
  }
});

router.post("/", imageUpload.array("images", maxImages), async (request, response, next) => {
  let imagePaths = [];
  try {
    validateImageFiles(request.files);
    const values = parseListing(request);
    imagePaths = await storeImages(request.files);
    if (imagePaths.length === 0) fail(400, "IMAGE_REQUIRED", "Upload at least one property photograph.");
    const property = await Property.create({
      ...values,
      _id: randomUUID(),
      owner: request.user._id,
      images: imagePaths,
      isDemo: false,
      listingStatus: "pending",
      bedrooms: values.bedrooms,
      accommodation: values.accommodation,
    });
    return response.status(201).json({ success: true, data: property });
  } catch (error) {
    await removeStoredImages(imagePaths);
    return next(error);
  }
});

router.patch("/:id", imageUpload.array("images", maxImages), async (request, response, next) => {
  let newImagePaths = [];
  try {
    if (!isValidId(request.params.id)) fail(400, "INVALID_PROPERTY_ID", "Property ID has an invalid format.");
    validateImageFiles(request.files);
    const property = await Property.findOne(ownerQuery(request));
    if (!property) fail(404, "PROPERTY_NOT_FOUND", "Your property listing could not be found.");

    const values = parseListing(request, property);
    const requestedImages = request.body.existingImages;
    if (typeof requestedImages !== "string") fail(400, "INVALID_IMAGES", "Choose which existing photographs to keep.");
    let keepImages;
    try {
      keepImages = JSON.parse(requestedImages);
    } catch {
      fail(400, "INVALID_IMAGES", "Existing photographs must be a valid JSON array.");
    }
    if (!Array.isArray(keepImages) || keepImages.some((image) => !property.images.includes(image))) {
      fail(400, "INVALID_IMAGES", "Only photographs already attached to this listing may be retained.");
    }
    if (keepImages.length + request.files.length > maxImages) {
      fail(400, "IMAGE_LIMIT_EXCEEDED", `A listing may have at most ${maxImages} photographs.`);
    }

    const oldImagePaths = [...property.images];
    newImagePaths = await storeImages(request.files);
    const images = [...new Set([...keepImages, ...newImagePaths])];
    if (images.length === 0) fail(400, "IMAGE_REQUIRED", "Keep or upload at least one property photograph.");
    Object.assign(property, values, {
      images,
      reviewedBy: null,
      reviewedAt: null,
      rejectionReason: "",
    });
    if (values.transactionType === "sale") {
      property.monthlyRent = undefined;
      property.securityDeposit = undefined;
    } else {
      property.askingPrice = undefined;
    }
    property.listingStatus = "pending";
    await property.save();
    const removedImages = oldImagePaths.filter((image) => !images.includes(image) && image.startsWith("/uploads/"));
    await removeStoredImages(removedImages);
    return response.status(200).json({ success: true, data: property });
  } catch (error) {
    await removeStoredImages(newImagePaths);
    return next(error);
  }
});

router.delete("/:id", async (request, response, next) => {
  try {
    if (!isValidId(request.params.id)) fail(400, "INVALID_PROPERTY_ID", "Property ID has an invalid format.");
    const property = await Property.findOne(ownerQuery(request));
    if (!property) fail(404, "PROPERTY_NOT_FOUND", "Your property listing could not be found.");
    property.availability = "unavailable";
    property.listingStatus = "inactive";
    await property.save();
    return response.status(200).json({ success: true, data: property });
  } catch (error) {
    return next(error);
  }
});

export default router;
