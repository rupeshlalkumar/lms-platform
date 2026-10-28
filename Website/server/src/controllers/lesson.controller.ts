import type { Request, Response } from "express";
import mongoose from "mongoose";

import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Lesson from "../models/Lesson.js";
import User from "../models/User.js";

type AuthUser = {
  sub: string;
  role: "student" | "admin";
};

async function getEnrolledCourse(
  slug: string,
  authUser: AuthUser | undefined,
  res: Response,
) {
  if (!authUser) {
    res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
    return null;
  }

  if (authUser.role !== "student") {
    res.status(403).json({
      success: false,
      message: "Only enrolled students can access lessons.",
    });
    return null;
  }

  if (!mongoose.isValidObjectId(authUser.sub)) {
    res.status(401).json({
      success: false,
      message: "Invalid user identity.",
    });
    return null;
  }

  const student = await User.findOne({
    _id: authUser.sub,
    role: "student",
    isActive: true,
  })
    .select("_id")
    .lean();

  if (!student) {
    res.status(403).json({
      success: false,
      message: "Active student account required.",
    });
    return null;
  }

  const course = await Course.findOne({
    slug,
    status: "published",
  })
    .select("_id title slug")
    .lean();

  if (!course) {
    res.status(404).json({
      success: false,
      message: "Published course nahi mila.",
    });
    return null;
  }

  const enrollment = await Enrollment.findOne({
    student: student._id,
    course: course._id,
    status: { $in: ["active", "completed"] },
  })
    .select("_id status completedLessons progressPercentage")
    .lean();

  if (!enrollment) {
    res.status(403).json({
      success: false,
      message:
        "Is course ke lessons access karne ke liye enrollment zaroori hai.",
    });
    return null;
  }

  return { course, enrollment };
}

/**
 * GET /api/courses/:slug/lessons
 * Sirf enrolled students ke published lessons return karta hai.
 */
export async function getCourseLessons(req: Request, res: Response) {
  try {
    const slug =
      typeof req.params.slug === "string"
        ? req.params.slug.trim().toLowerCase()
        : "";

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Valid course slug required.",
      });
    }

    const result = await getEnrolledCourse(
      slug,
      res.locals.authUser as AuthUser | undefined,
      res,
    );

    if (!result) {
      return;
    }

    const lessons = await Lesson.find({
      course: result.course._id,
      status: "published",
    })
      .select("title slug description order content videoUrl")
      .sort({ order: 1 })
      .lean();

    const completedIds = new Set<string>(
      (result.enrollment.completedLessons ?? []).map(
        (id: mongoose.Types.ObjectId) => id.toString(),
      ),
    );

    const completedCount = lessons.filter((lesson) =>
      completedIds.has(lesson._id.toString()),
    ).length;

    const progressPercentage =
      lessons.length === 0
        ? 0
        : Math.round((completedCount / lessons.length) * 100);

    return res.status(200).json({
      success: true,
      course: {
        id: result.course._id.toString(),
        title: result.course.title,
        slug: result.course.slug,
      },
      count: lessons.length,
      progress: {
        completedLessons: completedCount,
        totalLessons: lessons.length,
        percentage: progressPercentage,
      },
      lessons: lessons.map((lesson) => ({
        id: lesson._id.toString(),
        title: lesson.title,
        slug: lesson.slug,
        description: lesson.description,
        order: lesson.order,
        content: lesson.content,
        videoUrl: lesson.videoUrl ?? "",
        isCompleted: completedIds.has(lesson._id.toString()),
      })),
    });
  } catch (error) {
    console.error("Fetching course lessons failed:", error);

    return res.status(500).json({
      success: false,
      message: "Course lessons load nahi ho paaye.",
    });
  }
}

/**
 * GET /api/courses/:slug/lessons/:lessonSlug
 * Sirf enrolled students ke liye ek published lesson return karta hai.
 */
