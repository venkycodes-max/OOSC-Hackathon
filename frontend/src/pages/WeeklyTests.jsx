import React, { useEffect, useState } from "react";
import AppShell from "../components/AppShell.jsx";
import api from "../api/axios.js";
import { SUBJECTS } from "../lib/onboarding.js";
import { Link } from "react-router-dom";

function Bar({ value }) { return <div className="h-2 overflow-hidden rounded-full bg-ink/5"><div className="h-full rounded-full bg-gold" style={{ width: `${Math.max(0, Math.min(100, value || 0))}%` }} /></div>; }

export default function WeeklyTests() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([api.get("/dashboard"), api.get("/assessment/history", { params: { type: "weekly", limit: 500 } })])
      .then(([dashboardRes, historyRes]) => setData({ ...dashboardRes.data, recentAssessments: historyRes.data.history || [] }))
      .finally(() => setLoading(false));
  }, []);
  const assessments = (data?.recentAssessments || []).filter(a => a.type === "weekly");
  const scores = assessments.map(a => Number(a.score)).filter(Number.isFinite);
  const avg = scores.length ? Math.round(scores.reduce((a,b) => a+b, 0) / scores.length) : null;

  return <AppShell>{loading ? <div className="grid min-h-[70vh] place-items-center"><p className="font-mono text-xs uppercase tracking-wider text-slate">Loading test reports...</p></div> : <div className="mx-auto w-full max-w-[1680px] px-5 py-8 sm:px-6 lg:py-10">
    <div className="mb-8"><p className="eyebrow">Assessment evidence</p><h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">Test Reports</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate">Review completed subject quizzes here. New quizzes are intentionally launched only from the corresponding Subject page.</p></div>
    <section className="grid gap-4 sm:grid-cols-3"><div className="metric-card"><p className="eyebrow">Tests completed</p><p className="mt-3 font-display text-3xl font-semibold">{assessments.length}</p><p className="mt-1 text-xs text-slate">Weekly subject check-ins</p></div><div className="metric-card"><p className="eyebrow">Average</p><p className="mt-3 font-display text-3xl font-semibold">{avg != null ? `${avg}%` : "—"}</p><p className="mt-1 text-xs text-slate">Across completed tests</p></div><div className="metric-card"><p className="eyebrow !text-rust">Current focus</p><p className="mt-3 font-display text-xl font-semibold">{data?.progress?.topicsWeak?.[0] || "Waiting for data"}</p><p className="mt-1 text-xs text-slate">Highest-priority topic</p></div></section>
    <section className="mt-6 dashboard-card p-6 sm:p-8"><div className="mb-6"><p className="eyebrow">Previous reports</p><h2 className="mt-1 font-display text-2xl font-semibold">Your subject check-in history</h2></div>{assessments.length ? <div className="space-y-3">{assessments.map((a, i) => <div key={a._id || i} className="rounded-2xl border border-ink/10 bg-white p-4"><div className="flex items-center justify-between gap-4"><div><p className="text-sm font-semibold">{a.subject || SUBJECTS[0]} · Week {a.weekNumber ?? ""}</p><p className="mt-1 text-xs text-slate">{a.createdAt ? new Date(a.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "Recorded assessment"}</p></div><span className="font-display text-2xl font-semibold">{a.score}%</span></div><div className="mt-4"><Bar value={a.score} /></div><div className="mt-3 flex flex-wrap gap-2"><Link to={`/subjects/${(a.subject || SUBJECTS[0]).toLowerCase().replace(/\s+/g, "-")}`} className="rounded-full bg-gold/10 px-2.5 py-1 text-[10px] font-mono text-gold hover:bg-gold/20">Open subject</Link><span className="rounded-full bg-ink/5 px-2.5 py-1 text-[10px] font-mono text-slate">Result feeds your trail</span></div></div>)}</div> : <div className="rounded-2xl bg-paper p-6 text-sm text-slate">No weekly test reports yet. Open a subject from the Subjects menu to take that subject's quiz.</div>}</section>
  </div>}</AppShell>;
}
