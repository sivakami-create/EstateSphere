import mongoose from "mongoose";

export default async function connectDB() {
  const { MONGODB_URI } = process.env;
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set. Copy server/.env.example to server/.env and configure the database connection string.");
  }

  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  });

  console.log(`MongoDB connected: ${mongoose.connection.name}`);
}
