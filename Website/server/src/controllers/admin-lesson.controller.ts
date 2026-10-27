import type { Request, Response } from "express";
import mongoose, { type HydratedDocument } from "mongoose";
import Course, { type CourseDocument } from "../models/Course.js";
import Lesson from "../models/Lesson.js";
import Enrollment from "../models/Enrollment.js";

const editableFields = [
  "title",
  "slug",
  "description",
  "content",
  "order",
  "status",
] as const;

type LessonInput = {
  title?: string;
  slug?: string;
  description?: string;
  content?: string;
  order?: number;
  status?: "draft" | "published";
};

type ValidationResult =
  | { error: string }
  | { data: LessonInput };

type FindCourseResult =
  | {
      error: string;
      status: 400 | 404;
    }
  | {
      course: HydratedDocument<CourseDocument>;
    };

function validateLessonInput(
  body: unknown,
  isCreate: boolean,
): ValidationResult {
  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body)
  ) {
    return { error: "A valid lesson object is required." };
  }

  const input = body as Record<string, unknown>;
  const allowed = new Set<string>(editableFields);

  if (Object.keys(input).some((key) => !allowed.has(key))) {
    return {
      error: "Unknown or protected lesson field supplied.",
    };
  }

  if (
    isCreate &&
    ["title", "slug", "content", "order"].some(
      (key) => !(key in input),
    )
  ) {
    return {
      error: "Title, slug, content and order are required.",
    };
  }

  for (const field of [
    "title",
    "slug",
    "description",
    "content",
    "status",
  ]) {
    if (
      field in input &&
      typeof input[field] !== "string"
    ) {
      return { error: `${field} must be a string.` };
    }
  }

  if (
    "order" in input &&
    (typeof input.order !== "number" ||
      !Number.isInteger(input.order) ||
      input.order < 1)
  ) {
    return {
      error: "Order must be a positive integer.",
    };
  }

  if (
    "status" in input &&
    !["draft", "published"].includes(
      String(input.status),
    )
  ) {
    return {
      error: "Status must be draft or published.",
    };
  }

  const normalized: Record<string, unknown> = {};

  for (const field of editableFields) {
    if (!(field in input)) {
      continue;
    }

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

  if (
    "title" in normalized &&
    String(normalized.title).length < 3
  ) {
    return {
      error: "Title must contain at least 3 characters.",
    };
  }

  if (
    "slug" in normalized &&
    !String(normalized.slug)
  ) {
    return {
      error: "A valid lesson slug is required.",
    };
  }

  if (
    "content" in normalized &&
    !String(normalized.content)
  ) {
    return {
      error: "Lesson content cannot be empty.",
    };
  }

  return {
    data: normalized as LessonInput,
  };
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

async function findCourse(
  courseId: unknown,
): Promise<FindCourseResult> {
  if (
    typeof courseId !== "string" ||
    !mongoose.isValidObjectId(courseId)
  ) {
    return {
      error: "A valid course ID is required.",
      status: 400,
    };
  }

  const course = await Course.findById(courseId);

  if (!course) {
    return {
      error: "Course not found.",
      status: 404,
    };
  }

  return { course };
}

// GET /api/admin/courses/:courseId/lessons
export async function getAdminLessons(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const result = await findCourse(req.params.courseId);

    if ("error" in result) {
      res.status(result.status).json({
        success: false,
        message: result.error,
      });
      return;
    }

    const lessons = await Lesson.find({
      course: result.course._id,
    })
      .sort({ order: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: lessons.length,
      lessons,
    });
  } catch (error) {
    console.error("Admin lesson listing failed:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch lessons.",
    });
  }
}

// POST /api/admin/courses/:courseId/lessons
export async function createAdminLesson(
  req: Request,
  res: Response,
): Promise<void> {
  const validation = validateLessonInput(req.body, true);

  if ("error" in validation) {
    res.status(400).json({
      success: false,
      message: validation.error,
    });
    return;
  }

  try {
    const result = await findCourse(req.params.courseId);

    if ("error" in result) {
      res.status(result.status).json({
        success: false,
        message: result.error,
      });
      return;
    }

    const data = validation.data;

    const lesson = await Lesson.create({
      ...data,
      course: result.course._id,
      description: data.description ?? "",
      status: data.status ?? "draft",
    });

    res.status(201).json({
      success: true,
      message: "Lesson created successfully.",
      lesson,
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      res.status(409).json({
        success: false,
        message:
          "This lesson slug or order already exists in the course.",
      });
      return;
    }

    console.error("Admin lesson creation failed:", error);

    res.status(400).json({
      success: false,
      message:
        "Unable to create lesson. Check the supplied fields.",
    });
  }
}

// PATCH /api/admin/courses/:courseId/lessons/:lessonId
export async function updateAdminLesson(
  req: Request,
  res: Response,
): Promise<void> {
  const { courseId, lessonId } = req.params;

  if (
    typeof lessonId !== "string" ||
    !mongoose.isValidObjectId(lessonId)
  ) {
    res.status(400).json({
      success: false,
      message: "A valid lesson ID is required.",
    });
    return;
  }

  const validation = validateLessonInput(req.body, false);

  if ("error" in validation) {
    res.status(400).json({
      success: false,
      message: validation.error,
    });
    return;
  }

  if (Object.keys(validation.data).length === 0) {
    res.status(400).json({
      success: false,
      message: "At least one editable field is required.",
    });
    return;
  }

  try {
    const result = await findCourse(courseId);

    if ("error" in result) {
      res.status(result.status).json({
        success: false,
        message: result.error,
      });
      return;
    }

    const lesson = await Lesson.findOne({
      _id: lessonId,
      course: result.course._id,
    });

    if (!lesson) {
      res.status(404).json({
        success: false,
        message: "Lesson not found in this course.",
      });
      return;
    }

    lesson.set(validation.data);
    await lesson.save();

    res.status(200).json({
      success: true,
      message: "Lesson updated successfully.",
      lesson,
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      res.status(409).json({
        success: false,
        message:
          "This lesson slug or order already exists in the course.",
      });
      return;
    }

    console.error("Admin lesson update failed:", error);

    res.status(400).json({
      success: false,
      message:
        "Unable to update lesson. Check the supplied fields.",
    });
  }
}

// DELETE /api/admin/courses/:courseId/lessons/:lessonId
export async function deleteAdminLesson(
  req: Request,
  res: Response,
): Promise<void> {
  const { courseId, lessonId } = req.params;

  if (
    typeof lessonId !== "string" ||
    !mongoose.isValidObjectId(lessonId)
  ) {
    res.status(400).json({
      success: false,
      message: "A valid lesson ID is required.",
    });
    return;
  }

  try {
    const result = await findCourse(courseId);

    if ("error" in result) {
      res.status(result.status).json({
        success: false,
        message: result.error,
      });
      return;
    }

    const lesson = await Lesson.findOne({
      _id: lessonId,
      course: result.course._id,
    });

    if (!lesson) {
      res.status(404).json({
        success: false,
        message: "Lesson not found in this course.",
      });
      return;
    }

    const completedByStudent = await Enrollment.exists({
      course: result.course._id,
      completedLessons: lesson._id,
    });

    if (completedByStudent) {
      res.status(409).json({
        success: false,
        message:
          "Students have completed this lesson. Change its status to draft instead of deleting it.",
      });
      return;
    }

    await lesson.deleteOne();

    res.status(200).json({
      success: true,
      message: "Lesson deleted successfully.",
    });
  } catch (error) {
    console.error("Admin lesson deletion failed:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete lesson.",
    });
  }
}