import mongoose from "mongoose";

const historySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["submitted", "responded", "accepted", "declined"],
      required: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { _id: false },
);

const propertyRequestSchema = new mongoose.Schema(
  {
    requestType: {
      type: String,
      enum: ["enquiry", "visit"],
      required: true,
      index: true,
    },
    property: {
      type: String,
      ref: "Property",
      required: true,
      index: true,
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["submitted", "responded", "accepted", "declined"],
      required: true,
      default: "submitted",
      index: true,
    },
    subject: {
      type: String,
      trim: true,
      minlength: 5,
      maxlength: 120,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
      validate: {
        validator(value) {
          return this.requestType === "visit" || value.trim().length >= 10;
        },
        message: "Enquiry messages must contain at least 10 characters.",
      },
    },
    preferredDate: {
      type: String,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    preferredTime: {
      type: String,
      match: /^(?:[01]\d|2[0-3]):[0-5]\d$/,
    },
    ownerResponse: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    declineReason: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    respondedAt: {
      type: Date,
      default: null,
    },
    idempotencyKey: {
      type: String,
      required: true,
      minlength: 36,
      maxlength: 36,
    },
    activeKey: {
      type: String,
      default: undefined,
    },
    history: {
      type: [historySchema],
      default: [],
    },
  },
  { timestamps: true, versionKey: false },
);

propertyRequestSchema.index({ tenant: 1, idempotencyKey: 1 }, { unique: true });
propertyRequestSchema.index({ activeKey: 1 }, { unique: true, sparse: true });
propertyRequestSchema.index({ tenant: 1, createdAt: -1 });
propertyRequestSchema.index({ owner: 1, createdAt: -1 });

const PropertyRequest = mongoose.model("PropertyRequest", propertyRequestSchema);

export default PropertyRequest;
