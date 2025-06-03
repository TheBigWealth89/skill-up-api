import Submission from "../model/submission.js";
class submissionControllers {
  /**
   * @desc  Submit assignment
   * @route POST /api/submission
   * @access Private/learner
   */
  async submitAssignment(req, res, next) {
    try {
           console.log('Raw request body:', req.body);
    console.log('Uploaded files:', req.files);

    if (!req.body.assignmentId) {
      return res.status(400).json({ error: "assignmentId is required" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "At least one file is required" });
    }
      const submission = await Submission.create({
        assignment: req.body.assignmentId,
        student: req.user.userId,
        files: req.files.map((file) => ({
          url: file.path,
          name: file.originalname,
          type: file.mimetype,
        })),
      });
      res.status(201).json(submission);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc  Get submission
   * @route GET /api/submission/:id
   * @access Private/instructor
   */
  async getSubmissions(req, res, next) {
    try {
      const submissions = await Submission.find({
        student: req.user.userId,
      }).populate("assignment");
      res.status(200).json({ data: submissions });
    } catch (error) {
      next(error);
    }
  }
}
export default new submissionControllers();
