import express from "express";
import { requireAuth } from "../middleware/auth.js";
import User from "../models/User.js";
import Progress from "../models/Progress.js";
import Assessment from "../models/Assessment.js";
import { generateAssessmentQuestions, generateOnboardingAssessmentQuestions, analyzeAssessmentGaps } from "../services/aiService.js";
import { ensureSubjectRoadmap } from "../services/roadmapService.js";
import {
  SUBJECTS,
  getSubjectsForUser,
  isValidSubject,
  questionBelongsToSubject,
  normalizeQuestionForSubject,
  canonicalTopicForSubject,
  validateOnboardingDiagnostic,
  canonicalDiagnosticTopicForSubject,
} from "../lib/subjectRules.js";
import { getSubjectQuiz } from "../lib/subjectQuizBank.js";
import { getOnboardingDiagnostic } from "../lib/onboardingAssessmentBank.js";
import { getOnboardingSubjectCounts } from "../lib/diagnosticRules.js";

const router = express.Router();

function flattenDiagnostic(result) {
  return [
    ...(result?.easy || []),
    ...(result?.medium || []),
    ...(result?.hard || []),
  ];
}

function normalizeMixedQuestions(rawQuestions, allowedSubjects = SUBJECTS) {
  return (rawQuestions || []).map((question) => {
    const subject = allowedSubjects.find((item) => String(item).toLowerCase() === String(question?.subject || "").toLowerCase());
    if (!subject) return null;
    const topic = canonicalDiagnosticTopicForSubject(question?.topic, subject);
    const options = Array.isArray(question?.options) ? question.options.map((option) => String(option ?? "").trim()) : [];
    const difficulty = String(question?.difficulty || "").toLowerCase();
    if (!topic || !question?.question || options.length !== 4 || !question?.correctAnswer || !options.includes(String(question.correctAnswer).trim())) return null;
    if (!["easy", "medium", "hard"].includes(difficulty)) return null;
    if (options.every((option) => /^[A-D](?:[.)])?$/i.test(option))) return null;
    return {
      ...question,
      subject,
      topic,
      difficulty,
      challenge: String(question.challenge || "standard").toLowerCase() === "extreme" ? "extreme" : "standard",
      options,
      correctAnswer: String(question.correctAnswer).trim(),
      studentAnswer: question.studentAnswer == null ? "" : String(question.studentAnswer).trim(),
    };
  }).filter(Boolean);
}

function buildMixedFallback(user) {
  const questions = getOnboardingDiagnostic({ studentClass: user?.studentClass, branch: user?.branch });
  // The fallback bank is authored with actual answer text and is therefore safe
  // to use for a new-account baseline even if the AI service is unavailable.
  return questions;
}

function subjectGapAnalysis(gradedQuestions, subject) {
  const byTopic = new Map();
  for (const q of gradedQuestions) {
    const topic = canonicalTopicForSubject(q.topic, subject);
    if (!topic) continue;
    if (!byTopic.has(topic)) byTopic.set(topic, { correct: 0, total: 0 });
    const item = byTopic.get(topic);
    item.total += 1;
    if (q.isCorrect) item.correct += 1;
  }

  const entries = [...byTopic.entries()].map(([topic, stats]) => ({
    topic,
    accuracy: stats.total ? stats.correct / stats.total : 0,
  })).sort((a, b) => a.accuracy - b.accuracy);

  const weakTopics = entries.filter((item) => item.accuracy < 0.5).map((item) => item.topic).slice(0, 6);
  const strongTopics = entries.filter((item) => item.accuracy >= 0.75).sort((a, b) => b.accuracy - a.accuracy).map((item) => item.topic).slice(0, 6);
  const summary = weakTopics.length
    ? `Your ${subject} baseline shows that ${weakTopics.slice(0, 2).join(" and ")} need more practice.`
    : `Your ${subject} baseline is a useful starting point. Keep testing this subject so Trailhead can refine the route.`;
  return { weakTopics, strongTopics, summary };
}

function gradeQuestions(normalizedQuestions) {
  return normalizedQuestions.map((q) => ({
    ...q,
    isCorrect: (q.studentAnswer || "").trim() === (q.correctAnswer || "").trim(),
  }));
}

