
import type { RequestHandler } from "express";
import mongoose from "mongoose";
import User from "../models/User.js";

export const requireAdmin: RequestHandler = async (
  _req,
  res,
  next,
) => {
  const authUser = res.locals.authUser as
    | { sub: string; role: "student" | "admin" }
    | undefined;

  if (!authUser?.sub) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  if (!mongoose.isValidObjectId(authUser.sub)) {
    res.status(401).json({
      success: false,
      message: "Invalid authenticated user",
    });
    return;
  }

  try {
    const user = await User.findById(authUser.sub)
      .select("role isActive")
      .lean();

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: "User account is unavailable",
      });
      return;
    }

    if (user.role !== "admin") {
      res.status(403).json({
        success: false,
        message: "Admin access required",
      });
      return;
    }

    res.locals.authUser = {
      sub: authUser.sub,
      role: "admin",
    };

    next();
  } catch (error: unknown) {
    console.error("Admin authorization failed:", error);

    res.status(500).json({
      success: false,
      message: "Unable to verify admin permissions",
    });
  }
};
