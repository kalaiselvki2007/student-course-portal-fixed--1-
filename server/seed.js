import dotenv from "dotenv";
import mongoose from "mongoose";
import Course from "./models/Course.js";
dotenv.config();
await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/student_course_portal");
const courses = [
  { title: "Python Programming", description: "Learn Python fundamentals, functions, files and practical problem solving.", category: "Programming", totalSeats: 30, availableSeats: 30 },
  { title: "Full-Stack Web Development", description: "Build responsive websites with HTML, CSS, JavaScript and backend APIs.", category: "Web Development", totalSeats: 25, availableSeats: 25 },
  { title: "Java Fundamentals", description: "Explore object-oriented programming, classes, collections and exceptions.", category: "Programming", totalSeats: 20, availableSeats: 20 },
  { title: "Data Science Essentials", description: "Understand data preparation, analysis, visualisation and basic machine learning.", category: "Data Science", totalSeats: 18, availableSeats: 18 },
  { title: "Database Management", description: "Learn data modelling, queries, relationships and database design.", category: "Data Science", totalSeats: 22, availableSeats: 22 },
  { title: "React for Beginners", description: "Create component-based interfaces with props, state and reusable UI.", category: "Web Development", totalSeats: 15, availableSeats: 15 }
];
for (const course of courses) {
  await Course.updateOne({ title: course.title }, { $setOnInsert: course }, { upsert: true });
}
console.log("Sample courses added.");
await mongoose.disconnect();
