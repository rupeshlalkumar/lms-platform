import { Router } from "express";
import {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { rateLimit } from "express-rate-limit";

const router = Router();

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many password reset requests. Please try again later.",
  },
});

router.post("/register", register);
router.post("/login", login);

router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  forgotPassword
);

router.post("/reset-password", resetPassword);

router.post("/logout", authenticateToken, logout);
router.get("/me", authenticateToken, getMe);

router.get("/protected", authenticateToken, (_req, res) => {
  res.json({
    success: true,
    message: "Authenticated request successful",
    user: res.locals.authUser,
  });
});

export default router;
