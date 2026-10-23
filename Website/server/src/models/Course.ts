
import mongoose, { Schema, type InferSchemaType } from "mongoose";

const courseSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 150,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 180,
    },

    shortDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20000,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    thumbnail: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2048,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true,
      enum: ["INR"],
    },

    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "all-levels"],
      default: "all-levels",
      required: true,
    },

    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      required: true,
    },

    publishedAt: {
      type: Date,
      default: undefined,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

courseSchema.index({ status: 1, publishedAt: -1 });
courseSchema.index({ category: 1, status: 1 });

export type CourseDocument = InferSchemaType<typeof courseSchema>;

const Course =
  mongoose.models.Course ||
  mongoose.model("Course", courseSchema);

export default Course;
