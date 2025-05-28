import Router from "express";
import authControllers from "../controllers/authControllers.js";
import { authorization } from "../middleware/authMiddleware.js";
const authRoutes = Router();

authRoutes.post("/signup", authControllers.signup);
authRoutes.post("/login", authControllers.login);
authRoutes.post("/logout", authorization, authControllers.logout);
authRoutes.post("/refresh", authControllers.refresh);

export default authRoutes;
