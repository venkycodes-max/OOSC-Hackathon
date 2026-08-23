import React, { useCallback, useEffect, useState } from "react";
import AppShell from "../components/AppShell.jsx";
import LearningTrail from "../components/LearningTrail.jsx";
import AIInsight from "../components/AIInsight.jsx";
import api from "../api/axios.js";
import { normalizeMilestones } from "../lib/trailUtils.js";
import { getSubjectsForUser } from "../lib/onboarding.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function LearningTrailPage() {
  const { user } = useAuth();
  const subjects = getSubjectsForUser(user);
  const [subject, setSubject] = useState(subjects[0]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setData(null);
    }
    try {
      const [progressResult, roadmapResult] = await Promise.allSettled([
        api.get("/progress/subject", { params: { subject } }),
        api.get("/roadmap", { params: { subject } }),
      ]);
      if (progressResult.status === "fulfilled") {
        const progress = progressResult.value.data;
        setData((prev) => ({ ...(prev || {}), ...progress }));
        setError("");
      }
      if (roadmapResult.status === "fulfilled") {
        setData((prev) => ({ ...(prev || {}), roadmap: roadmapResult.value.data.roadmap }));
        setError("");
      } else if (roadmapResult.reason?.response?.status === 404) {
        const hasAssessment = Boolean(roadmapResult.reason?.response?.data?.hasAssessment);
        if (hasAssessment) {
          // The backend should normally self-heal this case. Keep one explicit
          // refresh attempt for older servers so saved assessments are never
          // mistaken for missing assessment data.
          try {
            const refresh = await api.post("/roadmap/refresh", { subject });
            if (refresh.data?.roadmap) {
              setData((prev) => ({ ...(prev || {}), roadmap: refresh.data.roadmap }));
              setError("");
            }
          } catch {
            setError(`Your ${subject} assessment is saved, but the trail is still being rebuilt. Refresh this page in a moment.`);
          }
        } else {
          setError(`Take the ${subject} quiz first so Trailhead can assess your starting point and build this subject's learning trail.`);
        }
      }
    } catch (e) {
      if (!silent) setError(e.response?.data?.error || "Could not load your trail.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [subject]);

  useEffect(() => {
    load();
    const interval = window.setInterval(() => load(true), 8000);
    const onFocus = () => load(true);
    const onVisibility = () => { if (document.visibilityState === "visible") load(true); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [load]);

  const milestones = normalizeMilestones(data?.roadmap?.milestones || [], subject);
  const progress = data?.progress || {};
  const hasAssessment = Boolean(data?.hasAssessment);

  return <AppShell>
    {loading ? <div className="grid min-h-[70vh] place-items-center"><p className="font-mono text-xs uppercase tracking-wider text-slate">Mapping your trail...</p></div> :
      <div className="mx-auto w-full max-w-[1680px] px-5 py-8 sm:px-6 lg:py-10">
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="eyebrow">Your route · updates after every assessment</p>
            <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">My Learning Trail</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate">Choose a subject to see its full curriculum route. Quiz results recalculate the route, preserving mastered milestones and bringing weak areas forward.</p>
          </div>
          <select value={subject} onChange={(e) => setSubject(e.target.value)} className="rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-gold">
            {subjects.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>

        {error && <div className="mb-6 rounded-2xl border border-gold/25 bg-gold/5 px-4 py-3 text-sm text-slate">{error}</div>}

        {hasAssessment ? (
          <div className="mb-6"><AIInsight weakTopics={progress.topicsWeak} strongTopics={progress.topicsMastered} summary={data?.summary} roadmap={data?.roadmap} /></div>
        ) : (
          <div className="mb-6 rounded-3xl border border-gold/25 bg-gold/5 p-6 sm:p-8">
            <p className="eyebrow text-gold">Assessment needed</p>
            <h2 className="mt-2 font-display text-2xl font-semibold">Take the {subject} quiz to build your trail.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate">Trailhead does not guess your strengths or weak areas. Once you complete the {subject} assessment, your full {subject} curriculum route will appear here with at least four resources for every phase.</p>
            <a href={`/subjects/${subject.toLowerCase().replace(/\s+/g, "-")}`} className="mt-5 inline-flex rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-paper">Take {subject} quiz →</a>
          </div>
        )}

        <section className="dashboard-card p-6 sm:p-8">
          <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div><p className="eyebrow">Adaptive {subject} roadmap</p><h2 className="mt-1 font-display text-3xl font-semibold">Where you are on the route</h2></div>
            <span className="rounded-full bg-ink/5 px-3 py-1.5 text-xs font-medium text-slate">{milestones.length} phases · minimum 4 resources each</span>
          </div>
          {data?.roadmap?.overview && <p className="mb-8 max-w-2xl text-sm leading-6 text-slate">{data.roadmap.overview}</p>}
          {milestones.length ? <LearningTrail milestones={milestones} /> : <div className="rounded-2xl bg-paper p-6 text-sm text-slate">Take the {subject} quiz first so assessment is possible. Your full curriculum route will be generated immediately after the assessment is saved.</div>}
        </section>
      </div>}
  </AppShell>;
}
