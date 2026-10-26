import mongoose from "mongoose";
const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  totalSeats: { type: Number, required: true, min: 0 },
  availableSeats: { type: Number, required: true, min: 0 }
}, { timestamps: true });
export default mongoose.model("Course", courseSchema);
