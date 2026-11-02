import mongoose from "mongoose";

export const userRoles = ["tenant", "owner", "pg_operator", "admin"];
export const publicRegistrationRoles = ["tenant", "owner", "pg_operator"];

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 20,
      default: undefined,
      validate: {
        validator: (value) => value === undefined || /^\+?[0-9\s()-]{7,20}$/.test(value),
        message: "Phone number must contain 7 to 20 valid phone characters.",
      },
    },
    role: {
      type: String,
      required: true,
      enum: userRoles,
      default: "tenant",
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const User = mongoose.model("User", userSchema);

export default User;
