import Course from "../model/course.js";
import User from "../model/user.js";
import emailService from "../services/emailService.js";
class CourseController {
  /**
   * @desc    create a course
   * @route   POST /api/course
   * @access  instructor & admin
   */
  async createCourse(req, res, next) {
    try {
      console.log("Request received");
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required." });
      }

      console.log("Calling Course Form");
      // and resources based on the schema we defined.
      console.log(req.body);
      const courseData = {
        ...req.body, // This will include title, description, modules, etc.
        createdBy: userId,
      };

      console.log("Calling Course Form");

      const course = new Course(courseData);
      await course.save(); // Mongoose validation runs here

      // --- Post-creation logic (this part is good) ---
      const instructor = await User.findById(userId);
      if (instructor) {
        // You might want to pass the instructor's name directly
        emailService.sendNewCourseForApprovalEmail(course, instructor);
      }

      // Populate the createdBy field for the response
      const populatedCourse = await Course.findById(course._id).populate(
        "createdBy",
        "name avatar"
      );

      res.status(201).json({ data: populatedCourse });
    } catch (error) {
      // If validation fails, the error will be caught and passed to your global error handler
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
      populatedCourse, next(error);
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
      const query = { isActive: true, isApproved: true };

      if (req.query.category) {
        query.category = req.query.category;
      }
      if (req.query.level) {
        query.level = req.query.level;
      }
      if (req.query.search) {
        query.title = { $regex: req.query.search, $options: "i" };
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const courses = await Course.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("createdBy", "firstName lastName name avatar")
        .populate("learnersEnrolled", "firstName lastName name")
        .lean();

      const total = await Course.countDocuments(query);

      res.json({
        success: true,
        count: courses.length,
        total,
        pages: Math.ceil(total / limit),
        data: courses,
      });
    } catch (error) {
      console.error("Error fetching courses:", error);
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

      const courses = await Course.find({ createdBy: instructorId });
      if (!courses) {
        return res.status(404).json({
          error: "No course found",
        });
      }

      return res.status(200).json({
        count: courses.length,
        data: courses,
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
      const course = await Course.findById(req.params.id);
      if (!course) {
        return res.status(404).json({
          error: "Course not found",
        });
      }
      if (course.isApproved) {
        return res.status(400).json({
          error: "Course is already approved.",
        });
      }
      course.isApproved = true;
      course.approvedBy = req.user.userId;
      await course.save();
      emailService.sendCourseApprovalEmail(course).catch(console.error);
      // In real-world: Send notification to instructor
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

  /**
   * @desc    Rate a course
   * @route   POST /api/course/:id/rate
   * @access  Enrolled Students
   */
  async rateCourse(req, res, next) {
    try {
      const { rating, comment } = req.body;
      const courseId = req.params.id;
      const userId = req.user.userId;

      const course = await Course.findById(courseId);

      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }

      const existingRating = course.ratings.find(
        (r) => r.user.toString() === userId.toString()
      );

      if (existingRating) {
        // Update existing rating
        existingRating.rating = rating;
        existingRating.comment = comment;
      } else {
        // Add new rating
        course.ratings.push({ user: userId, rating, comment });
      }

      await course.save();
      res.status(201).json({
        message: "Course rated successfully",
        data: course,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CourseController();
