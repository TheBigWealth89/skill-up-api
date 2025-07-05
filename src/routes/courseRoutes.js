import Router from "express";
import { authorization } from "../middleware/authMiddleware.js";
import { checkRoles } from "../middleware/checkRole.js";
import { checkEnrollment } from "../middleware/checkEnrollment.js";
import { ROLES } from "../model/user.js";
import courseController from "../controllers/courseController.js";

const courseRoutes = Router();

// Public routes
courseRoutes.get("/", courseController.getCourses);
courseRoutes.get("/:id", courseController.getCourse);

// Protected routes (require authentication)
courseRoutes.use(authorization);

// Instructor+Admin routes
courseRoutes.post(
  "/",
  checkRoles([ROLES.admin, ROLES.instructor]),
  courseController.createCourse
);

courseRoutes.get(
  "/instructor/my-courses",
  authorization,
  checkRoles([ROLES.instructor]),
  courseController.getInstructorCourses
);

courseRoutes.put(
  "/:id",
  checkRoles([ROLES.admin, ROLES.instructor]),
  courseController.updateCourse
);

// Admin-only routes
courseRoutes.patch(
  "/:id/approve",
  checkRoles([ROLES.admin]),
  courseController.approveCourse
);

courseRoutes.delete(
  "/:id",
  checkRoles([ROLES.admin]),
  courseController.deleteCourse
);

courseRoutes.post(
  "/:id/rate",
  checkRoles([ROLES.learner]),
  checkEnrollment,
  courseController.rateCourse
);

export default courseRoutes;
