import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function requireAuth(request, response, next) {
  const token = request.cookies?.estateSphereToken;
  if (!token) {
    return response.status(401).json({
      success: false,
      error: { code: "AUTHENTICATION_REQUIRED", message: "Sign in to continue." },
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (typeof payload !== "object" || typeof payload.sub !== "string") {
      return response.status(401).json({
        success: false,
        error: { code: "INVALID_TOKEN", message: "Your session is invalid. Please sign in again." },
      });
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      return response.status(401).json({
        success: false,
        error: { code: "USER_NOT_FOUND", message: "Your account could not be found. Please sign in again." },
      });
    }

    request.user = user;
    return next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return response.status(401).json({
        success: false,
        error: { code: "INVALID_TOKEN", message: "Your session has expired. Please sign in again." },
      });
    }
    return next(error);
  }
}

export function requireRole(...allowedRoles) {
  return (request, response, next) => {
    if (!request.user || !allowedRoles.includes(request.user.role)) {
      return response.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Your account does not have access to this page." },
      });
    }
    return next();
  };
}
