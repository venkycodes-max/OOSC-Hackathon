import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import AppShell from "../components/AppShell.jsx";
import AIInsight from "../components/AIInsight.jsx";


function Sparkline({ values }) {
  if (!values.length) return <div className="flex h-20 items-center justify-center text-xs text-slate">Your score history will appear here.</div>;
  const w = 300, h = 80, pad = 6;
  const min = Math.max(0, Math.min(...values) - 8), max = Math.min(100, Math.max(...values) + 8);
  const pts = values.map((v, i) => {
    const x = pad + (i / Math.max(1, values.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / Math.max(1, max - min)) * (h - pad * 2);
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-20 w-full overflow-visible" preserveAspectRatio="none">
      <path d={`M ${pts.split(" ").join(" L ")}`} fill="none" stroke="#D9A441" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {values.map((v, i) => {
        const [x,y] = pts.split(" ")[i].split(",");
        return <circle key={i} cx={x} cy={y} r="3.5" fill="#EEF1F6" stroke="#D9A441" strokeWidth="2" />;
      })}
    </svg>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const load = useCallback(() => {
    setLoading(true);
    api.get("/dashboard")
      .then(res => setData(res.data))
      .catch(err => setError(err.response?.data?.error || "Could not load your dashboard."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);


  if (loading) return <div className="min-h-screen bg-paper grid place-items-center"><div className="text-center"><div className="loading-dot mx-auto" /><p className="mt-4 text-sm text-slate">Mapping your trail...</p></div></div>;
  if (error) return <div className="min-h-screen bg-paper grid place-items-center px-5"><div className="rounded-2xl border border-rust/20 bg-rust/5 p-6 text-center"><p className="text-sm text-rust">{error}</p><button onClick={load} className="mt-4 button-secondary !py-2">Try again</button></div></div>;

  const { user, progress, roadmap } = data;
  const recentOwnAssessments = (data.recentAssessments || []).filter((a) => !a.user || String(a.user) === String(user?.id));
  const history = progress?.overallScoreHistory || [];
  const latest = history[history.length - 1]?.score;
  const previous = history.length > 1 ? history[history.length - 2]?.score : null;
  const delta = latest != null && previous != null ? latest - previous : null;
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1680px] px-5 py-8 sm:px-6 lg:py-10">
        <section className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="eyebrow">Your progress · {user?.studentClass}</p>
            <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Good to see you, {user?.name?.split(" ")[0]}.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate">{roadmap?.overview || "Your trail is ready to turn your assessment into a clear next step."}</p>
          </div>

        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Latest score", latest != null ? `${latest}%` : "—", delta == null ? "First baseline" : `${delta >= 0 ? "+" : ""}${delta} pts vs last`],
            ["Focus areas", progress?.topicsWeak?.length ?? 0, "Topics needing attention"],
            ["Weekly quizzes", progress?.weeklyQuizzesTaken ?? 0, "Check-ins completed"],
          ].map(([label, value, note]) => (
            <div key={label} className="metric-card">
              <p className="text-xs font-mono uppercase tracking-wider text-slate">{label}</p>
              <p className="mt-3 font-display text-3xl font-semibold">{value}</p>
              <p className="mt-1 text-xs text-slate">{note}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 animate-fade-up">
          <AIInsight
            weakTopics={progress?.topicsWeak}
            strongTopics={progress?.topicsMastered}
            summary={progress?.gapSummary || progress?.summary}
            roadmap={roadmap}
          />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="dashboard-card p-6">
            <div className="flex items-center justify-between">
              <div><p className="eyebrow !text-rust">Focus areas</p><h2 className="mt-1 font-display text-xl font-semibold">Where to spend your time</h2></div>
              <span className="text-xs text-slate">{progress?.topicsWeak?.length || 0} topics</span>
            </div>
            <div className="mt-5 space-y-2">
              {progress?.topicsWeak?.length ? progress.topicsWeak.slice(0, 5).map((topic, i) => (
                <div key={topic} className="flex items-center gap-3 rounded-xl bg-rust/5 px-4 py-3">
                  <span className="font-mono text-xs text-rust">{String(i + 1).padStart(2, "0")}</span><span className="text-sm font-medium">{topic}</span>
                </div>
              )) : <p className="text-sm text-slate">Nothing is currently flagged. Keep testing yourself.</p>}
            </div>
          </div>

          <div className="dashboard-card p-6">
            <div><p className="eyebrow !text-moss">Strengths</p><h2 className="mt-1 font-display text-xl font-semibold">What you already know</h2></div>
            <div className="mt-5 flex flex-wrap gap-2">
              {progress?.topicsMastered?.length ? progress.topicsMastered.map(t => <span key={t} className="rounded-full bg-moss/10 px-3 py-1.5 text-xs font-medium text-moss">{t}</span>) : <p className="text-sm text-slate">Your mastered topics will appear here as you progress.</p>}
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-5"><p className="eyebrow">History</p><h2 className="mt-1 font-display text-2xl font-semibold">Recent check-ins</h2></div>
          <div className="dashboard-card overflow-hidden">
            {recentOwnAssessments.length ? recentOwnAssessments.map((a, i) => (
              <div key={a._id} className={`flex items-center justify-between gap-4 px-5 py-4 ${i ? "border-t border-ink/10" : ""}`}>
                <div><p className="text-sm font-medium">{a.subject} <span className="text-slate">· {a.type === "initial" ? "Diagnostic" : `Week ${a.weekNumber ?? ""}`}</span></p><p className="mt-1 text-xs text-slate">{new Date(a.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</p></div>
                <span className="font-display text-xl font-semibold">{a.score}%</span>
              </div>
            )) : <div className="p-6 text-sm text-slate">No check-ins yet. Complete your first assessment and your personal check-in history will appear here.</div>}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
