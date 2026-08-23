import React, { useEffect, useState } from "react";

const steps = [
  { label: "01", title: "Diagnostic", text: "Trailhead measures what you know instead of assuming.", items: ["Your answers", "Difficulty", "Topic patterns"] },
  { label: "02", title: "Understand", text: "Performance becomes strengths, gaps, and priorities.", items: ["Weak topics", "Strong topics", "Current level"] },
  { label: "03", title: "Adapt", text: "Your goal and gaps shape the route ahead.", items: ["Your aim", "Priority topics", "Milestones"] },
  { label: "04", title: "Your Trail", text: "Your sequence changes as your understanding improves.", items: ["Next milestone", "Weekly check-in", "Progress"] },
];

export default function AdaptiveRoadmap() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActive(current => (current + 1) % steps.length), 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="overflow-hidden bg-paper py-20 sm:py-28">
      <div className="mx-auto w-full max-w-[1680px] px-5 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="eyebrow text-gold">The adaptive loop</p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">Your route changes <span className="text-slate/40">when you do.</span></h2>
            <p className="mt-5 max-w-lg leading-7 text-slate">Trailhead doesn't create one study plan and leave you alone. Every diagnostic and weekly check-in gives the trail new information.</p>
          </div>

          <div>
            <div className="relative">
              <div className="absolute left-6 right-6 top-6 hidden h-px bg-slate/15 sm:block">
                <div className="h-px bg-gold transition-all duration-700" style={{ width: `${(active / (steps.length - 1)) * 100}%` }} />
              </div>
              <div className="relative grid gap-3 sm:grid-cols-4">
                {steps.map((step, index) => {
                  const isActive = active === index;
                  const isPast = index < active;
                  return (
                    <button
                      key={step.label}
                      type="button"
                      onClick={() => setActive(index)}
                      aria-pressed={isActive}
                      className={`rounded-2xl border p-4 text-left transition-all duration-500 ${isActive ? "adaptive-panel border-ink shadow-xl shadow-ink/15 -translate-y-2" : "bg-surface text-ink border-slate/10 hover:-translate-y-1"}`}
                    >
                      <div className={`mb-5 grid h-12 w-12 place-items-center rounded-full border font-mono text-xs ${isActive ? "border-gold bg-gold text-ink" : isPast ? "border-moss bg-moss text-paper" : "border-slate/20 bg-paper text-slate"}`}>{isPast ? "✓" : step.label}</div>
                      <p className="font-display text-lg font-semibold">{step.title}</p>
                      <p className={`mt-2 text-xs leading-5 ${isActive ? "text-slate" : "text-slate"}`}>{step.text}</p>
                      <div className="mt-5 space-y-1.5">
                        {step.items.map(item => <div key={item} className={`text-[10px] font-mono ${isActive ? "text-slate" : "text-slate/65"}`}>→ {item}</div>)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="mt-5 text-center text-[10px] font-mono uppercase tracking-widest text-slate">Click a stage to explore the loop</div>
          </div>
        </div>
      </div>
    </section>
  );
}