async function saveAssessment({ user, subject, graded, type, weekNumber, gapAnalysis }) {
  const correctCount = graded.filter((q) => q.isCorrect).length;
  const score = Math.round((correctCount / graded.length) * 100);
  return Assessment.create({
    user: user._id,
    subject,
    studentClass: user.studentClass,
    questions: graded.map((q) => ({
      question: String(q.question || "").trim(),
      topic: canonicalTopicForSubject(q.topic, subject) || String(q.topic || "").trim(),
      difficulty: ["easy", "medium", "hard"].includes(q.difficulty) ? q.difficulty : "easy",
      challenge: q.challenge === "extreme" ? "extreme" : "standard",
      options: Array.isArray(q.options) ? q.options.map((option) => String(option ?? "").trim()) : [],
      correctAnswer: String(q.correctAnswer || "").trim(),
      studentAnswer: String(q.studentAnswer || "").trim(),
      isCorrect: Boolean(q.isCorrect),
    })),
    score,
    totalQuestions: graded.length,
    weakTopics: gapAnalysis.weakTopics,
    strongTopics: gapAnalysis.strongTopics,
    summary: gapAnalysis.summary,
    type,
    weekNumber: weekNumber == null ? null : Number(weekNumber),
  });
}

// NEW ACCOUNT ONLY: one overall diagnostic, mixed across the subjects available to the user.
// This route is intentionally separate from the subject-specific diagnostic so
// logged-in users taking a subject quiz are never switched into mixed mode.
router.get("/onboarding/generate", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    if (!["welcome", "assessment"].includes(user.onboardingStage)) {
      return res.status(409).json({ error: "The overall new-account assessment is only available during account setup." });
    }

    let mixed = [];
    try {
      const generated = await generateOnboardingAssessmentQuestions({ studentClass: user.studentClass, branch: user.branch });
      mixed = normalizeMixedQuestions(generated.questions);
    } catch (error) {
      console.error("Overall onboarding diagnostic AI generation failed; using fallback:", error.message);
    }

    const onboardingSubjects = getSubjectsForUser(user);
    const onboardingCounts = getOnboardingSubjectCounts(user.branch, user.studentClass);
    if (!validateOnboardingDiagnostic(mixed, 25, onboardingSubjects, onboardingCounts, user.studentClass)) mixed = buildMixedFallback(user);
    if (!validateOnboardingDiagnostic(mixed, 25, onboardingSubjects, onboardingCounts, user.studentClass)) {
      return res.status(503).json({ error: "The overall diagnostic is not available right now." });
    }

    user.onboardingStage = "assessment";
    await user.save();

    res.json({
      mode: "onboarding",
      studentClass: user.studentClass,
      questions: mixed,
      subjects: onboardingSubjects,
    });
  } catch (err) {
    console.error("Onboarding assessment generation failed:", err);
    res.status(502).json({ error: "Could not generate the overall assessment right now.", detail: err.message });
  }
});

// Existing subject-specific diagnostic route. This remains subject-locked and is
// not used by the new-account mixed assessment.
router.get("/generate", requireAuth, async (req, res) => {
  try {
    const { subject = "Mathematics" } = req.query;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found." });
    if (!isValidSubject(subject)) return res.status(400).json({ error: `Invalid subject. Choose one of: ${SUBJECTS.join(", ")}.` });
    if (!getSubjectsForUser(user).includes(subject)) return res.status(400).json({ error: "That subject is not available for your course." });

    let questions = await generateAssessmentQuestions({ subject, studentClass: user.studentClass, branch: user.branch });
    const flat = flattenDiagnostic(questions).map((q) => normalizeQuestionForSubject(q, subject)).filter(Boolean);

    if (flat.length !== 12) {
      const fallback = getSubjectQuiz(subject, 12).map((q) => ({ ...q, subject }));
      if (fallback.length !== 12 || !fallback.every((q) => questionBelongsToSubject(q, subject))) {
        return res.status(503).json({ error: `A ${subject} diagnostic is not available right now.` });
      }
      questions = { easy: fallback.slice(0, 4), medium: fallback.slice(4, 8), hard: fallback.slice(8, 12) };
    } else {
      questions = { easy: flat.slice(0, 4), medium: flat.slice(4, 8), hard: flat.slice(8, 12) };
    }

    res.json({ subject, studentClass: user.studentClass, questions });
  } catch (err) {
    res.status(502).json({ error: "Could not generate the assessment right now.", detail: err.message });
  }
});

