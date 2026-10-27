
import type { Request, Response } from "express";
import mongoose from "mongoose";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Lesson from "../models/Lesson.js";

const courseFields = [
  "title",
  "slug",
  "shortDescription",
  "description",
  "category",
  "thumbnail",
  "price",
  "currency",
  "level",
] as const;

function validateCourseInput(body: unknown, isCreate: boolean) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "A valid course object is required." };
  }

  const input = body as Record<string, unknown>;
  const allowed = new Set<string>([
    ...courseFields,
    "status",
  ]);

  if (Object.keys(input).some((key) => !allowed.has(key))) {
    return { error: "Unknown or protected course field supplied." };
  }

  if (isCreate && courseFields.some((key) => !(key in input))) {
    return { error: "All required course fields must be supplied." };
  }

  const stringFields = [
    "title",
    "slug",
    "shortDescription",
    "description",
    "category",
    "thumbnail",
    "currency",
    "level",
    "status",
  ];

  for (const field of stringFields) {
    if (field in input && typeof input[field] !== "string") {
      return { error: `${field} must be a string.` };
    }
  }

  if ("price" in input &&
      (typeof input.price !== "number" ||
       !Number.isFinite(input.price) ||
       input.price < 0)) {
    return { error: "Price must be a valid non-negative number." };
  }

  const normalized: Record<string, unknown> = {};

  for (const field of courseFields) {
    if (!(field in input)) continue;

    const value = input[field];

    normalized[field] =
      typeof value === "string" ? value.trim() : value;
  }

  if ("slug" in normalized) {
    normalized.slug = String(normalized.slug)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  if ("currency" in normalized) {
    normalized.currency = String(normalized.currency).toUpperCase();
  }

  if ("level" in normalized &&
      !["beginner", "intermediate", "advanced", "all-levels"]
        .includes(String(normalized.level))) {
    return { error: "Invalid course level." };
  }

  if ("status" in input &&
      !["draft", "published", "archived"].includes(String(input.status))) {
    return { error: "Invalid course status." };
  }

  return { data: normalized };
}

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000;
}

// GET /api/admin/courses
export async function getAdminCourses(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const courses = await Course.find()
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    console.error("Admin course listing failed:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch courses.",
    });
  }
}

// POST /api/admin/courses
export async function createCourse(
  req: Request,
  res: Response,
): Promise<void> {
  const result = validateCourseInput(req.body, true);

  if ("error" in result) {
    res.status(400).json({
      success: false,
      message: result.error,
    });
    return;
  }

  try {
    const data = result.data!;
    const status = (req.body as Record<string, unknown>).status;

    const course = await Course.create({
      ...data,
      status: status ?? "draft",
      ...(status === "published" ? { publishedAt: new Date() } : {}),
    });

    res.status(201).json({
      success: true,
      message: "Course created successfully.",
      course,
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      res.status(409).json({
        success: false,
        message: "A course with this slug already exists.",
      });
      return;
    }

    console.error("Course creation failed:", error);
    res.status(400).json({
      success: false,
      message: "Unable to create course. Check the supplied fields.",
    });
  }
}

// PATCH /api/admin/courses/:id
export async function updateCourse(
  req: Request,
  res: Response,
): Promise<void> {
  const id = req.params.id;

  if (typeof id !== "string" || !mongoose.isValidObjectId(id)) {
    res.status(400).json({
      success: false,
      message: "Valid course ID required.",
    });
    return;
  }

  const result = validateCourseInput(req.body, false);

  if ("error" in result) {
    res.status(400).json({
      success: false,
      message: result.error,
    });
    return;
  }

  if (Object.keys(result.data!).length === 0) {
    res.status(400).json({
      success: false,
      message: "At least one editable field is required.",
    });
    return;
  }

  try {
    const update = result.data!;
    const existing = await Course.findById(id);

    if (!existing) {
      res.status(404).json({
        success: false,
        message: "Course not found.",
      });
      return;
    }

    const wasPublished = existing.status === "published";

    existing.set(update);

    if (wasPublished && existing.status === "published") {
      // Keep the original publication timestamp when editing.
    } else if (existing.status === "published") {
      existing.publishedAt = new Date();
    } else {
      existing.publishedAt = undefined;
    }

    await existing.save();

    res.status(200).json({
      success: true,
      message: "Course updated successfully.",
      course: existing,
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      res.status(409).json({
        success: false,
        message: "A course with this slug already exists.",
      });
      return;
    }

    console.error("Course update failed:", error);
    res.status(400).json({
      success: false,
      message: "Unable to update course. Check the supplied fields.",
    });
  }
}

// PATCH /api/admin/courses/:id/status
export async function updateCourseStatus(
  req: Request,
  res: Response,
): Promise<void> {
  const id = req.params.id;
  const { status } = req.body as { status?: unknown };

  if (typeof id !== "string" || !mongoose.isValidObjectId(id)) {
    res.status(400).json({
      success: false,
      message: "Valid course ID required.",
    });
    return;
  }

  if (!["draft", "published", "archived"].includes(String(status))) {
    res.status(400).json({
      success: false,
      message: "Status must be draft, published, or archived.",
    });
    return;
  }

  try {
    const course = await Course.findById(id);

    if (!course) {
      res.status(404).json({
        success: false,
        message: "Course not found.",
      });
      return;
    }

    course.status = status as "draft" | "published" | "archived";

    if (course.status === "published") {
      course.publishedAt ??= new Date();
    } else {
      course.publishedAt = undefined;
    }

    await course.save();

    res.status(200).json({
      success: true,
      message: "Course status updated successfully.",
      course,
    });
  } catch (error) {
    console.error("Course status update failed:", error);
    res.status(500).json({
      success: false,
      message: "Unable to update course status.",
    });
  }
}

// DELETE /api/admin/courses/:id
export async function deleteCourse(
  req: Request,
  res: Response,
): Promise<void> {
  const id = req.params.id;

  if (typeof id !== "string" || !mongoose.isValidObjectId(id)) {
    res.status(400).json({
      success: false,
      message: "Valid course ID required.",
    });
    return;
  }

  try {
    const course = await Course.findById(id);

    if (!course) {
      res.status(404).json({
        success: false,
        message: "Course not found.",
      });
      return;
    }

    const enrollmentCount = await Enrollment.countDocuments({
      course: course._id,
    });

    if (enrollmentCount > 0) {
      res.status(409).json({
        success: false,
        message:
          "This course has enrollments. Archive it instead to preserve student records.",
        enrollmentCount,
      });
      return;
    }

    await mongoose.connection.transaction(async (session) => {
      await Lesson.deleteMany({ course: course._id }, { session });
      await Course.deleteOne({ _id: course._id }, { session });
    });

    res.status(200).json({
      success: true,
      message: "Course and its lessons deleted successfully.",
    });
  } catch (error) {
    console.error("Course deletion failed:", error);
    res.status(500).json({
      success: false,
      message: "Unable to delete course.",
    });
  }
}
