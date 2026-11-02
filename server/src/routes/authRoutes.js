import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { rateLimit } from "express-rate-limit";
import User, { publicRegistrationRoles, userRoles } from "../models/User.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = Router();
const sessionDurationMs = 12 * 60 * 60 * 1000;
const sessionDurationSeconds = sessionDurationMs / 1000;
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: "RATE_LIMITED", message: "Too many authentication requests. Try again later." },
  },
});

function publicUser(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone ?? null,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function setSessionCookie(response, userId) {
  const token = jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: sessionDurationSeconds,
    issuer: "estatesphere-api",
    audience: "estatesphere-web",
  });

  response.cookie("estateSphereToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: sessionDurationMs,
    path: "/",
  });
}

function validateEmail(email) {
  return typeof email === "string"
    && email.length <= 254
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

router.post("/register", authLimiter, async (request, response, next) => {
  try {
    const { fullName, email, password, phone, role = "tenant" } = request.body ?? {};
    const errors = [];

    if (typeof fullName !== "string" || fullName.trim().length < 2 || fullName.trim().length > 100) {
      errors.push("Full name must be between 2 and 100 characters.");
    }
    if (!validateEmail(email)) {
      errors.push("Enter a valid email address.");
    }
    if (typeof password !== "string" || password.length < 12 || Buffer.byteLength(password, "utf8") > 72) {
      errors.push("Password must be at least 12 characters and no more than 72 bytes.");
    }
    if (phone !== undefined && (typeof phone !== "string" || !/^\+?[0-9\s()-]{7,20}$/.test(phone.trim()))) {
      errors.push("Enter a valid phone number or leave it blank.");
    }
    if (!publicRegistrationRoles.includes(role)) {
      errors.push(`Role must be one of: ${publicRegistrationRoles.join(", ")}. Administrator accounts cannot be created through public registration.`);
    }

    if (errors.length) {
      return response.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: errors.join(" ") },
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      passwordHash,
      ...(phone?.trim() ? { phone: phone.trim() } : {}),
      role,
    });

    setSessionCookie(response, user.id);
    return response.status(201).json({ success: true, data: publicUser(user) });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.email) {
      return response.status(409).json({
        success: false,
        error: { code: "EMAIL_ALREADY_REGISTERED", message: "An account with this email already exists." },
      });
    }
    return next(error);
  }
});

router.post("/login", authLimiter, async (request, response, next) => {
  try {
    const { email, password } = request.body ?? {};
    if (!validateEmail(email) || typeof password !== "string" || password.length < 1 || Buffer.byteLength(password, "utf8") > 72) {
      return response.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Enter a valid email address and password." },
      });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+passwordHash");
    const passwordMatches = user ? await bcrypt.compare(password, user.passwordHash) : false;
    if (!user || !passwordMatches) {
      return response.status(401).json({
        success: false,
        error: { code: "INVALID_CREDENTIALS", message: "Email or password is incorrect." },
      });
    }

    setSessionCookie(response, user.id);
    return response.status(200).json({ success: true, data: publicUser(user) });
  } catch (error) {
    return next(error);
  }
});

router.get("/me", requireAuth, (request, response) => {
  return response.status(200).json({ success: true, data: publicUser(request.user) });
});

router.post("/logout", (_request, response) => {
  response.clearCookie("estateSphereToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  return response.status(200).json({ success: true, data: { message: "You have been signed out." } });
});

router.get("/workspace/:role", requireAuth, (request, response, next) => {
  const { role } = request.params;
  if (!userRoles.includes(role)) {
    return next();
  }
  return requireRole(role)(request, response, () => {
    response.status(200).json({ success: true, data: publicUser(request.user) });
  });
});

export default router;
