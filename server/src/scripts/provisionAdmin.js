import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";

const { ADMIN_FULL_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, CONFIRM_ADMIN_PROVISIONING } = process.env;

if (CONFIRM_ADMIN_PROVISIONING !== "YES") {
  console.error("Administrator provisioning stopped. Set CONFIRM_ADMIN_PROVISIONING=YES to explicitly authorize this operation.");
  process.exitCode = 1;
} else if (
  typeof ADMIN_FULL_NAME !== "string"
  || ADMIN_FULL_NAME.trim().length < 2
  || ADMIN_FULL_NAME.trim().length > 100
  || typeof ADMIN_EMAIL !== "string"
  || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ADMIN_EMAIL.trim())
  || typeof ADMIN_PASSWORD !== "string"
  || ADMIN_PASSWORD.length < 12
  || Buffer.byteLength(ADMIN_PASSWORD, "utf8") > 72
) {
  console.error("Administrator provisioning requires ADMIN_FULL_NAME, a valid ADMIN_EMAIL, and an ADMIN_PASSWORD of at least 12 characters and no more than 72 bytes.");
  process.exitCode = 1;
} else if (!process.env.MONGODB_URI || !process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error("Administrator provisioning requires valid MONGODB_URI and JWT_SECRET environment settings.");
  process.exitCode = 1;
} else {
  try {
    await connectDB();
    const email = ADMIN_EMAIL.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await User.updateOne(
      { email },
      {
        $set: {
          fullName: ADMIN_FULL_NAME.trim(),
          email,
          passwordHash,
          role: "admin",
        },
      },
      { upsert: true, runValidators: true },
    );
    console.log("Administrator account provisioned. No password or token was logged.");
  } catch (error) {
    console.error(`Administrator provisioning failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
