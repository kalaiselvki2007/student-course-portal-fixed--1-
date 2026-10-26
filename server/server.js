import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import courseRoutes from "./routes/courses.js";
import enrolmentRoutes from "./routes/enrolments.js";

dotenv.config();
const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ message: "Student Portal API is running" }));
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrolments", enrolmentRoutes);
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error. Please try again." });
});

const port = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/student_course_portal")
  .then(() => app.listen(port, () => console.log(`API running at http://localhost:${port}`)))
  .catch(err => { console.error("MongoDB connection failed:", err.message); process.exit(1); });
