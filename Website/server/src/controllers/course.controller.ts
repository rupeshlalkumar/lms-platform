
import type { Request, Response } from "express";
import Course from "../models/Course.js";

export async function getPublishedCourses(
  req: Request,
  res: Response
) {
  try {
    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const category =
      typeof req.query.category === "string"
        ? req.query.category.trim()
        : "";

    const filter: Record<string, unknown> = {
      status: "published",
    };

    if (search) {
      const escapedSearch = search.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.$or = [
        { title: { $regex: escapedSearch, $options: "i" } },
        {
          shortDescription: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
      ];
    }

    if (category) {
      filter.category = category;
    }

    const courses = await Course.find(filter)
      .select(
        "title slug shortDescription category thumbnail price currency level publishedAt"
      )
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    console.error("Failed to fetch published courses:", error);

    return res.status(500).json({
      success: false,
      message: "Courses fetch nahi ho paaye. Please try again.",
    });
  }
}

// Course Not Found

export async function getPublishedCourseBySlug(
  req: Request,
  res: Response
) {
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

    const course = await Course.findOne({
      slug,
      status: "published",
    })
      .select(
        "title slug shortDescription description category thumbnail price currency level publishedAt"
      )
      .lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course nahi mila.",
      });
    }

    return res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    console.error("Failed to fetch published course:", error);

    return res.status(500).json({
      success: false,
      message: "Course details fetch nahi ho paayi. Please try again.",
    });
  }
}
