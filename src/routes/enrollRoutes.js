import { Router } from "express";
import EnrollmentController from "../controllers/enrollController.js";
import { authorization } from "../middleware/authMiddleware.js";
import { ROLES } from "../model/user.js";
import { checkRoles } from "../middleware/checkRole.js";
const enrollRoutes = Router();

enrollRoutes.use(authorization);

enrollRoutes.post("/", EnrollmentController.enrollUser);

enrollRoutes.get("/", EnrollmentController.getUserEnrollments);

enrollRoutes.get(
  "/analytics",
  checkRoles([ROLES.admin]),
  EnrollmentController.getEnrollmentAnalytics
);

enrollRoutes.get("/:id", EnrollmentController.getEnrollment);

enrollRoutes.put("/:id", EnrollmentController.updateEnrollment);

export default enrollRoutes;
