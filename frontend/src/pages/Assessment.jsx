import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import QuizRunner from "../components/QuizRunner.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Assessment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const onboardingMode = location.state?.mode === "onboarding" || ["welcome", "assessment"].includes(user?.onboardingStage);
  const subject = location.state?.subject || "Mathematics";

  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    const request = onboardingMode
      ? api.get("/assessment/onboarding/generate")
      : api.get("/assessment/generate", { params: { subject } });

    request
      .then((res) => {
        if (cancelled) return;
        if (onboardingMode) {
          setQuestions(res.data.questions || []);
        } else {
          const { easy, medium, hard } = res.data.questions;
          setQuestions([...easy, ...medium, ...hard]);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.response?.data?.error || "Could not load your assessment. Please try again.");
      })
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, [onboardingMode, subject]);

  async function handleComplete(answeredQuestions) {
    setSubmitting(true);
    setError("");
    try {
      const res = await api.post("/assessment/submit", {
        subject: onboardingMode ? "Overall" : subject,
        questions: answeredQuestions,
        type: "initial",
        mode: onboardingMode ? "onboarding" : "subject",
      });
      setResult(res.data);
      if (onboardingMode) {
        updateUser({ ...user, onboardingStage: "aim-selection" });
      }
    } catch (err) {
      const serverError = err.response?.data?.error || err.response?.data?.message;
      const detail = err.response?.data?.detail;
      setError(serverError ? `${serverError}${detail ? ` (${detail})` : ""}` : "Could not submit your assessment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const subjectBreakdown = useMemo(() => {
    if (!result?.subjectAssessments) return [];
    return result.subjectAssessments.map((assessment) => ({
      subject: assessment.subject,
      score: assessment.score,
    }));
  }, [result]);

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl">
        <p className="text-gold font-mono text-xs tracking-widest uppercase mb-3 text-center">
          {onboardingMode ? "Overall Baseline · All Subjects" : `${subject} · Diagnostic Check-in`}
        </p>

        {loading && (
          <div className="bg-paper rounded-2xl p-8 shadow-xl text-center">
            <p className="text-slate font-mono text-sm">Building your questions...</p>
          </div>
        )}

        {error && !result && (
          <div className="bg-paper rounded-2xl p-6 shadow-xl">
            <p className="text-rust text-sm mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="w-full bg-ink text-paper rounded-lg py-2.5 font-medium">
              Try again
            </button>
          </div>
        )}

        {!loading && !error && questions && !result && (
          <QuizRunner questions={questions} onComplete={handleComplete} busy={submitting} mixed={onboardingMode} />
        )}

        {result && onboardingMode && (
          <div className="bg-paper rounded-2xl p-6 shadow-xl">
            <p className="text-xs font-mono text-slate mb-1">Overall baseline score</p>
            <p className="text-5xl font-display font-semibold text-ink mb-3">{result.overallScore}%</p>
            <p className="text-ink text-sm leading-relaxed mb-6">
              Your baseline has been recorded across all six subjects. Choose your aim next and Trailhead will build an individual learning trail for every subject.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
              {subjectBreakdown.map(({ subject: item, score }) => (
                <div key={item} className="rounded-xl border border-ink/10 px-3 py-3">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-slate">{item}</p>
                  <p className="mt-1 font-display text-xl font-semibold text-ink">{score}%</p>
                </div>
              ))}
            </div>

            <button onClick={() => navigate("/aim")} className="w-full bg-ink text-paper rounded-lg py-2.5 font-medium">
              Continue to my aim →
            </button>
          </div>
        )}

        {result && !onboardingMode && (
          <div className="bg-paper rounded-2xl p-6 shadow-xl">
            <p className="text-xs font-mono text-slate mb-1">Your score</p>
            <p className="text-5xl font-display font-semibold text-ink mb-4">{result.assessment?.score ?? result.score}%</p>
            <p className="text-ink text-sm leading-relaxed mb-5">{result.assessment?.summary || result.summary}</p>
            <button onClick={() => navigate("/aim")} className="w-full bg-ink text-paper rounded-lg py-2.5 font-medium">
              Continue →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
