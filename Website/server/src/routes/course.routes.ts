import { Router } from "express";

import {
  getPublishedCourses,
  getPublishedCourseBySlug,
} from "../controllers/course.controller.js";

import {
  getCourseLesson,
  getCourseLessons,
  completeCourseLesson,
} from "../controllers/lesson.controller.js";

import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

// Public endpoints: published courses only
router.get("/", getPublishedCourses);
router.patch(
  "/:slug/lessons/:lessonSlug/complete",
  authenticateToken,
  completeCourseLesson,
);
router.get("/:slug", getPublishedCourseBySlug);

// Protected endpoints: enrolled students can access course lessons
// Route order: specific lesson routes are registered before /:slug
router.get("/:slug/lessons/:lessonSlug", authenticateToken, getCourseLesson);

router.get("/:slug/lessons", authenticateToken, getCourseLessons);

export default router;
