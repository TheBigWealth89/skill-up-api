import { Router } from "express";
import  {authorization}  from "../middleware/authMiddleware.js";
import { ROLES } from "../model/user.js";
import authControllers from "../controllers/authControllers.js";
import { checkRoles } from "../middleware/checkRole.js";

const adminRoutes = Router();
adminRoutes.post(
  "/Dashboard",
  authorization,
  checkRoles([ROLES.admin]),
  authControllers.getAllUsers
);

export default adminRoutes;
