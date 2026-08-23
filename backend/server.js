import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/auth.js";
import assessmentRoutes from "./routes/assessment.js";
import roadmapRoutes from "./routes/roadmap.js";
import quizRoutes from "./routes/quiz.js";
import dashboardRoutes from "./routes/dashboard.js";
import doubtRoutes from "./routes/doubts.js";
import progressRoutes from "./routes/progress.js";
import Roadmap from "./models/Roadmap.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN?.split(",") || "*",
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/assessment", assessmentRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/doubts", doubtRoutes);
app.use("/api/progress", progressRoutes);

app.use((req, res) => res.status(404).json({ error: "Route not found." }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  if (err?.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "File is too large. Please keep uploads under 10 MB." });
  }
  if (err?.message?.startsWith("Unsupported file type")) {
    return res.status(415).json({ error: err.message });
  }
  return res.status(500).json({ error: "Something went wrong on the server." });
});

const PORT = process.env.PORT || 5000;

async function bootstrapRoadmapIndexes() {
  // Upgrade older databases automatically. This preserves existing roadmap data
  // and removes the old one-roadmap-per-user constraint so every subject can have
  // its own trail.
  try {
    await Roadmap.collection.updateMany(
      { $or: [{ subject: { $exists: false } }, { subject: null }, { subject: "" }] },
      { $set: { subject: "Mathematics" } }
    );
  } catch (error) {
    console.error("Roadmap legacy-data migration warning:", error.message);
  }

  try {
    await Roadmap.collection.dropIndex("user_1");
    console.log("Dropped legacy Roadmap user_1 index.");
  } catch (error) {
    if (!String(error.message).toLowerCase().includes("index not found")) {
      console.log("Legacy roadmap index note:", error.message);
    }
  }

  await Roadmap.syncIndexes();
  console.log("Roadmap indexes ready: one roadmap per user per subject.");
}

connectDB().then(async () => {
  await bootstrapRoadmapIndexes();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch((error) => {
  console.error("Server startup failed:", error);
  process.exit(1);
});
