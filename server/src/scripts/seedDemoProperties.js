import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import { demoProperties } from "../data/demoProperties.js";
import { nationwideDemoProperties } from "../data/nationwideDemoProperties.js";
import { findLocation } from "../data/indiaLocations.js";
import Property from "../models/Property.js";

try {
  await connectDB();
  const allDemoProperties = [...demoProperties, ...nationwideDemoProperties];
  const operations = allDemoProperties.map((property) => {
    const [legacyLocality, legacyCity] = property.location.split(",").map((part) => part.trim());
    const structuredLocation = findLocation(
      property.state ?? "Maharashtra",
      property.city ?? legacyCity,
      property.city ? property.locality || undefined : legacyLocality,
    );
    if (!structuredLocation) {
      throw new Error(`Demo location could not be mapped: ${property.location}`);
    }
    return {
      updateOne: {
        filter: { _id: property._id, isDemo: true },
        update: { $setOnInsert: { ...property, ...structuredLocation, isDemo: true, listingStatus: "demo" } },
        upsert: true,
      },
    };
  });
  const result = await Property.bulkWrite(operations);

  console.log(
    `Demo seed complete: ${result.upsertedCount} inserted, ${result.matchedCount} already present; ${allDemoProperties.length} fictional records in the seed set.`,
  );
} catch (error) {
  console.error("Demo seed failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
