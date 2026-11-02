import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import Property from "../models/Property.js";
import PropertyRequest from "../models/PropertyRequest.js";

const router = Router();
const ownerRoles = ["owner", "pg_operator"];
const propertySummary = "title category propertyType location state city locality images transactionType monthlyRent askingPrice";
const requestStatuses = ["submitted", "responded", "accepted", "declined"];

function fail(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  throw error;
}

function isUuid(value) {
  return typeof value === "string"
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function requireText(value, field, minLength, maxLength) {
  if (typeof value !== "string" || value.trim().length < minLength || value.trim().length > maxLength) {
    fail(400, `INVALID_${field.toUpperCase()}`, `${field} must be between ${minLength} and ${maxLength} characters.`);
  }
  return value.trim();
}

function validateOptionalText(value, field, maxLength) {
  if (value === undefined || value === "") return "";
  if (typeof value !== "string" || value.trim().length > maxLength) {
    fail(400, `INVALID_${field.toUpperCase()}`, `${field} must be no longer than ${maxLength} characters.`);
  }
  return value.trim();
}

function parseVisitDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    fail(400, "INVALID_PREFERRED_DATE", "Choose a valid visit date.");
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    fail(400, "INVALID_PREFERRED_DATE", "Choose a valid visit date.");
  }
  const todayParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const datePart = (type) => todayParts.find((part) => part.type === type)?.value;
  const today = `${datePart("year")}-${datePart("month")}-${datePart("day")}`;
  const latestDate = new Date(`${today}T00:00:00.000Z`);
  latestDate.setUTCDate(latestDate.getUTCDate() + 365);
  if (value <= today || date > latestDate) {
    fail(400, "INVALID_PREFERRED_DATE", "Visit requests must be for a future date within the next 365 days.");
  }
  return value;
}

function parseVisitTime(value) {
  if (typeof value !== "string" || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    fail(400, "INVALID_PREFERRED_TIME", "Choose a valid preferred time.");
  }
  return value;
}

function requireTenant(request, response, next) {
  return requireRole("tenant")(request, response, next);
}

function requireOwner(request, response, next) {
  return requireRole(...ownerRoles)(request, response, next);
}

function requestQueryFilters(query, baseFilter) {
  const filter = { ...baseFilter };
  if (query.type !== undefined) {
    if (typeof query.type !== "string" || !["enquiry", "visit"].includes(query.type)) {
      fail(400, "INVALID_REQUEST_TYPE", "Request type must be enquiry or visit.");
    }
    filter.requestType = query.type;
  }
  if (query.status !== undefined) {
    if (typeof query.status !== "string" || !requestStatuses.includes(query.status)) {
      fail(400, "INVALID_REQUEST_STATUS", `Status must be one of: ${requestStatuses.join(", ")}.`);
    }
    filter.status = query.status;
  }
  return filter;
}

async function submitRequest(request, response, next, requestType) {
  try {
    const idempotencyKey = request.get("Idempotency-Key");
    if (!isUuid(idempotencyKey)) {
      fail(400, "IDEMPOTENCY_KEY_REQUIRED", "A valid Idempotency-Key UUID is required.");
    }

    const property = await Property.findOne({
      _id: request.params.propertyId,
      isDemo: false,
      listingStatus: "approved",
      availability: "available",
    }).select("_id owner");
    if (!property || !property.owner) {
      fail(404, "PROPERTY_NOT_AVAILABLE_FOR_REQUEST", "Only approved, available, non-demonstration properties can receive requests.");
    }

    const existingKeyRequest = await PropertyRequest.findOne({
      tenant: request.user._id,
      idempotencyKey,
    });
    if (existingKeyRequest) {
      if (existingKeyRequest.property !== property._id || existingKeyRequest.requestType !== requestType) {
        fail(409, "IDEMPOTENCY_KEY_REUSED", "This request key was already used for a different request.");
      }
      return response.status(200).json({ success: true, data: existingKeyRequest, idempotent: true });
    }

    const activeKey = `${request.user._id}:${property._id}:${requestType}`;
    const active = await PropertyRequest.findOne({ activeKey }).select("_id").lean();
    if (active) {
      fail(409, "ACTIVE_REQUEST_EXISTS", "You already have an active request of this type for this property.");
    }

    const values = requestType === "enquiry"
      ? {
        subject: requireText(request.body?.subject, "subject", 5, 120),
        message: requireText(request.body?.message, "message", 10, 2000),
      }
      : {
        preferredDate: parseVisitDate(request.body?.preferredDate),
        preferredTime: parseVisitTime(request.body?.preferredTime),
        message: validateOptionalText(request.body?.message, "message", 1000),
      };

    const item = await PropertyRequest.create({
      requestType,
      property: property._id,
      tenant: request.user._id,
      owner: property.owner,
      status: "submitted",
      idempotencyKey,
      activeKey,
      ...values,
      history: [{ status: "submitted", actor: request.user._id, note: requestType === "enquiry" ? values.message : "" }],
    });
    await item.populate([
      { path: "property", select: propertySummary },
      { path: "tenant", select: "fullName email phone" },
    ]);
    return response.status(201).json({ success: true, data: item });
  } catch (error) {
    if (error.code === 11000) {
      const idempotencyKey = request.get("Idempotency-Key");
      const existing = await PropertyRequest.findOne({ tenant: request.user._id, idempotencyKey })
        .populate("property", propertySummary)
        .lean();
      if (existing && existing.property?._id === request.params.propertyId && existing.requestType === requestType) {
        return response.status(200).json({ success: true, data: existing, idempotent: true });
      }
      return response.status(409).json({
        success: false,
        error: { code: "ACTIVE_REQUEST_EXISTS", message: "You already have an active request of this type for this property." },
      });
    }
    return next(error);
  }
}

