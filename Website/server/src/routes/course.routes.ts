
import { Router } from "express";
import { getPublishedCourses,  getPublishedCourseBySlug, } from "../controllers/course.controller.js";

const router = Router();

// Public endpoint: published courses only
router.get("/", getPublishedCourses);
router.get("/:slug", getPublishedCourseBySlug);

export default router;