// Submit both the subject-specific quizzes and the NEW ACCOUNT overall mixed diagnostic.
router.post("/submit", requireAuth, async (req, res) => {
  try {
    const {
      subject,
      questions: submittedQuestions,
      type = "initial",
      weekNumber = null,
      mode = "subject",
    } = req.body;

    if (!Array.isArray(submittedQuestions) || submittedQuestions.length === 0) {
      return res.status(400).json({ error: "No questions submitted." });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    // -----------------------------------------------------------------------
    // NEW ACCOUNT OVERALL DIAGNOSTIC
    // -----------------------------------------------------------------------
    if (mode === "onboarding") {
      if (!["welcome", "assessment"].includes(user.onboardingStage)) {
        return res.status(409).json({ error: "The overall diagnostic has already been completed for this account." });
      }
      if (submittedQuestions.length !== 25) {
        return res.status(400).json({ error: "The overall diagnostic must contain exactly 25 questions." });
      }

      const onboardingSubjects = getSubjectsForUser(user);
      const onboardingCounts = getOnboardingSubjectCounts(user.branch, user.studentClass);
      const normalizedMixed = normalizeMixedQuestions(submittedQuestions, onboardingSubjects);
      if (!validateOnboardingDiagnostic(normalizedMixed, 25, onboardingSubjects, onboardingCounts, user.studentClass)) {
        return res.status(400).json({ error: "The overall diagnostic contains an invalid subject, topic, difficulty, or answer choice. Please start a fresh diagnostic." });
      }

      const gradedMixed = gradeQuestions(normalizedMixed);
      const overallCorrect = gradedMixed.filter((q) => q.isCorrect).length;
      const overallScore = Math.round((overallCorrect / gradedMixed.length) * 100);

      const subjectAssessments = [];
      try {
        for (const currentSubject of onboardingSubjects) {
          const subjectQuestions = gradedMixed.filter((q) => q.subject === currentSubject);
          const gapAnalysis = subjectGapAnalysis(subjectQuestions, currentSubject);
          const saved = await saveAssessment({
            user,
            subject: currentSubject,
            graded: subjectQuestions,
            type: "initial",
            weekNumber: null,
            gapAnalysis,
          });
          subjectAssessments.push(saved);
        }

        // Also keep one overall record for history/audit. Subject pages never use
        // this record, so it cannot contaminate any subject trail.
        const overall = await Assessment.create({
          user: user._id,
          subject: "Overall",
          studentClass: user.studentClass,
          questions: gradedMixed.map((q) => ({
            question: q.question,
            topic: q.topic,
            difficulty: q.difficulty,
            options: q.options,
            correctAnswer: q.correctAnswer,
            studentAnswer: q.studentAnswer,
            isCorrect: q.isCorrect,
          })),
          score: overallScore,
          totalQuestions: 25,
          weakTopics: gradedMixed.filter((q) => !q.isCorrect).map((q) => `${q.subject}: ${q.topic}`),
          strongTopics: gradedMixed.filter((q) => q.isCorrect).map((q) => `${q.subject}: ${q.topic}`),
          summary: `Your overall baseline is ${overallScore}%. Trailhead assessed the subjects available to your course so each can start with its own learning route.`,
          type: "initial",
          weekNumber: null,
        });

        let progress = await Progress.findOne({ user: user._id });
        if (!progress) progress = await Progress.create({ user: user._id });
        if (!Array.isArray(progress.overallScoreHistory)) progress.overallScoreHistory = [];
        progress.overallScoreHistory.push({ score: overallScore, context: "overall-diagnostic" });
        progress.lastActiveAt = new Date();
        await progress.save();

        user.onboardingStage = "aim-selection";
        await user.save();

        return res.json({
          mode: "onboarding",
          assessment: overall,
          subjectAssessments,
          overallScore,
          roadmapReady: false,
        });
      } catch (saveError) {
        console.error("Overall diagnostic persistence failed:", saveError);
        return res.status(500).json({ error: "Your diagnostic could not be saved completely. Please try again." });
      }
    }

    // -----------------------------------------------------------------------
    // EXISTING SUBJECT-SPECIFIC FLOW — UNCHANGED IN BEHAVIOUR
    // -----------------------------------------------------------------------
    if (!isValidSubject(subject)) {
      return res.status(400).json({ error: `Invalid subject. Choose one of: ${SUBJECTS.join(", ")}.` });
    }
    if (!getSubjectsForUser(user).includes(subject)) {
      return res.status(400).json({ error: "That subject is not available for your course." });
    }

    const normalizedQuestions = submittedQuestions.map((q) => normalizeQuestionForSubject(q, subject));
    if (normalizedQuestions.some((q) => !q)) {
      return res.status(400).json({
        error: `One or more questions could not be verified as ${subject} questions. The submission was blocked to protect your subject progress. Please start a fresh ${subject} quiz.`,
      });
    }

    const graded = gradeQuestions(normalizedQuestions);
    const correctCount = graded.filter((q) => q.isCorrect).length;
    const score = Math.round((correctCount / graded.length) * 100);
    const fallbackGapAnalysis = subjectGapAnalysis(graded, subject);

    let assessment;
    try {
      assessment = await saveAssessment({ user, subject, graded, type, weekNumber, gapAnalysis: fallbackGapAnalysis });
    } catch (saveError) {
      console.error("Assessment persistence failed:", saveError);
      if (saveError?.name === "ValidationError") {
        return res.status(400).json({ error: "The assessment could not be saved because one of the submitted questions had invalid data. Please start a fresh quiz." });
      }
      throw saveError;
    }

    let gapAnalysis = fallbackGapAnalysis;
    try {
      const aiAnalysis = await analyzeAssessmentGaps({ subject, studentClass: user.studentClass, gradedQuestions: graded });
      if (Array.isArray(aiAnalysis?.weakTopics) || Array.isArray(aiAnalysis?.strongTopics)) {
        const weakTopics = (Array.isArray(aiAnalysis.weakTopics) ? aiAnalysis.weakTopics : fallbackGapAnalysis.weakTopics)
          .map((topic) => canonicalTopicForSubject(topic, subject)).filter(Boolean);
        const strongTopics = (Array.isArray(aiAnalysis.strongTopics) ? aiAnalysis.strongTopics : fallbackGapAnalysis.strongTopics)
          .map((topic) => canonicalTopicForSubject(topic, subject)).filter(Boolean);
        gapAnalysis = {
          weakTopics: [...new Set(weakTopics)],
          strongTopics: [...new Set(strongTopics)],
          summary: aiAnalysis.summary || fallbackGapAnalysis.summary,
        };
        assessment.weakTopics = gapAnalysis.weakTopics;
        assessment.strongTopics = gapAnalysis.strongTopics;
        assessment.summary = gapAnalysis.summary;
        await assessment.save();
      }
    } catch (analysisError) {
      console.error("Assessment AI analysis failed; keeping deterministic results:", analysisError.message);
    }

    try {
      let progress = await Progress.findOne({ user: user._id });
      if (!progress) progress = await Progress.create({ user: user._id });
      const mergedWeak = new Set([...(progress.topicsWeak || [])]);
      const mergedStrong = new Set([...(progress.topicsMastered || [])]);
      (gapAnalysis.weakTopics || []).forEach((t) => {
        const canonical = canonicalTopicForSubject(t, subject);
        if (!canonical) return;
        mergedWeak.add(canonical);
        mergedStrong.delete(canonical);
      });
      (gapAnalysis.strongTopics || []).forEach((t) => {
        const canonical = canonicalTopicForSubject(t, subject);
        if (!canonical) return;
        mergedStrong.add(canonical);
        mergedWeak.delete(canonical);
      });
      progress.topicsWeak = [...mergedWeak];
      progress.topicsMastered = [...mergedStrong];
      if (!Array.isArray(progress.overallScoreHistory)) progress.overallScoreHistory = [];
      progress.overallScoreHistory.push({ score, context: type === "initial" ? "initial-assessment" : `weekly-quiz-${weekNumber ?? ""}` });
      progress.lastActiveAt = new Date();
      if (type === "weekly") progress.weeklyQuizzesTaken = Number(progress.weeklyQuizzesTaken || 0) + 1;
      await progress.save();
      if (type === "initial") {
        user.onboardingStage = "aim-selection";
        await user.save();
      }
    } catch (progressError) {
      console.error("Progress update failed after assessment was saved:", progressError);
    }

    let roadmap = null;
    try {
      roadmap = await ensureSubjectRoadmap(user, subject);
    } catch (roadmapError) {
      console.error("Roadmap update after assessment failed:", roadmapError.message);
    }

    res.json({ assessment, roadmap, roadmapReady: Boolean(roadmap) });
  } catch (err) {
    console.error("Assessment submit failed before a successful response:", err);
    res.status(502).json({ error: "Could not complete the assessment right now. Please try again.", detail: err.message });
  }
});

router.get("/history", requireAuth, async (req, res) => {
  try {
    const filter = { user: req.userId };
    if (req.query.subject) {
      const requested = String(req.query.subject);
      if (!isValidSubject(requested) && requested !== "Overall") return res.status(400).json({ error: "Invalid subject." });
      filter.subject = requested;
    }
    if (req.query.type) {
      if (!["initial", "weekly"].includes(String(req.query.type))) return res.status(400).json({ error: "Invalid assessment type." });
      filter.type = String(req.query.type);
    }
    const requestedLimit = Number(req.query.limit);
    const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(Math.floor(requestedLimit), 1), 500) : 200;
    const history = await Assessment.find({ ...filter, user: req.userId }).sort({ createdAt: -1 }).limit(limit).lean();
    const ownedHistory = history.filter((item) => String(item.user) === String(req.userId));
    res.json({ history: ownedHistory, count: ownedHistory.length });
  } catch (err) {
    console.error("Assessment history error:", err);
    res.status(500).json({ error: "Could not load assessment history." });
  }
});

export default router;
