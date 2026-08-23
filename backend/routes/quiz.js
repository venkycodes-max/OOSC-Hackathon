import express from "express";
import { requireAuth } from "../middleware/auth.js";
import User from "../models/User.js";
import Progress from "../models/Progress.js";
import Assessment from "../models/Assessment.js";
import { generateWeeklyQuiz, updateProgressNarrative } from "../services/aiService.js";
import { ALL_SUBJECTS, SUBJECTS, SUBJECT_TOPIC_ALIASES, isValidSubject, topicBelongsToSubject, validateQuiz } from "../lib/subjectRules.js";
import { getSubjectQuiz } from "../lib/subjectQuizBank.js";

const router = express.Router();

function subjectFromQuery(value) {
  const subject = String(value || "").trim();
  return ALL_SUBJECTS.find((item) => item.toLowerCase() === subject.toLowerCase()) || null;
}

router.get("/weekly/generate", requireAuth, async (req, res) => {
  try {
    const subject = subjectFromQuery(req.query.subject);
    if (!subject || !isValidSubject(subject)) {
      return res.status(400).json({ error: "Choose one valid subject before starting the quiz." });
    }

    const user = await User.findById(req.userId);
    const progress = await Progress.findOne({ user: req.userId });
    if (!user) return res.status(404).json({ error: "User not found." });

    if (!progress || progress.topicsWeak.length === 0) {
      return res.status(400).json({
        error: "Take the initial diagnostic assessment first so we know what to focus this quiz on.",
      });
    }

    const allowedTopics = SUBJECT_TOPIC_ALIASES[subject] || [];
    // Progress is currently stored as a running user-level list. Filter it by
    // the selected subject so weak Biology topics can never influence English,
    // Maths, etc. quizzes.
    const subjectWeakTopics = (progress.topicsWeak || []).filter((topic) => topicBelongsToSubject(topic, subject));

    let quiz;
    try {
      quiz = await generateWeeklyQuiz({
        subject,
        studentClass: user.studentClass,
        weakTopics: subjectWeakTopics,
        allowedTopics,
      });
    } catch (aiError) {
      console.error("Weekly quiz AI generation failed:", aiError);
      quiz = null;
    }

    let questions = quiz?.questions || [];

    // Hard safety boundary: the AI response is accepted only when every question
    // is structurally valid AND belongs to the requested subject/topic set.
    if (!validateQuiz(questions, subject, 6)) {
      questions = getSubjectQuiz(subject, 6).map((q) => ({ ...q, subject }));
    }

    if (!validateQuiz(questions, subject, 6)) {
      return res.status(503).json({ error: `A ${subject} quiz is not available right now.` });
    }

    const weekNumber = progress.weeklyQuizzesTaken + 1;
    res.json({ subject, weekNumber, questions });
  } catch (err) {
    console.error("Weekly quiz error:", err);
    res.status(500).json({ error: "Could not prepare this subject quiz right now." });
  }
});

router.get("/weekly/note", requireAuth, async (req, res) => {
  try {
    const subject = subjectFromQuery(req.query.subject);
    if (!subject) return res.status(400).json({ error: "Invalid subject." });

    const { recentScore } = req.query;
    const user = await User.findById(req.userId);
    const progress = await Progress.findOne({ user: req.userId });

    const subjectWeakTopics = (progress?.topicsWeak || []).filter((topic) => topicBelongsToSubject(topic, subject));
    const subjectStrongTopics = (progress?.topicsMastered || []).filter((topic) => topicBelongsToSubject(topic, subject));

    const result = await updateProgressNarrative({
      studentClass: user.studentClass,
      subject,
      weakTopics: subjectWeakTopics,
      strongTopics: subjectStrongTopics,
      recentScore: Number(recentScore) || 0,
    });

    res.json(result);
  } catch (err) {
    res.status(502).json({ error: "Could not generate feedback right now.", detail: err.message });
  }
});

router.get("/history", requireAuth, async (req, res) => {
  const subject = req.query.subject ? subjectFromQuery(req.query.subject) : null;
  const filter = { user: req.userId, type: "weekly" };
  if (req.query.subject && !subject) return res.status(400).json({ error: "Invalid subject." });
  if (subject) filter.subject = subject;
  const history = await Assessment.find(filter).sort({ createdAt: -1 });
  res.json({ history });
});

export default router;