export async function getCourseLesson(req: Request, res: Response) {
  try {
    const slug =
      typeof req.params.slug === "string"
        ? req.params.slug.trim().toLowerCase()
        : "";

    const lessonSlug =
      typeof req.params.lessonSlug === "string"
        ? req.params.lessonSlug.trim().toLowerCase()
        : "";

    if (!slug || !lessonSlug) {
      return res.status(400).json({
        success: false,
        message: "Valid course aur lesson slug required hain.",
      });
    }

    const result = await getEnrolledCourse(
      slug,
      res.locals.authUser as AuthUser | undefined,
      res,
    );

    if (!result) {
      return;
    }

    const lesson = await Lesson.findOne({
      course: result.course._id,
      slug: lessonSlug,
      status: "published",
    })
      .select("title slug description order content videoUrl")
      .lean();

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Published lesson nahi mila.",
      });
    }

    const completedIds = new Set<string>(
      (result.enrollment.completedLessons ?? []).map(
        (id: mongoose.Types.ObjectId) => id.toString(),
      ),
    );

    return res.status(200).json({
      success: true,
      course: {
        id: result.course._id.toString(),
        title: result.course.title,
        slug: result.course.slug,
      },
      lesson: {
        id: lesson._id.toString(),
        title: lesson.title,
        slug: lesson.slug,
        description: lesson.description,
        order: lesson.order,
        content: lesson.content,
        videoUrl: lesson.videoUrl ?? "",
        isCompleted: completedIds.has(lesson._id.toString()),
      },
    });
  } catch (error) {
    console.error("Fetching course lesson failed:", error);

    return res.status(500).json({
      success: false,
      message: "Lesson load nahi ho paaya.",
    });
  }
}

/**
 * PATCH /api/courses/:slug/lessons/:lessonSlug/complete
 * Enrolled student lesson ko complete mark kar sakta hai.
 */
export async function completeCourseLesson(req: Request, res: Response) {
  try {
    const slug =
      typeof req.params.slug === "string"
        ? req.params.slug.trim().toLowerCase()
        : "";

    const lessonSlug =
      typeof req.params.lessonSlug === "string"
        ? req.params.lessonSlug.trim().toLowerCase()
        : "";

    if (!slug || !lessonSlug) {
      return res.status(400).json({
        success: false,
        message: "Valid course aur lesson slug required hain.",
      });
    }

    const authUser = res.locals.authUser as AuthUser | undefined;

    if (!authUser) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (
      authUser.role !== "student" ||
      !mongoose.isValidObjectId(authUser.sub)
    ) {
      return res.status(403).json({
        success: false,
        message: "Valid student account required.",
      });
    }

    const student = await User.findOne({
      _id: authUser.sub,
      role: "student",
      isActive: true,
    })
      .select("_id")
      .lean();

    if (!student) {
      return res.status(403).json({
        success: false,
        message: "Active student account required.",
      });
    }

    const course = await Course.findOne({
      slug,
      status: "published",
    })
      .select("_id title slug")
      .lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Published course nahi mila.",
      });
    }

    const lesson = await Lesson.findOne({
      course: course._id,
      slug: lessonSlug,
      status: "published",
    })
      .select("_id title slug")
      .lean();

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Published lesson nahi mila.",
      });
    }

    // Sirf active enrollment wale students progress update kar sakte hain.
    const enrollment = await Enrollment.findOne({
      student: student._id,
      course: course._id,
      status: "active",
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "Active enrollment required to complete lessons.",
      });
    }

    // Duplicate completion se lesson dobara count nahi hoga.
    const alreadyCompleted = enrollment.completedLessons.some(
      (id: mongoose.Types.ObjectId) => id.toString() === lesson._id.toString(),
    );

    if (!alreadyCompleted) {
      enrollment.completedLessons.push(lesson._id);

      const totalLessons = await Lesson.countDocuments({
        course: course._id,
        status: "published",
      });

      const completedLessons = enrollment.completedLessons.length;

      enrollment.progressPercentage =
        totalLessons === 0
          ? 0
          : Math.min(100, Math.round((completedLessons / totalLessons) * 100));

      if (totalLessons > 0 && completedLessons >= totalLessons) {
        enrollment.status = "completed";
        enrollment.completedAt = new Date();
        enrollment.progressPercentage = 100;
      }

      await enrollment.save();
    }

    return res.status(200).json({
      success: true,
      message: alreadyCompleted
        ? "Lesson pehle se complete hai."
        : "Lesson successfully complete mark ho gaya.",
      progress: {
        completedLessons: enrollment.completedLessons.length,
        percentage: enrollment.progressPercentage,
        enrollmentStatus: enrollment.status,
      },
      lesson: {
        id: lesson._id.toString(),
        title: lesson.title,
        slug: lesson.slug,
        isCompleted: true,
      },
    });
  } catch (error) {
    console.error("Completing course lesson failed:", error);

    return res.status(500).json({
      success: false,
      message: "Lesson completion save nahi ho paaya.",
    });
  }
}
