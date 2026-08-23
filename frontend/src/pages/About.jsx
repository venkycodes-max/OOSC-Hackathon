import React from "react";
import PublicNavbar from "../components/PublicNavbar.jsx";
import PublicFooter from "../components/PublicFooter.jsx";

export default function About() {
  return (
    <div className="page-shell bg-paper">
      <PublicNavbar />
      <main className="flex-1 mx-auto w-full max-w-[1680px] px-5 py-16 sm:px-6 md:py-24">
        <p className="eyebrow">About Trailhead</p>
        <h1 className="mt-4 max-w-3xl font-display text-5xl font-semibold leading-tight tracking-tight">A learning plan should know where you're starting.</h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-slate">Trailhead is a student-first learning companion built around one simple idea: the best next topic depends on what you already understand and what you're trying to achieve.</p>
        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {[
            ["Measure first", "A diagnostic assessment creates a useful starting point instead of assuming every student has the same gaps."],
            ["Prioritize gaps", "Weak topics become the first milestones on your trail, while strong areas stay visible without taking unnecessary study time."],
            ["Adapt over time", "Weekly check-ins give the trail new evidence so your focus can move as your understanding improves."],
          ].map(([title, text]) => (
            <div key={title} className="rounded-3xl border border-ink/10 bg-surface p-7">
              <h2 className="font-display text-2xl font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate">{text}</p>
            </div>
          ))}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
