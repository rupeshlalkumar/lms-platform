import { Router } from "express";
import {
  enrollInCourse,
  getMyEnrollments,
} from "../controllers/enrollment.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

// Logged-in student ke courses
router.get("/", authenticateToken, getMyEnrollments);

// Course mein enrollment create karna
router.post("/", authenticateToken, enrollInCourse);

export default router;