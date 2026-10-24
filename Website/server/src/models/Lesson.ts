
import mongoose, { Schema, type InferSchemaType } from "mongoose";

const lessonSchema = new Schema(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200,
    },

    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 220,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50000,
    },

    order: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

lessonSchema.index(
  { course: 1, slug: 1 },
  { unique: true },
);

lessonSchema.index(
  { course: 1, order: 1 },
  { unique: true },
);

export type LessonDocument = InferSchemaType<typeof lessonSchema>;

const Lesson =
  mongoose.models.Lesson ||
  mongoose.model("Lesson", lessonSchema);

export default Lesson;
