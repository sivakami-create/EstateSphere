import mongoose from "mongoose";

export const propertyCategories = [
  "girls-pg",
  "boys-pg",
  "shared-flats",
  "1rk-1bhk",
  "2bhk-3bhk",
  "independent-houses",
  "residential-sale",
];

const propertySchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      trim: true,
      match: /^[a-z0-9-]+$/,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 140,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 2000,
    },
    category: {
      type: String,
      required: true,
      enum: propertyCategories,
      index: true,
    },
    propertyType: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
      index: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
      index: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      index: true,
    },
    locality: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
      index: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 240,
    },
    monthlyRent: {
      type: Number,
      required: true,
      min: 0,
      validate: Number.isFinite,
      index: true,
    },
    securityDeposit: {
      type: Number,
      required: true,
      min: 0,
      validate: Number.isFinite,
    },
    furnishing: {
      type: String,
      required: true,
      enum: ["Unfurnished", "Semi-furnished", "Furnished", "Fully furnished"],
    },
    amenities: {
      type: [{ type: String, trim: true, minlength: 1, maxlength: 80 }],
      default: [],
      validate: [(items) => items.length <= 30, "A property may have at most 30 amenities."],
    },
    images: {
      type: [{ type: String, trim: true, minlength: 1, maxlength: 500 }],
      required: true,
      validate: [
        (items) => items.length > 0 && items.length <= 12,
        "A property must have between 1 and 12 image paths.",
      ],
    },
    availability: {
      type: String,
      required: true,
      enum: ["available", "unavailable"],
      default: "available",
      index: true,
    },
    listingStatus: {
      type: String,
      required: true,
      enum: ["demo", "active", "pending", "approved", "rejected", "inactive", "draft", "archived"],
      default: "demo",
      index: true,
    },
    bedrooms: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    accommodation: {
      type: String,
      required: true,
      trim: true,
      maxlength: 240,
    },
    isDemo: {
      type: Boolean,
      required: true,
      default: false,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required() {
        return !this.isDemo;
      },
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    reviewHistory: {
      type: [{
        status: {
          type: String,
          enum: ["approved", "rejected"],
          required: true,
        },
        reviewedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        reviewedAt: {
          type: Date,
          required: true,
        },
        reason: {
          type: String,
          trim: true,
          maxlength: 1000,
          default: "",
        },
      }],
      default: [],
    },
    transactionType: {
      type: String,
      enum: ["rent", "sale"],
      default: "rent",
      required: true,
      index: true,
    },
    askingPrice: {
      type: Number,
      min: 0,
      validate: {
        validator(value) {
          return this.transactionType !== "sale" || Number.isFinite(value);
        },
        message: "Asking price is required for sale listings.",
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

propertySchema.path("monthlyRent").required(function requiredForRent() {
  return this.transactionType !== "sale";
});
propertySchema.path("securityDeposit").required(function requiredForRent() {
  return this.transactionType !== "sale";
});
propertySchema.index({ category: 1, listingStatus: 1, availability: 1 });
propertySchema.index({ state: 1, city: 1, locality: 1 });
propertySchema.index({ owner: 1, createdAt: -1 });

const Property = mongoose.model("Property", propertySchema);

export default Property;
