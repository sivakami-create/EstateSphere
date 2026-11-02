import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import { findLocation } from "../data/indiaLocations.js";
import Property from "../models/Property.js";

try {
  await connectDB();
  const properties = await Property.collection.find({
    isDemo: true,
    location: { $exists: true, $type: "string" },
  }).toArray();
  let migrated = 0;
  let skipped = 0;

  for (const property of properties) {
    const [locality, city] = property.location.split(",").map((part) => part.trim());
    const structuredLocation = findLocation("Maharashtra", city, locality);
    if (!structuredLocation) {
      skipped += 1;
      continue;
    }

    const fieldsToSet = {};
    if (!property.state) fieldsToSet.state = structuredLocation.state;
    if (!property.city) fieldsToSet.city = structuredLocation.city;
    if (!property.locality) fieldsToSet.locality = structuredLocation.locality;
    if (Object.keys(fieldsToSet).length === 0) continue;

    const result = await Property.collection.updateOne(
      { _id: property._id },
      { $set: fieldsToSet },
    );
    migrated += result.modifiedCount;
  }

  console.log(`Location migration complete: ${migrated} updated, ${skipped} unrecognized demonstration locations skipped.`);
} catch (error) {
  console.error("Property location migration failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
