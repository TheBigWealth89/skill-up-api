import Router from "express";
import authControllers from "../controllers/authControllers.js";
import { authorization } from "../middleware/authMiddleware.js";
const authRoutes = Router();

authRoutes.post("/signup", authControllers.signup);
authRoutes.post("/login", authControllers.login);
authRoutes.post("/logout", authorization, authControllers.logout);
authRoutes.post("/refresh", authControllers.refresh);
authRoutes.post("/forgot-password", authControllers.forgotPassword);
authRoutes.post("/reset-password/:token", authControllers.resetPassword);

export default authRoutes;
