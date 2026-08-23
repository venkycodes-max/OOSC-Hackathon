import express from "express";
import { requireAuth } from "../middleware/auth.js";
import User from "../models/User.js";
import Assessment from "../models/Assessment.js";
import Progress from "../models/Progress.js";
import { SUBJECTS, SUBJECT_CURRICULUM, isValidSubject, canonicalTopicForSubject } from "../lib/subjectRules.js";

const router = express.Router();

router.get("/subject", requireAuth, async (req, res) => {
  try {
    const subject = String(req.query.subject || "").trim();
    if (!isValidSubject(subject)) {
      return res.status(400).json({ error: `Invalid subject. Choose one of: ${SUBJECTS.join(", ")}.` });
    }

    const [user, assessments, globalProgress] = await Promise.all([
      User.findById(req.userId).lean(),
      Assessment.find({ user: req.userId, subject }).sort({ createdAt: -1 }).limit(200).lean(),
      Progress.findOne({ user: req.userId }).lean(),
    ]);

    const hasAssessment = assessments.length > 0;
    const stats = new Map((SUBJECT_CURRICULUM[subject] || []).map((topic) => [topic, { correct: 0, total: 0 }]));

    for (const assessment of assessments) {
      for (const question of assessment.questions || []) {
        const canonical = canonicalTopicForSubject(question.topic, subject);
        if (!canonical || !stats.has(canonical)) continue;
        const item = stats.get(canonical);
        item.total += 1;
        if (question.isCorrect) item.correct += 1;
      }
    }

    const topicsWeak = [...stats.entries()]
      .filter(([, s]) => s.total > 0 && s.correct / s.total < 0.6)
      .sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total))
      .map(([topic]) => topic);
    const topicsMastered = [...stats.entries()]
      .filter(([, s]) => s.total > 0 && s.correct / s.total >= 0.8)
      .sort((a, b) => (b[1].correct / b[1].total) - (a[1].correct / a[1].total))
      .map(([topic]) => topic);

    const latest = assessments[0] || null;
    const scoreHistory = [...assessments].reverse().map((item) => ({
      date: item.createdAt,
      score: item.score,
      context: item.type === "initial" ? "initial-assessment" : `weekly-quiz-${item.weekNumber ?? ""}`,
    }));

    const summary = !hasAssessment
      ? `Take the ${subject} quiz so Trailhead can assess your starting point and build this subject's learning trail.`
      : topicsWeak.length
        ? `Your ${subject} results show that ${topicsWeak.slice(0, 2).join(" and ")} need more practice. Your route has moved those areas forward while keeping the rest of the curriculum in view.`
        : `Your ${subject} results show a solid baseline so far. Keep checking in so Trailhead can refine which topics need more attention.`;

    res.json({
      subject,
      studentClass: user?.studentClass || "",
      hasAssessment,
      summary,
      progress: {
        latestScore: latest?.score ?? null,
        scoreHistory,
        topicsWeak,
        topicsMastered,
        weeklyQuizzesTaken: assessments.filter((a) => a.type === "weekly").length,
        lastActiveAt: latest?.createdAt || globalProgress?.lastActiveAt || null,
      },
      recentAssessments: assessments,
    });
  } catch (err) {
    console.error("Subject progress error:", err);
    res.status(500).json({ error: "Could not load subject progress." });
  }
});

export default router;
