import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";
import AppShell from "./AppShell.jsx";
import LearningTrail from "./LearningTrail.jsx";
import AIInsight from "./AIInsight.jsx";
import { getSubjectsForUser } from "../lib/onboarding.js";
import { normalizeMilestones, slugToSubject as resolveSubject } from "../lib/trailUtils.js";

function slugToSubject(slug, subjects) { return resolveSubject(slug, subjects); }

function SubjectBars({ topics = [], tone = "weak" }) {
  return <div className="space-y-2">{topics.length ? topics.slice(0, 8).map((topic, i) => (
    <div key={topic} className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 ${tone === "strong" ? "bg-moss/5" : "bg-rust/5"}`}>
      <span className="text-sm font-medium">{topic}</span>
      <span className={`rounded-full px-2.5 py-1 text-[10px] font-mono ${tone === "strong" ? "bg-moss/10 text-moss" : "bg-rust/10 text-rust"}`}>{tone === "strong" ? "Strong" : "Focus"}</span>
    </div>
  )) : <p className="text-sm text-slate">Topic insights will appear after your first assessment in this subject.</p>}</div>;
}

export default function SubjectProgress() {
  const { slug } = useParams();
  const { user } = useAuth();
  const availableSubjects = getSubjectsForUser(user);
  const subject = slugToSubject(slug, availableSubjects);
  const [data, setData] = useState(null);
  const [subjectData, setSubjectData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const load = async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const [subjectResult, roadmapResult] = await Promise.allSettled([
          api.get("/progress/subject", { params: { subject } }),
          api.get("/roadmap", { params: { subject } }),
        ]);
        if (!alive) return;
        if (subjectResult.status === "fulfilled") setSubjectData(subjectResult.value.data);
        if (roadmapResult.status === "fulfilled") {
          setData((prev) => ({ ...(prev || {}), roadmap: roadmapResult.value.data.roadmap }));
        }
      } finally {
        if (alive && !silent) setLoading(false);
      }
    };
    load();
    const interval = window.setInterval(() => load(true), 8000);
    const onFocus = () => load(true);
    const onVisibility = () => { if (document.visibilityState === "visible") load(true); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      alive = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [subject]);

  if (loading) return <AppShell><div className="grid min-h-[70vh] place-items-center"><p className="font-mono text-xs uppercase tracking-wider text-slate">Loading {subject} trail...</p></div></AppShell>;

  const progress = subjectData?.progress || {};
  const roadmap = data?.roadmap || {};
  const milestones = normalizeMilestones(roadmap?.milestones || [], subject);
  const assessments = subjectData?.recentAssessments || [];
  const history = subjectData?.progress?.scoreHistory || [];
  const latest = subjectData?.progress?.latestScore ?? history.at(-1)?.score ?? null;
  const hasSubjectSnapshot = Boolean(subjectData);
  const weak = progress.topicsWeak || [];
  const strong = progress.topicsMastered || [];
  const mastered = milestones.filter(m => m.status === "mastered").length;
  const trailPercent = milestones.length ? Math.round(mastered / milestones.length * 100) : null;

  return <AppShell>
    <div className="mx-auto w-full max-w-[1680px] px-5 py-8 sm:px-6 lg:py-10">
      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div><p className="eyebrow">Subject trail</p><h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">{subject}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate">A subject-level view of your mastery, strengths, gaps, assessments, and next milestones.</p></div>
        <Link to={`/subjects/${slug}/quiz`} className="button-primary">Take {subject} quiz →</Link>
      </div>

      {!hasSubjectSnapshot && <div className="mb-6 rounded-2xl border border-gold/25 bg-gold/5 px-4 py-3 text-xs leading-5 text-slate">No {subject} assessment has been recorded yet. Take the subject quiz to start this subject's adaptive trail.</div>}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="metric-card"><p className="eyebrow">Mastery</p><p className="mt-3 font-display text-3xl font-semibold">{latest != null ? `${latest}%` : "—"}</p><p className="mt-1 text-xs text-slate">Latest measured score</p></div>
        <div className="metric-card"><p className="eyebrow">Trail progress</p><p className="mt-3 font-display text-3xl font-semibold">{trailPercent != null ? `${trailPercent}%` : "—"}</p><p className="mt-1 text-xs text-slate">{mastered} of {milestones.length} milestones</p></div>
        <div className="metric-card"><p className="eyebrow !text-rust">Focus</p><p className="mt-3 font-display text-3xl font-semibold text-rust">{weak.length}</p><p className="mt-1 text-xs text-slate">Topics needing attention</p></div>
        <div className="metric-card"><p className="eyebrow !text-moss">Strong</p><p className="mt-3 font-display text-3xl font-semibold text-moss">{strong.length}</p><p className="mt-1 text-xs text-slate">Topics you can trust</p></div>
      </section>

      <section className="mt-6"><AIInsight weakTopics={weak} strongTopics={strong} summary={subjectData?.summary || `Trailhead is tracking your ${subject} performance and using it to decide what deserves attention next.`} roadmap={roadmap} /></section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="dashboard-card p-6"><p className="eyebrow !text-moss">Strengths</p><h2 className="mt-1 font-display text-2xl font-semibold">What you already know</h2><div className="mt-6"><SubjectBars topics={strong} tone="strong" /></div></div>
        <div className="dashboard-card p-6"><p className="eyebrow !text-rust">Needs attention</p><h2 className="mt-1 font-display text-2xl font-semibold">Where the next gains are</h2><div className="mt-6"><SubjectBars topics={weak} tone="weak" /></div></div>
      </section>

      <section className="mt-6 dashboard-card p-6"><div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end"><div><p className="eyebrow">Route</p><h2 className="mt-1 font-display text-3xl font-semibold">Your {subject} trail</h2></div><span className="text-xs font-mono uppercase tracking-wider text-slate">{roadmap?.overview ? "Adaptive route" : "Your next milestones"}</span></div>{milestones.length ? <LearningTrail milestones={milestones} /> : <div className="rounded-2xl bg-paper p-6 text-sm text-slate">Your subject trail will appear after Trailhead has enough assessment data for {subject}.</div>}</section>

      <section className="mt-6 dashboard-card overflow-hidden"><div className="border-b border-ink/10 p-6"><p className="eyebrow">Assessment history</p><h2 className="mt-1 font-display text-2xl font-semibold">{subject} check-ins</h2></div>{assessments.length ? assessments.slice(0, 8).map((a, i) => <div key={a._id || i} className={`flex items-center justify-between gap-4 px-6 py-4 ${i ? "border-t border-ink/10" : ""}`}><div><p className="text-sm font-medium">{a.type === "initial" ? "Diagnostic" : `Week ${a.weekNumber ?? ""}`}</p><p className="mt-1 text-xs text-slate">{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "Recorded assessment"}</p></div><span className="font-display text-xl font-semibold">{a.score}%</span></div>) : <div className="p-6 text-sm text-slate">No {subject} assessments have been recorded yet.</div>}</section>
    </div>
  </AppShell>;
}
