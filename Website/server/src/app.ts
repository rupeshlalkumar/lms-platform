
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.routes.js";
import courseRoutes from "./routes/course.routes.js";
import enrollmentRoutes from "./routes/enrollment.routes.js";
import adminCourseRoutes from "./routes/admin-course.routes.js";
import adminLessonRoutes from "./routes/admin-lesson.routes.js";

const app = express();

// Security headers
app.use(helmet());

// Frontend connection
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Request body parsers
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// Health check API
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    api: "running",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);

// Admin-only course management APIs
app.use("/api/admin", adminCourseRoutes);

// Admin-only lesson management APIs
app.use("/api/admin", adminLessonRoutes);

export default app;
