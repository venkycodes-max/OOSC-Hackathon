import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios.js";
import QuizRunner from "../components/QuizRunner.jsx";
import AppShell from "../components/AppShell.jsx";
import { getSubjectsForUser } from "../lib/onboarding.js";
import { useAuth } from "../context/AuthContext.jsx";
import { getSubjectQuiz } from "../lib/subjectQuizBank.js";
import { slugToSubject } from "../lib/trailUtils.js";

function responseSubject(payload) {
  return payload?.subject || payload?.quiz?.subject || payload?.data?.subject || null;
}

function questionSubject(question) {
  return question?.subject || question?.subjectName || question?.metadata?.subject || null;
}

const SUBJECT_TOPIC_HINTS = {
  Mathematics: [
    "real numbers", "polynomials", "linear equations", "quadratic equations", "arithmetic progressions",
    "triangles", "coordinate geometry", "trigonometry", "circles", "areas related to circles",
    "surface areas", "volumes", "statistics", "probability", "number systems", "algebra",
  ],
  Physics: [
    "light", "reflection", "refraction", "human eye", "electricity", "magnetic effects", "magnetism",
    "current", "resistance", "power", "energy", "motion", "force", "gravitation", "work", "sound",
  ],
  Chemistry: [
    "chemical reactions", "equations", "acids", "bases", "salts", "metals", "non-metals", "carbon compounds",
    "periodic classification", "periodic table", "chemical bonding", "oxidation", "reduction", "ph",
  ],
  Biology: [
    "life processes", "control and coordination", "reproduction", "heredity", "evolution", "our environment",
    "natural resources", "nutrition", "respiration", "transportation", "excretion", "nervous system",
    "hormones", "reproductive system", "ecosystem", "food chain", "photosynthesis",
  ],
  "Computer Science": [
    "python", "programming", "algorithms", "data structures", "stack", "queue", "sql", "database",
    "networks", "http", "computer networks", "cyber safety", "boolean", "logic",
  ],
  English: [
    "grammar", "parts of speech", "tenses", "modals", "subject verb agreement", "reported speech", "voice",
    "active voice", "passive voice", "vocabulary", "synonyms", "antonyms", "literary devices", "simile",
    "metaphor", "reading comprehension", "writing", "letter", "article", "story", "poetry", "prose", "theme",
  ],
};

