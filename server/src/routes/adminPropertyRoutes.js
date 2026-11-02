import { Router } from "express";
import Property from "../models/Property.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = Router();
const reviewStatuses = ["pending", "approved", "rejected"];
const ownerFields = "fullName email phone role";

function fail(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  throw error;
}

function validPropertyId(id) {
  return /^[a-z0-9-]{3,100}$/.test(id);
}

function userListingFilter() {
  return { isDemo: false, owner: { $exists: true } };
}

router.use(requireAuth, requireRole("admin"));

router.get("/summary", async (_request, response, next) => {
  try {
    const counts = await Property.aggregate([
      { $match: userListingFilter() },
      { $group: { _id: "$listingStatus", count: { $sum: 1 } } },
    ]);
    const summary = Object.fromEntries(reviewStatuses.map((status) => [status, 0]));
    for (const item of counts) {
      if (Object.hasOwn(summary, item._id)) summary[item._id] = item.count;
    }
    return response.status(200).json({ success: true, data: summary });
  } catch (error) {
    return next(error);
  }
});

router.get("/", async (request, response, next) => {
  try {
    const status = request.query.status;
    if (status !== undefined && (typeof status !== "string" || !["all", ...reviewStatuses].includes(status))) {
      fail(400, "INVALID_REVIEW_STATUS", `Status must be one of: all, ${reviewStatuses.join(", ")}.`);
    }
    const filter = userListingFilter();
    if (status && status !== "all") filter.listingStatus = status;

    const properties = await Property.find(filter)
      .populate("owner", ownerFields)
      .populate("reviewedBy", "fullName email")
      .populate("reviewHistory.reviewedBy", "fullName email")
      .sort({ createdAt: 1 })
      .lean();
    return response.status(200).json({ success: true, count: properties.length, data: properties });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", async (request, response, next) => {
  try {
    if (!validPropertyId(request.params.id)) fail(400, "INVALID_PROPERTY_ID", "Property ID has an invalid format.");
    const property = await Property.findOne({ ...userListingFilter(), _id: request.params.id })
      .populate("owner", ownerFields)
      .populate("reviewedBy", "fullName email")
      .populate("reviewHistory.reviewedBy", "fullName email")
      .lean();
    if (!property) fail(404, "PROPERTY_NOT_FOUND", "The submitted property could not be found.");
    return response.status(200).json({ success: true, data: property });
  } catch (error) {
    return next(error);
  }
});

async function reviewPendingProperty(request, response, status, reason = "") {
  if (!validPropertyId(request.params.id)) fail(400, "INVALID_PROPERTY_ID", "Property ID has an invalid format.");
  const reviewedAt = new Date();
  const review = {
    status,
    reviewedBy: request.user._id,
    reviewedAt,
    reason,
  };
  const property = await Property.findOneAndUpdate(
    { ...userListingFilter(), _id: request.params.id, listingStatus: "pending" },
    {
      $set: {
        listingStatus: status,
        reviewedBy: request.user._id,
        reviewedAt,
        rejectionReason: reason,
      },
      $push: { reviewHistory: review },
    },
    { new: true, runValidators: true },
  )
    .populate("owner", ownerFields)
    .populate("reviewedBy", "fullName email")
    .lean();

  if (property) return response.status(200).json({ success: true, data: property });

  const existing = await Property.findOne({ ...userListingFilter(), _id: request.params.id })
    .select("listingStatus")
    .lean();
  if (!existing) fail(404, "PROPERTY_NOT_FOUND", "The submitted property could not be found.");
  fail(409, "INVALID_REVIEW_TRANSITION", "Only pending property listings can be approved or rejected.");
}

router.post("/:id/approve", async (request, response, next) => {
  try {
    return await reviewPendingProperty(request, response, "approved");
  } catch (error) {
    return next(error);
  }
});

router.post("/:id/reject", async (request, response, next) => {
  try {
    const reason = request.body?.reason;
    if (typeof reason !== "string" || reason.trim().length < 10 || reason.trim().length > 1000) {
      fail(400, "INVALID_REJECTION_REASON", "Provide a rejection reason between 10 and 1000 characters.");
    }
    return await reviewPendingProperty(request, response, "rejected", reason.trim());
  } catch (error) {
    return next(error);
  }
});

export default router;
