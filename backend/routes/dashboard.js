import express from "express";
import { requireAuth } from "../middleware/auth.js";
import User from "../models/User.js";
import Progress from "../models/Progress.js";
import Roadmap from "../models/Roadmap.js";
import Assessment from "../models/Assessment.js";
import { canonicalTopicForSubject } from "../lib/subjectRules.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    const [storedProgress, roadmap, recentAssessments, allAssessments] = await Promise.all([
      Progress.findOne({ user: req.userId }).lean(),
      Roadmap.findOne({ user: req.userId }).sort({ updatedAt: -1 }).lean(),
      Assessment.find({ user: req.userId }).sort({ createdAt: -1 }).limit(20).lean(),
      Assessment.find({ user: req.userId }).sort({ createdAt: -1 }).limit(200).lean(),
    ]);

    const weak = new Set();
    const strong = new Set();
    for (const assessment of allAssessments) {
      for (const topic of assessment.weakTopics || []) {
        const canonical = canonicalTopicForSubject(topic, assessment.subject);
        if (canonical) { weak.add(canonical); strong.delete(canonical); }
      }
      for (const topic of assessment.strongTopics || []) {
        const canonical = canonicalTopicForSubject(topic, assessment.subject);
        if (canonical) { strong.add(canonical); weak.delete(canonical); }
      }
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        studentClass: user.studentClass,
        aim: user.aim,
        aimDetail: user.aimDetail,
        onboardingStage: user.onboardingStage,
      },
      progress: {
        ...(storedProgress || {}),
        topicsWeak: [...weak],
        topicsMastered: [...strong],
      },
      roadmap,
      recentAssessments: recentAssessments.filter((item) => String(item.user) === String(req.userId)),
    });
  } catch (err) {
    res.status(500).json({ error: "Could not load dashboard.", detail: err.message });
  }
});

export default router;
