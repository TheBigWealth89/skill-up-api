import { Router } from "express";
import { authorization } from "../middleware/authMiddleware.js";
import { checkRoles } from "../middleware/checkRole.js";
import { ROLES } from "../model/user.js";
import submissionController from "../controllers/submissionController.js";

const submissionRoutes = Router();

submissionRoutes.use(authorization);

submissionRoutes.post("/", submissionController.submitAssignment);

submissionRoutes.get(
  "/:id",
  checkRoles([ROLES.instructor]),
  submissionController.getSubmissions
);
export default submissionRoutes;
