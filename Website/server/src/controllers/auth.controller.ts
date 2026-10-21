import { sendEmail } from "../services/email.service.js";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { randomBytes, createHash } from "node:crypto";
import User from "../models/User.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/auth.validator.js";

// Register
export async function register(req: Request, res: Response): Promise<void> {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      success: false,
      message: "Invalid registration details",
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  try {
    const { name, email, password } = result.data;

    const existingUser = await User.findOne({ email }).lean();

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: "student",
    });

    res.status(201).json({
      success: true,
      message: "Student registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: unknown) {
    // Handles duplicate email races enforced by MongoDB's unique index.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
      return;
    }

    console.error("Registration failed:", error);

    res.status(500).json({
      success: false,
      message: "Unable to register at this time",
    });
  }
}

// Login
export async function login(req: Request, res: Response): Promise<void> {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      success: false,
      message: "Invalid login details",
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  try {
    const { email, password } = result.data;

    // passwordHash is excluded by default in the User model.
    const user = await User.findOne({ email }).select("+passwordHash");

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("JWT_SECRET is missing from .env");
    }

    const accessToken = jwt.sign(
      {
        role: user.role,
      },
      jwtSecret,
      {
        subject: user.id,
        expiresIn: "15m",
      },
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      tokenType: "Bearer",
      expiresIn: 900,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: unknown) {
    console.error("Login failed:", error);

    res.status(500).json({
      success: false,
      message: "Unable to log in at this time",
    });
  }
}

// Logout
export function logout(_req: Request, res: Response): void {
  res.status(200).json({
    success: true,
    message:
      "Logged out successfully. Please clear the access token on the client.",
  });
}

// Role
export async function getMe(_req: Request, res: Response): Promise<void> {
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

  try {
    const user = await User.findById(authUser.sub).select(
      "name email role isActive createdAt",
    );

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: "User account is unavailable",
      });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get current user failed:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve current user",
    });
  }
}

const PASSWORD_RESET_TTL_MS = 15 * 60 * 1000;

function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// Forgot Password
export async function forgotPassword(
  req: Request,
  res: Response,
): Promise<void> {
  const result = forgotPasswordSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      success: false,
      message: "Please provide a valid email address",
    });
    return;
  }

  try {
    const { email } = result.data;

    const user = await User.findOne({
      email,
      isActive: true,
    });

    // Same response for existing and non-existing accounts.
    if (user) {
      const resetToken = randomBytes(32).toString("hex");
      const tokenHash = hashResetToken(resetToken);
      const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);

      user.set({
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: expiresAt,
      });

      await user.save();

      // Email delivery will be added in the next step.
      // Never return or log resetToken in production.
      const resetUrl = new URL(
        "/reset-password",
        process.env.CLIENT_URL || "http://localhost:5173",
      );

      resetUrl.searchParams.set("token", resetToken);

      await sendEmail({
        to: user.email,
        subject: "Reset your MRL Vidya World password",
        text: `You requested a password reset. Open this link within 15 minutes to set a new password: ${resetUrl.toString()}\n\nIf you did not request this, ignore this email.`,
        html: `
    <h2>MRL Vidya World</h2>
    <p>You requested a password reset.</p>
    <p>
      <a href="${resetUrl.toString()}">Reset your password</a>
    </p>
    <p>This link expires in 15 minutes.</p>
    <p>If you did not request this, you can ignore this email.</p>
  `,
      });
    }

    res.status(200).json({
      success: true,
      message:
        "If an eligible account exists for this email, password reset instructions will be sent.",
    });
  } catch (error: unknown) {
    console.error("Forgot password failed:", error);

    res.status(500).json({
      success: false,
      message: "Unable to process the request at this time",
    });
  }
}

// Reset Password
export async function resetPassword(
  req: Request,
  res: Response,
): Promise<void> {
  const result = resetPasswordSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      success: false,
      message: "Invalid reset request",
    });
    return;
  }

  try {
    const { token, newPassword } = result.data;
    const tokenHash = hashResetToken(token);

    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() },
      isActive: true,
    }).select("+passwordResetTokenHash +passwordResetExpiresAt");

    if (!user) {
      res.status(400).json({
        success: false,
        message: "Invalid or expired password reset token",
      });
      return;
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);

    user.set({
      passwordResetTokenHash: undefined,
      passwordResetExpiresAt: undefined,
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password has been reset successfully. Please log in again.",
    });
  } catch (error: unknown) {
    console.error("Reset password failed:", error);

    res.status(500).json({
      success: false,
      message: "Unable to reset password at this time",
    });
  }
}
