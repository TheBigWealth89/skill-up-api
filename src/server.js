import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/user.js";
import adminRoutes from "./routes/admin.js";
import courseRoutes from "./routes/courseRoutes.js";
import enrollRoutes from "./routes/enrollRoutes.js";
import connectDB from "./lib/db.js";
import redisServices from "./services/redisServices.js";
import { globalErrorHandler } from "./middleware/errorHandlers.js";

dotenv.config();

const app = express();
const PORT = 5000;
app.use(express.json({ limit: "10mb" })); // Increased body size limit
app.use(cookieParser());
app.use(
  cors({
    origin: "",
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    credentials: true, // Allow cookies to be sent with requests
  })
);

connectDB();

(async () => {
  await redisServices.connect();
})();

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/enrollments", enrollRoutes);

app.use(globalErrorHandler);
app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);
