
import { Router } from "express";
import {
  getAdminLessons,
  createAdminLesson,
  updateAdminLesson,
  deleteAdminLesson,
} from "../controllers/admin-lesson.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";

const router = Router();

// Every endpoint requires authentication and admin role.
router.use(authenticateToken, requireAdmin);

// GET and POST /api/admin/courses/:courseId/lessons
router.get("/courses/:courseId/lessons", getAdminLessons);
router.post("/courses/:courseId/lessons", createAdminLesson);

// PATCH and DELETE /api/admin/courses/:courseId/lessons/:lessonId
router.patch(
  "/courses/:courseId/lessons/:lessonId",
  updateAdminLesson,
);
router.delete(
  "/courses/:courseId/lessons/:lessonId",
  deleteAdminLesson,
);

export default router;
