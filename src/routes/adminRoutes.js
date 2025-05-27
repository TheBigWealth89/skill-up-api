import { Router } from "express";
import { authorization } from "../middleware/authMiddleware";
import { ROLES } from "../model/user";
import authControllers from "../controllers/authControllers";
import { checkRoles } from "../middleware/checkRole";

const adminRoutes = Router();
adminRoutes.post(
  "/Dashboard",
  authorization,
  checkRoles([ROLES.admin]),
  authControllers.getAllUsers
);

export default adminRoutes