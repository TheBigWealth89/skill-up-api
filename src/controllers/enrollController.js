import Enrollment from "../model/enrollment.js";
import Course from "../model/course.js";

class EnrollmentControllers {
  /**
   * @desc    Enroll user in course
   * @route   POST /api/enrollments
   * @access  Private
   */
  async enrollUser(req, res, next) {
    try {
      const courseId = req.body.courseId;
      const userId = req.user.userId;

      // Check if already enrolled
      const existingEnrollment = await Enrollment.findOne({
        user: userId,
        course: courseId,
      });
      if (existingEnrollment) {
        return res.status(400).json({
          error: "User is already enrolled in this course",
        });
      }

      // Verify course exists
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          error: "Course not found",
        });
      }

      const enrollment = await Enrollment.create({
        user: userId,
        course: courseId,
        status: "active",
      });

      // Populate course details in response
      const result = await Enrollment.findById(enrollment._id)
        .populate("course", "title coverImage level")
        .populate("user", "name email");

      res.status(201).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc   Get user's enrollments
   * @route  GET /api/enrollments
   * @access Private
   */
  async getUserEnrollments(req, res, next) {
    try {
      const enrollments = await Enrollment.find({ user: req.user.userId })
        .populate({
          path: "course",
          select: "title description coverImage level duration",
        })
        .sort("-enrolledAt");

      // Calculate additional virtual fields
      const enrichedEnrollments = enrollments.map((enrollment) => {
        const enrollmentObj = enrollment.toObject();
        enrollmentObj.course.progress = enrollment.progress;
        enrollmentObj.course.completed = enrollment.completed;
        return enrollmentObj;
      });

      res.status(200).json({
        count: enrollments.length,
        data: enrichedEnrollments,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc  Update enrollment progress
   * @route PUT /api/enrollments/:id
   * @access  Private
   */

  async updateEnrollment(req, res, next) {
    try {
      const { progress, lessonId, status } = req.body;

      // Validate progress
      if (progress && (progress < 0 || progress > 100)) {
        return res.status(400).json({
          error: "Progress must be between 0 and 100",
        });
      }

      const updateFields = {
        lastAccessed: Date.now(),
      };

      if (progress) updateFields.progress = progress;
      if (status) updateFields.status = status;

      if (lessonId) {
        updateFields.$addToSet = {
          completedLessons: {
            lessonId,
            completedAt: Date.now(),
          },
        };
      }

      if (progress === 100) {
        updateFields.completed = true;
        updateFields.status = "completed";
        updateFields.completionDate = Date.now();
      }

      const enrollment = await Enrollment.findOneAndUpdate(
        { _id: req.params.id, user: req.user.userId },
        updateFields,
        { new: true, runValidators: true }
      ).populate("course", "title");

      if (!enrollment) {
        return res.status(404).json({
          error: "Enrollment not found",
        });
      }

     

      res.status(200).json({
        data:enrollment
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * @desc  Get enrollment analytics
   * @route GET /api/enrollments/analytics
   * @access Private/Admin
   */

  async getEnrollmentAnalytics(req, res, next) {
    try {
      if (!req.user.userId) {
        return res.status(401).json({
          error: "Authorization required",
        });
      }

      const analytics = await Enrollment.aggregate([
        {
          $group: {
            _id: "$course",
            totalEnrollments: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ["$completed", true] }, 1, 0] },
            },
            avgProgress: { $avg: "$progress" },
          },
        },
        {
          $lookup: {
            from: "courses",
            localField: "_id",
            foreignField: "_id",
            as: "courseDetails",
          },
        },
        { $unwind: "$courseDetails" },
        {
          $project: {
            courseTitle: "$courseDetails.title",
            totalEnrollments: 1,
            completionRate: {
              $multiply: [
                { $divide: ["$completed", "$totalEnrollments"] },
                100,
              ],
            },
            avgProgress: 1,
          },
        },
      ]);

      res.status(200).json({
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc Get single enrollment
   * @route   GET /api/enrollments/:id
   * @access Private
   */
  async getEnrollment(req, res, next) {
    try {
      const enrollment = await Enrollment.findOne({
        _id: req.params.id,
        user: req.user.userId,
      })
        .populate("course")
        .populate("user", "name email");

      if (!enrollment) {
        return res.status(404).json({
          error: "Enrollment not found",
        });
      }

      res.status(200).json({
        data: enrollment,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new EnrollmentControllers();
