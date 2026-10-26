import { Router } from "express";
import mongoose from "mongoose";
import requireAuth from "../middleware/auth.js";
import Course from "../models/Course.js";
import Enrolment from "../models/Enrolment.js";

const router = Router();
router.use(requireAuth);

router.post("/", async (req, res, next) => {
  let seatReserved = false;
  let courseId;
  try {
    courseId = req.body.courseId;
    if (!mongoose.isValidObjectId(courseId)) return res.status(400).json({ message: "Choose a valid course." });

    const existing = await Enrolment.findOne({ student: req.user.id, course: courseId, status: "Enrolled" });
    if (existing) return res.status(409).json({ message: "You are already enrolled in this course." });

    // Atomic conditional update prevents the seat count from dropping below zero.
    const course = await Course.findOneAndUpdate(
      { _id: courseId, availableSeats: { $gt: 0 } },
      { $inc: { availableSeats: -1 } }, { new: true }
    );
    if (!course) return res.status(409).json({ message: "No seats are available for this course." });
    seatReserved = true;

    const prior = await Enrolment.findOne({ student: req.user.id, course: courseId });
    let enrolment;
    if (prior) {
      prior.status = "Enrolled";
      enrolment = await prior.save();
    } else {
      enrolment = await Enrolment.create({ student: req.user.id, course: courseId, status: "Enrolled" });
    }
    res.status(201).json({ message: "Enrolment successful.", enrolment });
  } catch (err) {
    // Roll back the seat reservation if saving the enrolment failed.
    if (seatReserved && courseId) await Course.updateOne({ _id: courseId }, { $inc: { availableSeats: 1 } }).catch(() => {});
    if (err.code === 11000) return res.status(409).json({ message: "You are already enrolled in this course." });
    next(err);
  }
});

router.get("/me", async (req, res, next) => {
  try {
    const enrolments = await Enrolment.find({ student: req.user.id, status: "Enrolled" }).populate("course").sort({ createdAt: -1 });
    res.json(enrolments);
  } catch (err) { next(err); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid enrolment ID." });
    const enrolment = await Enrolment.findOneAndUpdate(
      { _id: req.params.id, student: req.user.id, status: "Enrolled" },
      { $set: { status: "Cancelled" } }, { new: true }
    );
    if (!enrolment) return res.status(404).json({ message: "Enrolment not found or already cancelled." });
    await Course.updateOne({ _id: enrolment.course }, { $inc: { availableSeats: 1 } });
    res.json({ message: "Enrolment cancelled successfully." });
  } catch (err) { next(err); }
});
export default router;
