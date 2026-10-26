import { Router } from "express";
import Course from "../models/Course.js";
const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const { search = "", category = "" } = req.query;
    const filter = {};
    if (search.trim()) filter.$or = [
      { title: { $regex: search.trim(), $options: "i" } },
      { description: { $regex: search.trim(), $options: "i" } }
    ];
    if (category && category !== "All") filter.category = category;
    const courses = await Course.find(filter).sort({ title: 1 });
    res.json(courses);
  } catch (err) { next(err); }
});
export default router;
