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
adminRoutes.patch(
  "/activate/:targetedUserId",
  authorization,
  checkRoles([ROLES.admin]),
  adminController.activateUser
);

adminRoutes.patch(
  "/suspend/:targetedUserId",
  authorization,
  checkRoles([ROLES.admin]),
  adminController.suspendUser
);

export default adminRoutes;
