import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Progress from "../models/Progress.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "30d" });
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    studentClass: user.studentClass,
    aim: user.aim,
    aimDetail: user.aimDetail,
    onboardingStage: user.onboardingStage,
    branch: user.branch || "",
  };
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, studentClass, branch = "" } = req.body;
    if (!name || !email || !password || !studentClass) {
      return res.status(400).json({ error: "Name, email, password, and class are all required." });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const isUG = /^UG\s+Year\s+[1-4]$/i.test(String(studentClass).trim());
    const allowedBranches = ["Computer Science", "Mechanical Engineering", "Electrical Engineering", "Electronics & Communication Engineering"];
    if (isUG && !allowedBranches.includes(branch)) {
      return res.status(400).json({ error: "Please choose your UG branch." });
    }
    if (!isUG && branch) {
      return res.status(400).json({ error: "Branch is only required for UG students." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      studentClass,
      branch: isUG ? branch : "",
    });

    await Progress.create({ user: user._id });

    const token = signToken(user._id);
    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ error: "Registration failed.", detail: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = signToken(user._id);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ error: "Login failed.", detail: err.message });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: "User not found." });
  res.json({ user: publicUser(user) });
});

export default router;
