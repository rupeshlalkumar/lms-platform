
import { Router } from "express";
import {
  getAdminCourses,
  createCourse,
  updateCourse,
  updateCourseStatus,
  deleteCourse,
} from "../controllers/admin-course.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";

const router = Router();

// Every endpoint requires authentication and admin role.
router.use(authenticateToken, requireAdmin);

router.get("/courses", getAdminCourses);
router.post("/courses", createCourse);
router.patch("/courses/:id/status", updateCourseStatus);
router.patch("/courses/:id", updateCourse);
router.delete("/courses/:id", deleteCourse);

export default router;
