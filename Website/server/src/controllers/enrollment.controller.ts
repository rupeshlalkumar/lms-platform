import type { Request, Response } from "express";
import mongoose from "mongoose";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import User from "../models/User.js";

type AuthUser = {
  sub: string;
  role: "student" | "admin";
};

export async function enrollInCourse(req: Request, res: Response) {
  try {
    const authUser = res.locals.authUser as AuthUser | undefined;

    if (!authUser) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (authUser.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can enroll in courses.",
      });
    }

    if (!mongoose.isValidObjectId(authUser.sub)) {
      return res.status(401).json({
        success: false,
        message: "Invalid user identity.",
      });
    }

    const rawSlug =
      typeof req.body?.courseSlug === "string"
        ? req.body.courseSlug
        : typeof req.body?.slug === "string"
          ? req.body.slug
          : "";

    const slug = rawSlug.trim().toLowerCase();
    if (!slug || slug.length > 180) {
      return res.status(400).json({
        success: false,
        message: "Valid course slug is required.",
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

    // price ko select karna zaroori hai, kyunki neeche payment guard
    // isi value ko check karta hai.
    const course = await Course.findOne({
      slug,
      status: "published",
    })
      .select("_id title slug price")
      .lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Published course nahi mila.",
      });
    }

    if (course.price > 0) {
      return res.status(402).json({
        success: false,
        message: "Payment is required before enrolling in this course.",
      });
    }

    const existingEnrollment = await Enrollment.findOne({
      student: student._id,
      course: course._id,
    }).lean();

    if (existingEnrollment) {
      return res.status(409).json({
        success: false,
        message: "Aap pehle se is course mein enrolled hain.",
      });
    }

    try {
      const enrollment = await Enrollment.create({
        student: student._id,
        course: course._id,
      });

      return res.status(201).json({
        success: true,
        message: "Course enrollment successful.",
        enrollment: {
          id: enrollment._id,
          course: {
            title: course.title,
            slug: course.slug,
          },
          status: enrollment.status,
          enrolledAt: enrollment.enrolledAt,
        },
      });
    } catch (error) {
      // Concurrent requests ko unique index duplicate enrollment
      // create karne se rokta hai.
      if (
        error instanceof mongoose.mongo.MongoServerError &&
        error.code === 11000
      ) {
        return res.status(409).json({
          success: false,
          message: "Aap pehle se is course mein enrolled hain.",
        });
      }

      throw error;
    }
  } catch (error) {
    console.error("Course enrollment failed:", error);

    return res.status(500).json({
      success: false,
      message: "Enrollment nahi ho paaya. Please try again.",
    });
  }
}

/**
 * GET /api/enrollments
 * Logged-in student ke enrolled courses return karta hai.
 */
export async function getMyEnrollments(_req: Request, res: Response) {
  try {
    const authUser = res.locals.authUser as AuthUser | undefined;

    if (!authUser) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (authUser.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can view their enrollments.",
      });
    }

    if (!mongoose.isValidObjectId(authUser.sub)) {
      return res.status(401).json({
        success: false,
        message: "Invalid user identity.",
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

    const enrollments = await Enrollment.find({
      student: student._id,
    })
      .populate({
        path: "course",
        select: "title slug",
      })
      .sort({ enrolledAt: -1 })
      .lean();

    const myCourses = enrollments
      .filter((enrollment) => enrollment.course !== null)
      .map((enrollment) => {
        const course = enrollment.course as unknown as {
          _id: mongoose.Types.ObjectId;
          title: string;
          slug: string;
        };

        return {
          id: enrollment._id.toString(),
          course: {
            id: course._id.toString(),
            title: course.title,
            slug: course.slug,
          },
          status: enrollment.status,
          enrolledAt: enrollment.enrolledAt,
        };
      });

    return res.status(200).json({
      success: true,
      count: myCourses.length,
      enrollments: myCourses,
    });
  } catch (error) {
    console.error("Fetching student enrollments failed:", error);

    return res.status(500).json({
      success: false,
      message: "My Courses load nahi ho paaye. Please try again.",
    });
  }
}
