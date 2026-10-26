import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = Router();
const tokenFor = user => jwt.sign({ id: user._id, name: user.name, email: user.email },
  process.env.JWT_SECRET || "development_secret_change_me", { expiresIn: "1d" });

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: "Name, email and password are required." });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: "Enter a valid email address." });
    if (password.length < 6) return res.status(400).json({ message: "Password must contain at least 6 characters." });
    const normalizedEmail = email.toLowerCase().trim();
    if (await User.findOne({ email: normalizedEmail })) return res.status(409).json({ message: "An account with this email already exists." });
    const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash: await bcrypt.hash(password, 10) });
    res.status(201).json({ token: tokenFor(user), user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) { next(err); }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required." });
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: "Incorrect email or password." });
    res.json({ token: tokenFor(user), user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) { next(err); }
});
export default router;
