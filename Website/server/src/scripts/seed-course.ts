
import "dotenv/config";
import mongoose from "mongoose";
import Course from "../models/Course.js";

const coursesData = [
  {
    title: "Web Development Fundamentals",
    slug: "web-development-fundamentals",
    shortDescription:
      "HTML, CSS aur JavaScript ki madad se web development ki buniyad seekhein.",
    description:
      "Is course mein web development ke fundamentals, HTML structure, CSS styling aur JavaScript basics ko step-by-step seekha jayega.",
    category: "Web Development",
    thumbnail: "",
    price: 999,
    currency: "INR" as const,
    level: "beginner" as const,
    status: "published" as const,
    publishedAt: new Date(),
  },
  {
    title: "Introduction to HTML - Free Course",
    slug: "introduction-to-html-free",
    shortDescription:
      "HTML ke basic concepts aur web page structure ko free mein seekhein.",
    description:
      "Is beginner-friendly course mein HTML document structure, headings, paragraphs, links, images aur basic HTML elements ka introduction diya jayega.",
    category: "Web Development",
    thumbnail: "",
    price: 0,
    currency: "INR" as const,
    level: "beginner" as const,
    status: "published" as const,
    publishedAt: new Date(),
  },
] as const;

async function seedCourses(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error(
      "MONGODB_URI is missing from the server .env file.",
    );
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("MongoDB connected. Seeding courses...");

    for (const courseData of coursesData) {
      const course = await Course.findOneAndUpdate(
        { slug: courseData.slug },
        {
          $set: {
            ...courseData,
          },
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        },
      );

      if (!course) {
        throw new Error(
          `Course could not be created or updated: ${courseData.slug}`,
        );
      }

      console.log("Course ready:", {
        title: course.title,
        slug: course.slug,
        category: course.category,
        price: course.price,
        currency: course.currency,
        status: course.status,
      });
    }

    console.log("All courses seeded successfully.");
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed.");
  }
}

seedCourses().catch((error: unknown) => {
  console.error(
    "Course seeding failed:",
    error instanceof Error ? error.message : error,
  );

  process.exitCode = 1;
});
