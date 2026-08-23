import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar.jsx";
import PublicFooter from "../components/PublicFooter.jsx";
import AdaptiveRoadmap from "../components/AdaptiveRoadmap.jsx";
import ComparisonSection from "../components/ComparisonSection.jsx";

const trailCards = [
  { topic: "Quadratic Equations", status: "Mastered", kind: "done", title: "A foundation you can trust.", text: "You've already built enough confidence here to keep moving." },
  { topic: "Functions & Graphs", status: "Current focus", kind: "now", title: "This is where your trail points next.", text: "Trailhead gives extra attention to the concepts most likely to unlock your next milestone." },
  { topic: "Calculus Foundations", status: "Next", kind: "next", title: "A milestone waiting ahead.", text: "Once your current focus is stronger, this becomes the next route marker." },
  { topic: "Probability", status: "Upcoming", kind: "next", title: "Further along the route.", text: "You don't need to study everything at once. Your trail keeps the next step visible." },
];

const features = [
  ["Personal diagnosis", "Find the topics that need attention before spending hours studying them."],
  ["Goal-aware roadmap", "Prepare differently for an entrance exam, placements, coursework, or general improvement."],
  ["Targeted weekly quizzes", "Practice follows your current weak spots instead of repeating what you already know."],
];

const steps = [
  { n: "01", title: "Diagnose", text: "A short check-in maps what you know across easy, medium, and hard questions." },
  { n: "02", title: "Understand", text: "Your answer pattern becomes clear strengths, gaps, and priorities." },
  { n: "03", title: "Build your trail", text: "Your goal shapes a practical sequence of milestones." },
  { n: "04", title: "Keep moving", text: "Weekly check-ins show whether the work is actually sticking." },
];

export default function Home() {
  const [activeCard, setActiveCard] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => setActiveCard(current => (current + 1) % trailCards.length), 4200);
    return () => clearInterval(timer);
  }, []);

  const card = trailCards[activeCard];

  return (
    <div className="page-shell bg-paper">
      <PublicNavbar />
      <main className="flex-1">
        <section className="hero-grid overflow-hidden">
          <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-20 sm:px-6 md:grid-cols-[1.05fr_.95fr] md:py-28">
            <div className="animate-fade-up">
              <div className="eyebrow mb-5"><span className="h-1.5 w-1.5 rounded-full bg-gold" /> Your learning, mapped.</div>
              <h1 className="max-w-3xl font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
                Stop wondering what to study <span className="text-gold">next.</span>
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-slate">Trailhead diagnoses where you stand, finds the gaps that matter, and turns them into a personalized learning trail built around your goal.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link to="/register" className="button-primary justify-center">Build my learning trail <span>→</span></Link>
                <Link to="/about" className="button-secondary justify-center">See how it works</Link>
              </div>
              <p className="mt-5 text-xs text-slate">Free to start · Student-focused · One subject per assessment</p>
            </div>

            <div className="relative animate-fade-up delay-100">
              <div className="absolute -inset-6 rounded-[40px] bg-gold/10 blur-2xl" />
              <div className="relative rounded-[28px] border border-ink/10 bg-white p-5 shadow-[0_30px_80px_rgba(27,35,64,.14)] sm:p-7" aria-live="polite">
                <div className="flex items-center justify-between border-b border-ink/10 pb-5">
                  <div>
                    <p className="text-xs font-mono uppercase tracking-[.18em] text-slate">Your learning trail</p>
                    <p className="mt-1 font-display text-xl font-semibold">Mathematics · Class 12</p>
                  </div>
                  <span className="rounded-full bg-moss/10 px-3 py-1 text-xs font-medium text-moss">{card.status}</span>
                </div>

                <div className="mt-5 min-h-[250px]">
                  <div className="trail-preview">
                    {trailCards.map((item, i) => (
                      <button key={item.topic} type="button" onClick={() => setActiveCard(i)} className={`relative flex w-full gap-4 rounded-xl p-2 text-left transition-all duration-500 ${i === activeCard ? "bg-gold/5 -translate-y-1" : "opacity-55 hover:opacity-90"}`}>
                        <span className={`preview-node ${item.kind}`}>{item.kind === "done" ? "✓" : i + 1}</span>
                        <span className="pb-3">
                          <span className="block text-sm font-semibold text-ink">{item.topic}</span>
                          <span className={`mt-1 block text-xs ${item.kind === "done" ? "text-moss" : item.kind === "now" ? "text-gold" : "text-slate"}`}>{item.status}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-1 rounded-2xl bg-ink p-4 text-paper transition-all duration-500">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs text-paper/55">{card.status}</p>
                      <p className="mt-1 font-medium">{card.title}</p>
                      <p className="mt-1 text-xs leading-5 text-paper/55">{card.text}</p>
                    </div>
                    <span className="mt-1 text-gold">→</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex gap-1.5" role="tablist" aria-label="Learning trail preview">
                    {trailCards.map((item, i) => <button key={item.topic} type="button" role="tab" aria-selected={i === activeCard} aria-label={`Show ${item.topic}`} onClick={() => setActiveCard(i)} className={`h-1.5 rounded-full transition-all ${i === activeCard ? "w-7 bg-gold" : "w-1.5 bg-slate/25"}`} />)}
                  </div>
                  <div className="flex gap-2">
                    <button type="button" aria-label="Previous trail card" onClick={() => setActiveCard((activeCard - 1 + trailCards.length) % trailCards.length)} className="grid h-8 w-8 place-items-center rounded-full border border-ink/10 text-sm transition hover:bg-ink hover:text-paper">←</button>
                    <button type="button" aria-label="Next trail card" onClick={() => setActiveCard((activeCard + 1) % trailCards.length)} className="grid h-8 w-8 place-items-center rounded-full border border-ink/10 text-sm transition hover:bg-ink hover:text-paper">→</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-ink/10 bg-white">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:px-6 md:grid-cols-3">
            {features.map(([title, text]) => <div key={title} className="md:border-l md:border-ink/10 md:pl-8 first:md:border-0 first:md:pl-0"><p className="font-display text-xl font-semibold">{title}</p><p className="mt-2 text-sm leading-6 text-slate">{text}</p></div>)}
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1680px] px-5 py-20 sm:px-6 md:py-28">
          <div className="max-w-2xl">
            <p className="eyebrow">A better starting point</p>
            <h2 className="section-title">The roadmap starts with you, not a template.</h2>
            <p className="section-copy">Most study plans begin with a syllabus. Trailhead begins with your actual performance, then uses your goal to decide what deserves your time.</p>
          </div>
          <div className="mt-14 grid gap-4 md:grid-cols-4">
            {steps.map(step => <div key={step.n} className="group rounded-2xl border border-ink/10 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-ink/5"><span className="font-mono text-xs text-gold">{step.n}</span><h3 className="mt-8 font-display text-2xl font-semibold">{step.title}</h3><p className="mt-3 text-sm leading-6 text-slate">{step.text}</p></div>)}
          </div>
        </section>

        <AdaptiveRoadmap />
        <ComparisonSection />

        <section className="bg-ink text-paper">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-20 sm:px-6 md:grid-cols-[1fr_auto] md:py-24">
            <div>
              <p className="eyebrow !text-gold">Start from where you are</p>
              <h2 className="mt-4 max-w-2xl font-display text-4xl font-semibold leading-tight sm:text-5xl">Your next step should be clearer than your last.</h2>
              <p className="mt-5 max-w-xl text-paper/65">Take the diagnostic, choose what you're working toward, and let Trailhead chart the first route.</p>
            </div>
            <Link to="/register" className="button-primary whitespace-nowrap">Create your account →</Link>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
