import Course from "../model/course.js";
class CourseController {
  /**
   * @desc    create a course
   * @route   POST /api/course
   * @access  instructor & admin
   */
  async createCourse(req, res, next) {
    try {
      if (!req.user.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const course = new Course({
        ...req.body,
        createdBy: req.user.userId, // Authenticated user's ID
      });

      await course.save();

      // Return course with creator details
      const populatedCourse = await Course.findById(course._id).populate(
        "createdBy",
        "name avatar"
      );

      res.status(201).json({
        data: populatedCourse,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc    Get a course
   * @route   GET /api/course/:id
   * @access  Public
   */

  async getCourse(req, res, next) {
    try {
      const course = await Course.findById(req.params.id)
        .populate("createdBy", "name avatar ")
        .populate({
          path: "enrollmentCount", // Virtual field
          select: "status",
        });

      if (!course) {
        return res.status(404).json({
          error: "Course not found",
        });
      }

      res.json({
        data: course,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc    update a course
   * @route   PUT/api/course/:id
   * @access   Owner
   */
  async updateCourse(req, res, next) {
    try {
      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({
          error: "Course not found",
        });
      }

      // Check ownership (or admin role)

      // Prevent certain fields from being updated
      const { createdBy, isApproved, ...updates } = req.body;

      const updatedCourse = await Course.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      ).populate("createdBy", "name");

      res.json({
        data: updatedCourse,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc    Get courses
   * @route   POST /api/course
   * @access  Public
   */
  async getCourses(req, res, next) {
    try {
      // Building query based on filters
      const query = { isActive: true };

      // Filter by category
      if (req.query.category) {
        query.category = req.query.category;
      }

      // Filter by level
      if (req.query.level) {
        query.level = req.query.level;
      }

      // Text search
      if (req.query.search) {
        query.$text = { $search: req.query.search };
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const courses = await Course.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("createdBy", "name")
        .lean(); // Lean for better performance

      const total = await Course.countDocuments(query);

      res.json({
        count: courses.length,
        total,
        pages: Math.ceil(total / limit),
        data: courses,
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * @desc    Get instructor courses
   * @route   GET /api/course/instructor/my-courses
   * @access  instructor
   */
  async getInstructorCourses(req, res, next) {
    try {
      const instructorId = req.user.userId;
      if (!instructorId) {
        return res.status(401).json({ error: "Authorization required" });
      }

      const instructor = await Course.find();
      if (!instructor) {
        return res.status(404).json({
          error: "No course found",
        });
      }

      return res.status(200).json({
        data: instructor,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc    Approve course
   * @route   PATCH /api/course/:id/approve
   * @access  Admin
   */
  async approveCourse(req, res) {
    try {
      // Admin-only middleware should verify role first
      const course = await Course.findByIdAndUpdate(
        req.params.id,
        {
          isApproved: true,
          approvedBy: req.user._id, // Track who approved it
        },
        { new: true }
      );

      if (!course) {
        return res.status(404).json({
          error: "Course not found",
        });
      }

      // In real-world: Send notification to instructor
      // await sendApprovalEmail(course.createdBy);

      res.json({
        message: "Course approved ✅",
        data: course,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc    Delete a course
   * @route   POST /api/course/:id
   * @access Admin
   */
  async deleteCourse(req, res, next) {
    try {
      const adminId = req.user.userId;
      const courseId = req.params.id;

      if (!adminId) {
        return res.status(401).json({
          error: "Authorization required",
        });
      }
      const course = await Course.findByIdAndDelete(courseId);
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }
      res.status(200).json({ message: "Course deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

export default new CourseController();
