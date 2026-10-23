
import mongoose, { Schema, type InferSchemaType } from "mongoose";

const enrollmentSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
      required: true,
    },

    enrolledAt: {
      type: Date,
      default: Date.now,
      required: true,
    },

    completedAt: {
      type: Date,
      default: undefined,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Ek student ek course mein sirf ek baar enroll ho sakta hai.
enrollmentSchema.index(
  { student: 1, course: 1 },
  { unique: true }
);

// Student ke enrollments ko date ke hisaab se fetch karne ke liye.
enrollmentSchema.index({ student: 1, enrolledAt: -1 });

export type EnrollmentDocument = InferSchemaType<
  typeof enrollmentSchema
>;

const Enrollment =
  mongoose.models.Enrollment ||
  mongoose.model("Enrollment", enrollmentSchema);

export default Enrollment;
