
import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";

type AuthPayload = {
  sub: string;
  role: "student" | "admin";
};

export const authenticateToken: RequestHandler = (
  req,
  res,
  next
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Access token required",
    });
    return;
  }

  const token = authHeader.slice(7);
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    res.status(500).json({
      success: false,
      message: "Authentication is not configured",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);

    if (
      typeof decoded === "string" ||
      typeof decoded.sub !== "string" ||
      (decoded.role !== "student" && decoded.role !== "admin")
    ) {
      res.status(401).json({
        success: false,
        message: "Invalid access token",
      });
      return;
    }

    const authUser: AuthPayload = {
      sub: decoded.sub,
      role: decoded.role,
    };

    res.locals.authUser = authUser;
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired access token",
    });
  }
};
