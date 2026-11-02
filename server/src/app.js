import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import { fileURLToPath } from "node:url";
import authRoutes from "./routes/authRoutes.js";
import adminPropertyRoutes from "./routes/adminPropertyRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import ownerPropertyRoutes from "./routes/ownerPropertyRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import propertyRequestRoutes from "./routes/propertyRequestRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();
const uploadDirectory = fileURLToPath(new URL("../uploads/", import.meta.url));
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, origin || allowedOrigins[0]);
    }
    return callback(null, false);
  },
  credentials: true,
}));
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use("/uploads", express.static(uploadDirectory, { fallthrough: true, maxAge: "1d" }));
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/owner/properties", ownerPropertyRoutes);
app.use("/api/admin/properties", adminPropertyRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/requests", propertyRequestRoutes);

app.get("/", (_request, response) => {
  response.json({ name: "EstateSphere API", status: "running" });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
