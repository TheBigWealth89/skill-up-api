import Enrollment from "../model/enrollment.js";

export const checkEnrollment = async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.userId;

    const enrollment = await Enrollment.findOne({ 
      course: courseId, 
      user: userId 
    });

    if (!enrollment) {
      return res.status(403).json({
        error: "You are not enrolled in this course",
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};