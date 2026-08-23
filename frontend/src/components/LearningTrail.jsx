import React, { useMemo, useState } from "react";

const STATUS_STYLE = {
  mastered: { ring:"border-moss bg-moss text-white", label:"Mastered", labelColor:"text-moss" },
  "in-progress": { ring:"border-gold bg-gold text-ink", label:"In progress", labelColor:"text-gold" },
  upcoming: { ring:"border-slate/30 bg-paper text-slate", label:"Upcoming", labelColor:"text-slate" },
};

export default function LearningTrail({ milestones }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const activeIndex = useMemo(() => {
    const inProgress = milestones?.findIndex(m => m.status === "in-progress");
    if (inProgress >= 0) return inProgress;
    const upcoming = milestones?.findIndex(m => m.status === "upcoming");
    return upcoming >= 0 ? upcoming : 0;
  }, [milestones]);

  if (!milestones?.length) return <p className="text-sm text-slate">No roadmap milestones yet.</p>;

  const selected = milestones[selectedIndex] || milestones[activeIndex];

  return (
    <div className="relative rounded-3xl border border-ink/10 bg-surface p-5 sm:p-8">
      <div className="absolute bottom-10 left-10 top-10 hidden w-px bg-slate/15 sm:block">
        <div className="w-px bg-gold transition-all duration-1000" style={{ height: `${Math.min(100, ((activeIndex + 1) / milestones.length) * 100)}%` }} />
      </div>

      <div className="relative space-y-4">
        {milestones.map((m, idx) => {
          const style = STATUS_STYLE[m.status] || STATUS_STYLE.upcoming;
          const isSelected = idx === selectedIndex;
          const isActive = idx === activeIndex;
          return (
            <div key={m._id || idx} className="relative flex items-start gap-4">
              <button
                type="button"
                onClick={() => setSelectedIndex(idx)}
                title="Click to explore this phase."
                className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 font-mono text-xs font-semibold transition-all duration-300 ${style.ring} ${isSelected ? "scale-110 shadow-[0_0_0_6px_rgba(217,164,65,.12)]" : "hover:scale-105"} ${isActive ? "animate-waypoint" : ""}`}
              >
                {m.status === "mastered" ? "✓" : idx + 1}
                {isActive && <span className="absolute -right-2 -top-2 h-4 w-4 rounded-full border-2 border-paper bg-gold"><span className="absolute inset-0 rounded-full bg-gold/30 animate-ping" /></span>}
              </button>

              <button
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`flex-1 rounded-2xl border p-4 text-left transition-all duration-300 ${isSelected ? "border-gold/40 bg-surface shadow-lg shadow-ink/5 -translate-y-0.5" : "border-slate/10 bg-surface/70 hover:border-slate/20 hover:bg-surface"}`}
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className={`text-[10px] font-mono uppercase tracking-[.16em] ${style.labelColor}`}>{isActive ? "You are here · " : ""}{style.label}</span>
                  <span className="text-[10px] font-mono text-slate">{m.topic}</span>
                </div>
                <p className="font-display text-lg font-semibold">{m.title}</p>
                <p className="mt-1 text-sm leading-6 text-slate">{m.description}</p>
                {isSelected && m.resources?.length > 0 && (
                  <div className="mt-4"><p className="mb-2 text-[10px] font-mono uppercase tracking-[.14em] text-slate">4 resources for this phase</p><div className="flex flex-wrap gap-2">
                    {m.resources.map((r, i) => <a key={i} href={r.searchUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="rounded-full bg-ink/5 px-3 py-1.5 text-[11px] text-ink transition hover:bg-gold/15">{r.provider}: {r.title}</a>)}
                  </div></div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="adaptive-panel mt-5 ml-14 rounded-2xl p-5 animate-fade-up">
          <p className="text-[10px] font-mono uppercase tracking-[.18em] text-gold">Current trail detail</p>
          <p className="mt-2 font-display text-xl font-semibold">{selected.title}</p>
          <p className="mt-1 text-sm leading-6 text-paper/65">{selected.description}</p>
          <p className="mt-4 text-[11px] font-mono text-paper/40">Status is updated from your assessment and progress data.</p>
        </div>
      )}
    </div>
  );
}
