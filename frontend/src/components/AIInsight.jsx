import React from "react";

export default function AIInsight({ weakTopics = [], strongTopics = [], summary, roadmap }) {
  const focus = weakTopics?.[0];
  const strength = strongTopics?.[0];

  return (
    <section className="relative overflow-hidden rounded-3xl bg-ink p-6 text-paper shadow-xl shadow-ink/10 sm:p-8">
      <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 opacity-20">
        <span className="absolute right-12 top-10 h-3 w-3 rounded-full bg-gold" />
        <span className="absolute right-20 top-20 h-px w-24 rotate-45 bg-gold" />
        <span className="absolute right-4 top-36 h-3 w-3 rounded-full border border-gold" />
      </div>
      <div className="relative z-10">
        <div className="mb-5 flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-gold text-xs text-ink">✦</span>
          <p className="text-[10px] font-mono uppercase tracking-[.18em] text-gold">Trailhead insight</p>
        </div>
        <h2 className="max-w-2xl font-display text-2xl font-semibold sm:text-3xl">Trailhead noticed something.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-paper/65">
          {summary || (focus
            ? `Your current performance points to ${focus} as the best place to focus next.`
            : "Your diagnostic gives Trailhead a starting point. Keep checking in and your trail will become more precise.")}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {focus && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] font-mono uppercase tracking-wider text-rust">Next focus</p>
              <p className="mt-2 font-display text-lg font-semibold">{focus}</p>
              <p className="mt-1 text-xs text-paper/50">Your next milestone should give this area more attention.</p>
            </div>
          )}
          {strength && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] font-mono uppercase tracking-wider text-moss">Already strong</p>
              <p className="mt-2 font-display text-lg font-semibold">{strength}</p>
              <p className="mt-1 text-xs text-paper/50">Keep it moving without spending unnecessary time here.</p>
            </div>
          )}
        </div>

        {roadmap?.milestones?.length > 0 && (
          <div className="mt-6 flex items-center gap-3">
            <div className="flex -space-x-1">
              {roadmap.milestones.slice(0, 5).map((_, i) => (
                <span key={i} className="grid h-6 w-6 place-items-center rounded-full border-2 border-ink bg-paper text-[9px] font-mono text-ink">{i + 1}</span>
              ))}
            </div>
            <p className="text-xs text-paper/50">{roadmap.milestones.length} milestones shaped around your starting point</p>
          </div>
        )}
      </div>
    </section>
  );
}
