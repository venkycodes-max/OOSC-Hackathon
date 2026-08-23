import React from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar.jsx";
import PublicFooter from "../components/PublicFooter.jsx";
import AdaptiveRoadmap from "../components/AdaptiveRoadmap.jsx";
import ComparisonSection from "../components/ComparisonSection.jsx";

const subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "English"];
const steps = [
  ["01", "Assess", "Start with a short diagnostic that finds what you know and what needs attention."],
  ["02", "Personalize", "Your results become a learning route built around your class, branch and goal."],
  ["03", "Improve", "Use quizzes, resources and the AI Doubt Solver to keep moving."],
];
const stats = [
  ["AI", "Doubt Solver"],
  ["6+", "Core learning areas"],
  ["24/7", "Personalized trail"],
  ["100%", "Progress saved"],
];

export default function Home() {
  return (
    <div className="page-shell bg-paper">
      <PublicNavbar />
      <main className="flex-1">
        <section className="hero-grid relative overflow-hidden">
          <div className="hero-orb left-[5%] top-16 h-40 w-40 bg-violet-400/15 blur-3xl" />
          <div className="hero-orb right-[5%] top-20 h-56 w-56 bg-sky-400/15 blur-3xl" />

          <div className="mx-auto max-w-6xl px-5 pb-16 pt-16 sm:px-6 sm:pt-20 lg:pb-20">
            <div className="mx-auto max-w-4xl text-center animate-fade-up">
              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[.16em] text-gold">
                <span className="h-2 w-2 rounded-full bg-gold animate-pulse" /> AI-powered adaptive learning
              </div>
              <h1 className="mt-7 font-display text-5xl font-extrabold leading-[1.04] tracking-[-.04em] sm:text-6xl lg:text-7xl">
                Learn smarter.<br />
                <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-sky-500 bg-clip-text text-transparent">Know what to do next.</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate sm:text-lg">
                Trailhead turns your assessment results into a personalized learning trail — so you spend less time guessing and more time improving.
              </p>

              <div className="mx-auto mt-9 flex max-w-2xl items-center gap-2 rounded-[22px] border border-ink/10 bg-surface p-2 shadow-[0_20px_60px_rgba(15,23,42,.10)]">
                <span className="pl-4 text-slate">⌕</span>
                <input className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm outline-none placeholder:text-slate/60" placeholder="What do you want to get better at?" aria-label="Learning search" />
                <Link to="/register" className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5">Find my trail →</Link>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <span className="mr-1 text-xs font-semibold text-slate">Explore:</span>
                {subjects.map(s => <span key={s} className="rounded-full border border-ink/10 bg-surface px-3 py-1.5 text-[11px] font-semibold text-slate">{s}</span>)}
              </div>
            </div>

            <div className="relative mx-auto mt-16 max-w-5xl animate-fade-up delay-100">
              <div className="absolute -inset-5 rounded-[40px] bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-sky-500/10 blur-2xl" />
              <div className="glass-card relative overflow-hidden rounded-[32px] p-4 sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate">Personal learning dashboard</p><p className="mt-1 font-display text-xl font-bold">Your trail at a glance</p></div>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1.5 text-[10px] font-bold text-emerald-600">● On track</span>
                </div>
                <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
                  <div className="hero-trail-card rounded-3xl p-6 text-white">
                    <div className="flex items-center justify-between"><div><p className="text-xs text-white/55">Current focus</p><h3 className="mt-1 text-xl font-bold">Mathematics</h3></div><span className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold">72%</span></div>
                    <div className="mt-7 space-y-4">
                      {[["Quadratic Equations", "Mastered", "bg-emerald-400"], ["Functions & Graphs", "Current focus", "bg-violet-400"], ["Calculus Foundations", "Next up", "bg-white/30"]].map(([name,status,dot],i) => (
                        <div key={name} className="flex items-center gap-3">
                          <span className={`grid h-8 w-8 place-items-center rounded-full ${dot} text-[11px] font-bold text-slate-950`}>{i === 0 ? "✓" : i + 1}</span>
                          <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{name}</p><p className="text-[10px] text-white/45">{status}</p></div>
                          {i === 1 && <span className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10"><span className="block h-full w-3/4 rounded-full bg-violet-400" /></span>}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                    <div className="rounded-3xl border border-ink/10 bg-surface p-5"><p className="text-xs font-bold text-slate">AI insight</p><p className="mt-2 font-display text-lg font-bold">Focus on functions next.</p><p className="mt-1 text-xs leading-5 text-slate">Your recent answers show this topic can unlock your next milestone.</p></div>
                    <div className="rounded-3xl bg-gradient-to-br from-violet-500/10 to-sky-500/10 p-5"><p className="text-xs font-bold text-slate">Weekly check-in</p><div className="mt-3 flex items-end justify-between"><span className="font-display text-3xl font-extrabold">+12%</span><span className="text-xs font-bold text-emerald-600">since last test</span></div><div className="mt-3 h-2 rounded-full bg-white/70"><div className="h-full w-3/4 rounded-full bg-gradient-to-r from-violet-500 to-sky-400" /></div></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
              {stats.map(([value,label]) => <div key={label} className="rounded-2xl border border-ink/10 bg-surface px-4 py-4 text-center shadow-sm"><p className="font-display text-2xl font-extrabold text-ink">{value}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate">{label}</p></div>)}
            </div>
          </div>
        </section>

        <section className="border-y border-ink/10 bg-surface">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-20">
            <div className="text-center"><p className="eyebrow justify-center">How Trailhead works</p><h2 className="section-title mx-auto text-center">A learning platform that adapts to you.</h2><p className="section-copy mx-auto text-center">No one-size-fits-all timetable. Your trail changes as your understanding changes.</p></div>
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {steps.map(([n,title,text]) => <div key={n} className="group rounded-[26px] border border-ink/10 bg-paper p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-gold/10 text-xs font-extrabold text-gold">{n}</span><h3 className="mt-7 font-display text-2xl font-bold">{title}</h3><p className="mt-3 text-sm leading-6 text-slate">{text}</p></div>)}
            </div>
          </div>
        </section>

        <AdaptiveRoadmap />
        <ComparisonSection />

        <section className="adaptive-panel adaptive-cta relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,.35),transparent_30%),radial-gradient(circle_at_80%_80%,rgba(14,165,233,.25),transparent_30%)]" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-5 py-20 sm:px-6 md:grid-cols-[1fr_auto]">
            <div><p className="text-xs font-bold uppercase tracking-[.18em] cta-eyebrow">Your next step starts here</p><h2 className="mt-4 max-w-2xl font-display text-4xl font-extrabold leading-tight sm:text-5xl">Stop guessing. Start with a trail.</h2><p className="mt-5 max-w-xl text-sm leading-7 cta-copy">Create your account, take the diagnostic and let Trailhead map your next move.</p></div>
            <Link to="/register" className="cta-button rounded-2xl px-6 py-3 text-sm font-extrabold shadow-xl transition hover:-translate-y-0.5">Start learning free →</Link>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
