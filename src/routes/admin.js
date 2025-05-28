import { Router } from "express";
import { authorization } from "../middleware/authMiddleware.js";
import { ROLES } from "../model/user.js";
import adminController from "../controllers/adminControllers.js";
import { checkRoles } from "../middleware/checkRole.js";

const adminRoutes = Router();
adminRoutes.post(
  "/Dashboard",
  authorization,
  checkRoles([ROLES.admin]),
  adminController.getAllUsers
);

adminRoutes.delete(
  "/delete/:targetedUserId",
  authorization,
  checkRoles([ROLES.admin]),
  adminController.deleteUser
);

export default adminRoutes;
