import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import enrollRoutes from "./routes/enrollRoutes.js";
import assignmentRoutes from "./routes/assRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import connectDB from "./lib/db.js";
import redisServices from "./services/redisServices.js";
import { globalErrorHandler } from "./middleware/errorHandlers.js";
import { uploadAssignment } from "./middleware/uploadMiddleware.js";
dotenv.config();

const app = express();
const PORT = 5000;
app.use(express.json({ limit: "10mb" })); // Increased body size limit
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:8080/",
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    credentials: true, // Allow cookies to be sent with requests
  })
);

connectDB();

(async () => {
  await redisServices.connect();
})();

app.get("/", (req, res) => {
  res.send("✅ Server is healthy");
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/enrollments", enrollRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", uploadAssignment, submissionRoutes);

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

app.use(globalErrorHandler);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
