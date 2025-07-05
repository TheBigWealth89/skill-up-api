import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  resourceType: {
    type: String,
    enum: ["video", "article", "exercise"],
    required: true,
  },
  duration: { type: Number, required: true, min: 0 }, // Duration in minutes for videos/articles
});

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  resources: [resourceSchema],
  isFreePreview: { type: Boolean, default: false }, // Allow making some lessons free
});

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  lessons: [lessonSchema],
});

// --- Main Course Schema ---

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    // ... (category, description, createdBy remain the same) ...
    category: {
      type: String,
      required: true,
      enum: ["programming", "design", "business", "language"],
    },
    description: {
      type: String,
      required: true,
      minlength: [20, "Description should be at least 20 characters"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // --- IMPROVED SYLLABUS ---
    // Replaces the old 'syllabus' array with a more structured 'modules' array
    modules: [moduleSchema],

    // ... (coverImage, introVideo, isApproved, approvedBy, level, etc. remain the same) ...
    coverImage: { type: String },
    introVideo: { type: String },
    isApproved: { type: Boolean, default: false },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    estimatedDuration: { type: Number, min: 0 }, // in hours
    prerequisites: [String],
    tags: [String],
    isActive: { type: Boolean, default: false },
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
          maxlength: 500,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// --- VIRTUALS ---
// A virtual property to calculate the total number of lessons in the course
courseSchema.virtual("totalLessons").get(function () {
  if (this.modules) {
    return this.modules.reduce((acc, module) => acc + module.lessons.length, 0);
  }
  return 0;
});

// ... (Your existing indexes and virtuals are good) ...
courseSchema.index({ title: "text", description: "text", tags: "text" });
courseSchema.virtual("enrollmentCount", {
  ref: "Enrollment",
  localField: "_id",
  foreignField: "course",
  count: true,
});

const Course = mongoose.model("Course", courseSchema);
export default Course;
