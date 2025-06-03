import { Router } from "express";
import { checkRoles } from "../middleware/checkRole.js";
import { ROLES } from "../model/user.js";
import { authorization } from "../middleware/authMiddleware.js";
import assignmentController from "../controllers/assignmentController.js";

const assignmentRoutes = Router();

assignmentRoutes.use(authorization);

assignmentRoutes.post(
  "/",
  checkRoles([ROLES.instructor]),
  assignmentController.createAssignment
);

assignmentRoutes.put(
  "/:id/grade",
  checkRoles([ROLES.instructor]),
  assignmentController.gradeSubmission
);

assignmentRoutes.get("/", assignmentController.getAssignment);

export default assignmentRoutes
