
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.routes.js";

const app = express();

// Security headers
app.use(helmet());

// Frontend connection
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
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

// Authentication APIs
app.use("/api/auth", authRoutes);

export default app;