function normalizeTopic(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function topicBelongsToSelectedSubject(topic, subject) {
  const normalized = normalizeTopic(topic);
  return Boolean(normalized) && (SUBJECT_TOPIC_HINTS[subject] || []).some((hint) => {
    const h = normalizeTopic(hint);
    return normalized === h || normalized.includes(h) || h.includes(normalized);
  });
}

function containsForeignSubjectTopic(question, subject) {
  const topic = normalizeTopic(question?.topic);
  if (!topic) return true;
  const allTopics = Object.entries(SUBJECT_TOPIC_HINTS)
    .filter(([name]) => normalizeTopic(name) !== normalizeTopic(subject))
    .flatMap(([, hints]) => hints.map(normalizeTopic));
  return allTopics.some((hint) => topic === hint || topic.includes(hint) || hint.includes(topic));
}

function isSubjectSafeQuiz(questions, subject, payload) {
  const declared = responseSubject(payload);
  if (declared && normalizeTopic(declared) !== normalizeTopic(subject)) return false;

  if (!Array.isArray(questions) || questions.length !== 6) return false;

  return questions.every((question) => {
    const declaredQuestionSubject = questionSubject(question);
    if (declaredQuestionSubject && normalizeTopic(declaredQuestionSubject) !== normalizeTopic(subject)) return false;
    if (containsForeignSubjectTopic(question, subject)) return false;
    return topicBelongsToSelectedSubject(question.topic, subject);
  });
}

function withSubjectLock(questions, subject) {
  return (questions || []).map((question) => ({ ...question, subject }));
}

export default function WeeklyQuizPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const availableSubjects = getSubjectsForUser(user);
  const subject = useMemo(() => slugToSubject(slug, availableSubjects), [slug, user?.studentClass, user?.branch]);
  const [questions, setQuestions] = useState(null);
  const [weekNumber, setWeekNumber] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [note, setNote] = useState("");
  const navigate = useNavigate();

  const isValidSubject = availableSubjects.some((item) => item.toLowerCase() === subject.toLowerCase());

  async function loadQuiz() {
    if (!isValidSubject) return;
    setLoading(true);
    setError("");
    setQuestions(null);
    try {
      const res = await api.get("/quiz/weekly/generate", { params: { subject } });
      const generated = res.data?.questions || res.data?.quiz?.questions || [];

      // Never render a question tagged for another subject. If the backend ignores
      // the subject parameter, use the subject-safe local bank instead.
      if (!isSubjectSafeQuiz(generated, subject, res.data)) {
        const fallback = getSubjectQuiz(subject);
        if (!fallback.length) throw new Error(`No ${subject} quiz is available yet.`);
        setQuestions(withSubjectLock(fallback, subject));
        setWeekNumber(res.data?.weekNumber ?? null);
      } else {
        setQuestions(withSubjectLock(generated, subject));
        setWeekNumber(res.data?.weekNumber ?? null);
      }
    } catch (err) {
      // If the backend route itself is unavailable, still keep the selected subject
      // locked and provide a subject-only quiz rather than showing a random subject.
      const fallback = getSubjectQuiz(subject);
      if (fallback.length) {
        setQuestions(withSubjectLock(fallback, subject));
        setError("Using the built-in subject-safe quiz while the weekly quiz service is unavailable.");
      } else {
        setError(err.response?.data?.error || err.message || `Could not load the ${subject} quiz.`);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete(answeredQuestions) {
    setSubmitting(true);
    setError("");
    try {
      const res = await api.post("/assessment/submit", {
        subject,
        questions: answeredQuestions.map((question) => ({ ...question, subject })),
        type: "weekly",
        weekNumber,
      });
      // The backend now persists/rebuilds the subject trail as part of the
      // assessment transaction. Keep a small fallback call for older servers.
      if (!res.data?.roadmapReady) {
        try { await api.post("/roadmap/refresh", { subject }); } catch { /* assessment remains saved */ }
      }
      setResult(res.data.assessment);
      try {
        const noteRes = await api.get("/quiz/weekly/note", {
          params: { subject, recentScore: res.data.assessment.score },
        });
        setNote(noteRes.data.note || "");
      } catch {
        setNote("");
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
        (err.response?.status === 502
          ? `The ${subject} quiz could not be completed. Please retry the quiz.`
          : `Could not submit this ${subject} quiz.`)
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!isValidSubject) {
    return <AppShell><div className="mx-auto w-full max-w-[1400px] px-5 py-12"><div className="dashboard-card p-8"><p className="eyebrow">Subject quizzes</p><h1 className="mt-2 font-display text-3xl font-semibold">Choose a subject first</h1><p className="mt-3 text-sm leading-6 text-slate">Weekly quizzes are available only from an individual subject page so a quiz can never switch to another subject.</p><div className="mt-6 flex flex-wrap gap-2">{availableSubjects.map((item) => <Link key={item} to={`/subjects/${item.toLowerCase().replace(/\s+/g, "-")}`} className="button-secondary !px-4 !py-2">{item}</Link>)}</div></div></div></AppShell>;
  }

  return (
    <AppShell>
      <div className="mx-auto flex min-h-[calc(100vh-68px)] max-w-3xl items-center justify-center px-5 py-10 sm:px-6">
        <div className="w-full max-w-lg">
          <p className="text-gold font-mono text-xs tracking-widest uppercase mb-3 text-center">{subject} · Subject Check-in</p>

          {!questions && !result && (
            <div className="dashboard-card p-6 sm:p-8">
              <div className="rounded-2xl bg-gold/10 border border-gold/20 px-4 py-3 mb-5">
                <p className="text-[10px] font-mono uppercase tracking-wider text-gold">Subject locked</p>
                <p className="mt-1 font-display text-2xl font-semibold">{subject}</p>
                <p className="mt-1 text-xs leading-5 text-slate">Every question in this check-in is restricted to {subject}.</p>
              </div>
              {error && <p className="text-rust text-sm mb-4">{error}</p>}
              <button onClick={loadQuiz} disabled={loading} className="button-primary w-full justify-center">{loading ? "Preparing subject quiz..." : `Start ${subject} quiz`}</button>
              <Link to={`/subjects/${slug}`} className="mt-3 inline-flex w-full justify-center text-xs font-semibold text-slate hover:text-ink">← Back to {subject}</Link>
            </div>
          )}

          {questions && !result && (
            <>
              {error && <p className="mb-3 rounded-xl bg-gold/10 px-4 py-3 text-xs leading-5 text-slate">{error}</p>}
              <QuizRunner questions={questions} onComplete={handleComplete} busy={submitting} />
            </>
          )}

          {result && (
            <div className="dashboard-card p-6 sm:p-8">
              <p className="text-xs font-mono text-slate mb-1">{subject} quiz score</p>
              <p className="text-5xl font-display font-semibold text-ink mb-4">{result.score}%</p>
              {note && <p className="text-ink text-sm leading-relaxed mb-6">{note}</p>}
              <div className="grid gap-2 sm:grid-cols-2">
                <Link to={`/subjects/${slug}`} className="button-primary justify-center">Back to {subject}</Link>
                <Link to="/learning-trail" className="button-secondary justify-center">View learning trail</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
