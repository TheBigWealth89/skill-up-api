import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Improves query performance
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    lastAccessed: {
      type: Date,
      default: Date.now,
    },
    completionDate: Date,
    status: {
      type: String,
      enum: ["active", "paused", "completed", "dropped"],
      default: "active",
    },
    // For tracking module/lesson completion
    completedLessons: [
      {
        lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
        completedAt: Date,
      },
    ],
  },
  {
    timestamps: true,
    // Ensure one enrollment per user-course pair
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index to prevent duplicate enrollments
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
export default Enrollment;
