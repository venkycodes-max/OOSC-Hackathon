import express from "express";
import { requireAuth } from "../middleware/auth.js";
import User from "../models/User.js";
import Roadmap from "../models/Roadmap.js";
import Assessment from "../models/Assessment.js";
import { SUBJECTS, getSubjectsForUser, isValidSubject } from "../lib/subjectRules.js";
import { ensureSubjectRoadmap, roadmapBelongsToSubject } from "../services/roadmapService.js";

const router = express.Router();

const AIM_LABELS = {
  "entrance-exam": "Preparing for an entrance exam",
  "btech-placements": "Preparing for B.Tech placements",
  "school-college-studies": "General school/college studies",
  "general-improvement": "General academic improvement",
};

router.post("/set-aim", requireAuth, async (req, res) => {
  try {
    const { aim, aimDetail = "", subject = "Mathematics" } = req.body;
    if (!AIM_LABELS[aim]) return res.status(400).json({ error: "Invalid aim selection." });
    if (!isValidSubject(subject)) return res.status(400).json({ error: "Invalid subject." });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found." });
    if (!getSubjectsForUser(user).includes(subject)) return res.status(400).json({ error: "That subject is not available for your course." });

    user.aim = aim;
    user.aimDetail = aimDetail;
    user.onboardingStage = "roadmap-ready";
    await user.save();

    // A new-account overall diagnostic creates one baseline assessment per
    // subject. Build every available subject trail now, so the dashboard is populated
    // immediately after the student chooses an aim. Subject quizzes later
    // refresh only their own trail.
    const roadmaps = {};
    for (const currentSubject of getSubjectsForUser(user)) {
      const currentRoadmap = await ensureSubjectRoadmap(user, currentSubject, { useAI: false });
      if (currentRoadmap) roadmaps[currentSubject] = currentRoadmap;
    }

    user.onboardingStage = "complete";
    await user.save();

    res.json({ roadmap: roadmaps[subject] || null, roadmaps });
  } catch (err) {
    console.error("Set aim/roadmap error:", err);
    res.status(502).json({ error: "Could not generate a roadmap right now.", detail: err.message });
  }
});

router.post("/refresh", requireAuth, async (req, res) => {
  try {
    const subject = String(req.body.subject || "").trim();
    if (!isValidSubject(subject)) return res.status(400).json({ error: "Invalid subject." });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found." });
    if (!getSubjectsForUser(user).includes(subject)) return res.status(400).json({ error: "That subject is not available for your course." });

    const roadmap = await ensureSubjectRoadmap(user, subject);
    if (!roadmap) return res.status(409).json({ error: `Complete at least one ${subject} assessment before building this trail.` });
    res.json({ roadmap });
  } catch (err) {
    console.error("Roadmap refresh error:", err);
    res.status(500).json({ error: "Could not refresh this subject's trail right now.", detail: err.message });
  }
});

router.get("/", requireAuth, async (req, res) => {
  try {
    const subject = String(req.query.subject || "").trim();
    if (!isValidSubject(subject)) return res.status(400).json({ error: `A valid subject is required. Choose one of: ${SUBJECTS.join(", ")}.` });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found." });
    if (!getSubjectsForUser(user).includes(subject)) return res.status(400).json({ error: "That subject is not available for your course." });

    let roadmap = await Roadmap.findOne({ user: req.userId, subject });
    const latestAssessment = await Assessment.findOne({ user: req.userId, subject }).sort({ createdAt: -1 }).lean();

    if (latestAssessment) {
      const roadmapTime = roadmap?.latestAssessmentAt || roadmap?.generatedAt || roadmap?.updatedAt || null;
      const isMissing = !roadmap;
      const isStale = roadmapTime && new Date(latestAssessment.createdAt) > new Date(roadmapTime);
      const isCrossSubjectOrCorrupt = roadmap && !roadmapBelongsToSubject(roadmap, subject);

      // Self-heal missing, stale, legacy-cross-subject, or structurally
      // incomplete trails. This prevents an old English roadmap from being
      // displayed after the user switches to Computer Science, for example.
      if (isMissing || isStale || isCrossSubjectOrCorrupt) {
        if (user) roadmap = await ensureSubjectRoadmap(user, subject);
      }
    } else if (roadmap && !roadmapBelongsToSubject(roadmap, subject)) {
      // No assessment means there should be no usable personalized roadmap.
      roadmap = null;
    }

    if (!roadmap) {
      return res.status(404).json({
        error: `Take the ${subject} quiz so an assessment is available to build this subject's trail.`,
        hasAssessment: Boolean(latestAssessment),
      });
    }
    res.json({ roadmap, latestAssessmentAt: latestAssessment?.createdAt || null });
  } catch (err) {
    console.error("Roadmap load error:", err);
    res.status(500).json({ error: "Could not load the roadmap." });
  }
});

router.patch("/milestone/:milestoneId", requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const subject = String(req.body.subject || req.query.subject || "").trim();
    if (!isValidSubject(subject)) return res.status(400).json({ error: "A valid subject is required." });
    if (!["upcoming", "in-progress", "mastered"].includes(status)) return res.status(400).json({ error: "Invalid status." });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found." });
    if (!getSubjectsForUser(user).includes(subject)) return res.status(400).json({ error: "That subject is not available for your course." });
    const roadmap = await Roadmap.findOne({ user: req.userId, subject });
    if (!roadmap) return res.status(404).json({ error: "No roadmap found." });
    const milestone = roadmap.milestones.id(req.params.milestoneId);
    if (!milestone) return res.status(404).json({ error: "Milestone not found." });

    milestone.status = status;
    await roadmap.save();
    res.json({ roadmap });
  } catch (err) {
    res.status(500).json({ error: "Could not update milestone." });
  }
});

export default router;
