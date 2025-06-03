import Assignment from "../model/assignment.js";
import Submission from "../model/submission.js";

class AssignmentControllers {
  /**
   * @desc  Create assignment
   * @route POST /api/assignment
   * @access Private/Instructor
   */
  async createAssignment(req, res, next) {
    try {
      const instructorId = req.user?.userId;
      if (!instructorId) {
        res.status(401).json({ error: "Authorization required" });
      }
      const assignment = await Assignment.create({
        ...req.body,
        createdBy: req.user?.userId,
      });

      //   await assignment.save();

      return res.status(201).json({ data: assignment });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc  Get assignments
   * @route GET /api/assignment
   * @access public/learner
   */
  async getAssignment(req, res, next) {
    try {
      const assignment = await Assignment.find({
        course: req.query.courseId,
      });

      if (!assignment) {
        return res.status(404).json({ error: "Assignment not found" });
      }
      return res.status(200).json({
        data: assignment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc   Grade submission
   * @route PUT /api/assignment/:id/grade
   * @access Instructor
   */
  async gradeSubmission(req, res, next) {
    try {
      const submission = await Submission.findByIdAndUpdate(
        req.params.id,
        {
          grade: {
            points: req.body.points,
            feedback: req.body.feedback,
            gradedAt: new Date(),
          },
          status: "graded",
        },
        { new: true }
      );
      return res.status(200).json({ data: submission });
    } catch (error) {
      next(error);
    }
  }
}

export default new AssignmentControllers();
