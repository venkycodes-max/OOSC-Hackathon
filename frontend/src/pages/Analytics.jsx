import React, { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell.jsx";
import api from "../api/axios.js";

function EmptyChart({ children }) {
  return <div className="grid h-64 place-items-center rounded-2xl bg-ink/[0.025] px-6 text-center text-sm text-slate">{children}</div>;
}

function LineChart({ values }) {
  if (!values.length) return <EmptyChart>Complete assessments to see your score trend over time.</EmptyChart>;
  const w = 720, h = 280, p = 38;
  const min = Math.max(0, Math.min(...values) - 10);
  const max = Math.min(100, Math.max(...values) + 10);
  const range = Math.max(1, max - min);
  const points = values.map((v, i) => ({ x: p + (i / Math.max(1, values.length - 1)) * (w - p * 2), y: h - p - ((v - min) / range) * (h - p * 2) }));
  const polyline = points.map((point) => `${point.x},${point.y}`).join(" ");

  return <div className="h-72 w-full overflow-x-auto"><svg viewBox={`0 0 ${w} ${h}`} className="h-full min-w-[520px] w-full" role="img" aria-label="Score improvement line chart">
    {[0, 25, 50, 75, 100].map((value) => { const y = h - p - ((value - min) / range) * (h - p * 2); return value >= min && value <= max ? <g key={value}><line x1={p} x2={w-p} y1={y} y2={y} stroke="rgba(36,48,73,.08)"/><text x="4" y={y+4} fontSize="10" fill="#667085">{value}</text></g> : null; })}
    <polyline points={polyline} fill="none" stroke="#D9A441" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    {points.map((point, i) => <g key={i}><circle cx={point.x} cy={point.y} r="6" fill="#EEF1F6" stroke="#D9A441" strokeWidth="3"/><text x={point.x} y={h-12} textAnchor="middle" fontSize="10" fill="#667085">{`Test ${i+1}`}</text><text x={point.x} y={point.y-12} textAnchor="middle" fontSize="10" fill="#243049">{values[i]}%</text></g>)}
  </svg></div>;
}

function BarChart({ data }) {
  if (!data.length) return <EmptyChart>Take assessments in multiple subjects to unlock a subject comparison.</EmptyChart>;
  const w = 720, h = 300, p = 40, max = 100;
  const gap = 18, usable = w - p * 2, barW = Math.max(38, Math.min(90, (usable - gap * (data.length - 1)) / data.length));
  const totalBars = barW * data.length + gap * (data.length - 1);
  const startX = p + (usable - totalBars) / 2;
  return <div className="h-72 w-full overflow-x-auto"><svg viewBox={`0 0 ${w} ${h}`} className="h-full min-w-[520px] w-full" role="img" aria-label="Subject comparison bar chart">
    {[0,25,50,75,100].map(value => { const y = h-p-(value/max)*(h-p*2); return <g key={value}><line x1={p} x2={w-p} y1={y} y2={y} stroke="rgba(36,48,73,.08)"/><text x="6" y={y+4} fontSize="10" fill="#667085">{value}</text></g>; })}
    {data.map((item,i) => { const x = startX + i*(barW+gap); const bh = (item.score/max)*(h-p*2); const y = h-p-bh; return <g key={item.subject}><rect x={x} y={y} width={barW} height={bh} rx="10" fill="#D9A441"/><text x={x+barW/2} y={y-8} textAnchor="middle" fontSize="11" fill="#243049">{item.score}%</text><text x={x+barW/2} y={h-16} textAnchor="middle" fontSize="10" fill="#667085">{item.subject.length>12?`${item.subject.slice(0,10)}…`:item.subject}</text></g>; })}
  </svg></div>;
}

function PieChart({ strongCount, weakCount }) {
  const total = strongCount + weakCount;
  if (!total) return <EmptyChart>Strong and focus-topic proportions will appear as your learning data grows.</EmptyChart>;
  const size = 280, center = 140, radius = 90, circumference = 2 * Math.PI * radius;
  const strongShare = strongCount / total;
  const strongDash = circumference * strongShare;
  const weakDash = circumference - strongDash;
  return <div className="flex min-h-72 flex-col items-center justify-center gap-5 sm:flex-row">
    <svg viewBox={`0 0 ${size} ${size}`} className="h-56 w-56" role="img" aria-label="Strong versus focus topics pie chart">
      <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(36,48,73,.08)" strokeWidth="34" />
      <circle cx={center} cy={center} r={radius} fill="none" stroke="#5E8B68" strokeWidth="34" strokeDasharray={`${strongDash} ${circumference-strongDash}`} transform={`rotate(-90 ${center} ${center})`} />
      <circle cx={center} cy={center} r={radius} fill="none" stroke="#C56A4A" strokeWidth="34" strokeDasharray={`${weakDash} ${circumference-weakDash}`} strokeDashoffset={-strongDash} transform={`rotate(-90 ${center} ${center})`} />
      <text x={center} y={132} textAnchor="middle" fontSize="28" fontWeight="700" fill="#243049">{total}</text><text x={center} y={154} textAnchor="middle" fontSize="10" fill="#667085">tracked topics</text>
    </svg>
    <div className="space-y-3 text-sm"><div><span className="inline-block h-3 w-3 rounded-full bg-moss mr-2"/><span className="text-slate">Strong topics</span><b className="ml-2 text-ink">{strongCount} · {Math.round(strongShare*100)}%</b></div><div><span className="inline-block h-3 w-3 rounded-full bg-rust mr-2"/><span className="text-slate">Focus areas</span><b className="ml-2 text-ink">{weakCount} · {Math.round((weakCount/total)*100)}%</b></div></div>
  </div>;
}

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/dashboard"), api.get("/assessment/history", { params: { limit: 500 } })])
      .then(([dashboardRes, historyRes]) => setData({ ...dashboardRes.data, recentAssessments: historyRes.data.history || [] }))
      .finally(() => setLoading(false));
  }, []);

  const history = data?.progress?.overallScoreHistory || [];
  const scores = history.map((x) => Number(x.score)).filter(Number.isFinite);
  const latest = scores.at(-1);
  const first = scores[0];
  const improvement = latest != null && first != null ? latest - first : null;
  const weak = data?.progress?.topicsWeak || [];
  const strong = data?.progress?.topicsMastered || [];

  const subjectStats = useMemo(() => {
    const map = {};
    (data?.recentAssessments || []).forEach((assessment) => {
      if (!assessment.subject || !Number.isFinite(Number(assessment.score))) return;
      map[assessment.subject] ??= [];
      map[assessment.subject].push(Number(assessment.score));
    });
    return Object.entries(map).map(([subject, arr]) => ({ subject, score: Math.round(arr.reduce((x, y) => x + y, 0) / arr.length) })).sort((a, b) => b.score - a.score);
  }, [data]);

  return <AppShell>{loading ? <div className="grid min-h-[70vh] place-items-center"><p className="font-mono text-xs uppercase tracking-wider text-slate">Calculating your progress...</p></div> : <div className="mx-auto w-full max-w-[1680px] px-5 py-8 sm:px-6 lg:py-10">
    <div className="mb-8"><p className="eyebrow">Evidence of progress</p><h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">Progress & Analytics</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate">Three views of your learning: change over time, subject comparison, and the balance between strengths and focus areas.</p></div>

    <section className="grid gap-4 sm:grid-cols-3"><div className="metric-card"><p className="eyebrow">Current score</p><p className="mt-3 font-display text-3xl font-semibold">{latest != null ? `${latest}%` : "—"}</p></div><div className="metric-card"><p className="eyebrow">Change since start</p><p className={`mt-3 font-display text-3xl font-semibold ${improvement != null && improvement >= 0 ? "text-moss" : "text-rust"}`}>{improvement != null ? `${improvement >= 0 ? "+" : ""}${improvement} pts` : "—"}</p></div><div className="metric-card"><p className="eyebrow">Weekly check-ins</p><p className="mt-3 font-display text-3xl font-semibold">{data?.progress?.weeklyQuizzesTaken ?? 0}</p></div></section>

    <section className="mt-6 dashboard-card p-6 sm:p-8"><p className="eyebrow">Line chart · score trend</p><h2 className="mt-1 font-display text-2xl font-semibold">Improvement over time</h2><div className="mt-5"><LineChart values={scores} /></div></section>

    <section className="mt-6 grid gap-6 lg:grid-cols-2"><div className="dashboard-card p-6"><p className="eyebrow">Bar chart · subjects</p><h2 className="mt-1 font-display text-2xl font-semibold">Subject comparison</h2><div className="mt-5"><BarChart data={subjectStats} /></div></div><div className="dashboard-card p-6"><p className="eyebrow">Pie chart · learning balance</p><h2 className="mt-1 font-display text-2xl font-semibold">Strong vs focus</h2><div className="mt-5"><PieChart strongCount={strong.length} weakCount={weak.length} /></div></div></section>

    <section className="mt-6 grid gap-6 lg:grid-cols-2"><div className="dashboard-card p-6"><p className="eyebrow">Strong topics</p><div className="mt-4 flex flex-wrap gap-2">{strong.length ? strong.map((topic) => <span key={topic} className="rounded-full bg-moss/10 px-3 py-1.5 text-xs text-moss">{topic}</span>) : <span className="text-sm text-slate">None yet</span>}</div></div><div className="dashboard-card p-6"><p className="eyebrow">Focus areas</p><div className="mt-4 flex flex-wrap gap-2">{weak.length ? weak.map((topic) => <span key={topic} className="rounded-full bg-rust/10 px-3 py-1.5 text-xs text-rust">{topic}</span>) : <span className="text-sm text-slate">None right now</span>}</div></div></section>
  </div>}</AppShell>;
}
