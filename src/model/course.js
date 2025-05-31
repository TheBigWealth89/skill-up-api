import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: [true, "Course title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"]
    },
    category: { 
      type: String,
      required: true,
      enum: ["programming", "design", "business", "language",] 
    },
    description: {
      type: String,
      required: true,
      minlength: [20, "Description should be at least 20 characters"],
      maxlength: [2000, "Description cannot exceed 2000 characters"]
    },
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: true
    },
    syllabus: [{
      week: Number,
      title: String,
      topics: [String],
      resources: [{
        title: String,
        url: String,
        type: { type: String, enum: ["video", "article", "exercise"] }
      }]
    }],
    coverImage: {
      type: String,
      validate: {
        validator: v => /\.(jpg|jpeg|png|webp)$/.test(v),
        message: "Image must be a JPG, JPEG, PNG, or WEBP file"
      }
    },
    introVideo: {
      type: String,
      validate: {
        validator: v => /^(https?\:\/\/)?(www\.)?(youtube\.com|vimeo\.com)\/.+$/.test(v),
        message: "Video URL must be from YouTube or Vimeo"
      }
    },
    isApproved: { 
      type: Boolean, 
      default: false 
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner"
    },
    estimatedDuration: { // in hours
      type: Number,
      min: 0
    },
    prerequisites: [String],
    tags: [String],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better performance
courseSchema.index({ title: "text", description: "text", tags: "text" });
courseSchema.index({ createdBy: 1, isActive: 1 });

// Virtual for enrollment count (if you track enrollments)
courseSchema.virtual("enrollmentCount", {
  ref: "Enrollment",
  localField: "_id",
  foreignField: "course",
  count: true
});

const Course = mongoose.model("Course", courseSchema);
export default Course;