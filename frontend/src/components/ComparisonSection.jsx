import React from "react";

const comparisons = [
  ["Starts with the syllabus", "Starts with your performance"],
  ["Same path for everyone", "A trail shaped around you"],
  ["Study everything", "Fix what matters first"],
  ["Static study plan", "Adapts as you improve"],
  ["Progress means completion", "Progress means mastery"],
];

export default function ComparisonSection() {
  return (
    <section className="border-y border-slate/10 bg-white py-20 sm:py-28">
      <div className="mx-auto w-full max-w-[1560px] px-5 sm:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="eyebrow justify-center text-gold">Why Trailhead</p>
          <h2 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">Not another study plan.</h2>
          <p className="mt-4 leading-7 text-slate">The difference is simple: Trailhead decides where you should go based on where you actually are.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-slate/10 bg-paper p-6 sm:p-8">
            <p className="mb-6 text-[10px] font-mono uppercase tracking-[.18em] text-slate">Traditional</p>
            <div className="space-y-5">
              {comparisons.map(([traditional], index) => <div key={index} className="flex items-start gap-3 text-slate"><span className="mt-1 text-xs">—</span><span className="text-sm">{traditional}</span></div>)}
            </div>
          </div>
          <div className="rounded-3xl bg-ink p-6 text-paper shadow-xl shadow-ink/10 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-[10px] font-mono uppercase tracking-[.18em] text-gold">Trailhead</p>
              <span className="text-xs font-mono text-paper/40">YOUR ROUTE</span>
            </div>
            <div className="space-y-5">
              {comparisons.map(([, trailhead], index) => <div key={index} className="flex items-start gap-3"><span className="mt-0.5 text-gold">✓</span><span className="text-sm">{trailhead}</span></div>)}
            </div>
          </div>
        </div>
        <div className="mt-8 rounded-2xl border border-gold/30 bg-gold/5 p-5 text-center">
          <p className="font-display text-lg">Your starting point determines your next step.</p>
        </div>
      </div>
    </section>
  );
}