router.use(requireAuth);

router.get("/mine", requireTenant, async (request, response, next) => {
  try {
    const filter = requestQueryFilters(request.query, { tenant: request.user._id });
    const items = await PropertyRequest.find(filter)
      .populate("property", propertySummary)
      .sort({ createdAt: -1 })
      .lean();
    return response.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    return next(error);
  }
});

router.get("/received", requireOwner, async (request, response, next) => {
  try {
    const filter = requestQueryFilters(request.query, { owner: request.user._id });
    const items = await PropertyRequest.find(filter)
      .populate("property", propertySummary)
      .populate("tenant", "fullName email phone")
      .sort({ createdAt: -1 })
      .lean();
    return response.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    return next(error);
  }
});

router.post("/:propertyId/enquiries", requireTenant, async (request, response, next) => {
  return submitRequest(request, response, next, "enquiry");
});

router.post("/:propertyId/visits", requireTenant, async (request, response, next) => {
  return submitRequest(request, response, next, "visit");
});

router.patch("/:requestId/respond", requireOwner, async (request, response, next) => {
  try {
    const responseMessage = requireText(request.body?.response, "response", 5, 2000);
    const item = await PropertyRequest.findOneAndUpdate(
      {
        _id: request.params.requestId,
        owner: request.user._id,
        requestType: "enquiry",
        status: "submitted",
      },
      {
        $set: { status: "responded", ownerResponse: responseMessage, respondedAt: new Date() },
        $unset: { activeKey: 1 },
        $push: { history: { status: "responded", actor: request.user._id, note: responseMessage } },
      },
      { returnDocument: "after", runValidators: true },
    )
      .populate("property", propertySummary)
      .populate("tenant", "fullName email phone");
    if (!item) fail(404, "REQUEST_NOT_FOUND_OR_CLOSED", "This enquiry was not found for your listings or is no longer awaiting a response.");
    return response.status(200).json({ success: true, data: item });
  } catch (error) {
    return next(error);
  }
});

router.patch("/:requestId/visit-decision", requireOwner, async (request, response, next) => {
  try {
    const { decision } = request.body ?? {};
    if (!["accepted", "declined"].includes(decision)) {
      fail(400, "INVALID_VISIT_DECISION", "Visit decision must be accepted or declined.");
    }
    const declineReason = decision === "declined"
      ? requireText(request.body?.reason, "reason", 10, 1000)
      : validateOptionalText(request.body?.reason, "reason", 1000);
    const note = decision === "declined" ? declineReason : validateOptionalText(request.body?.message, "message", 1000);
    const item = await PropertyRequest.findOneAndUpdate(
      {
        _id: request.params.requestId,
        owner: request.user._id,
        requestType: "visit",
        status: "submitted",
      },
      {
        $set: {
          status: decision,
          declineReason: decision === "declined" ? declineReason : "",
          ownerResponse: decision === "accepted" ? note : "",
          respondedAt: new Date(),
        },
        $unset: { activeKey: 1 },
        $push: { history: { status: decision, actor: request.user._id, note } },
      },
      { returnDocument: "after", runValidators: true },
    )
      .populate("property", propertySummary)
      .populate("tenant", "fullName email phone");
    if (!item) fail(404, "REQUEST_NOT_FOUND_OR_CLOSED", "This visit request was not found for your listings or is no longer awaiting a decision.");
    return response.status(200).json({ success: true, data: item });
  } catch (error) {
    return next(error);
  }
});

export default router;
