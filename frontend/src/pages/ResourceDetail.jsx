import React from "react";
import { Link, useParams } from "react-router-dom";
import AppShell from "../components/AppShell.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { SUBJECTS } from "../lib/onboarding.js";

const resourcePages = {
  "concept-refreshers": {
    icon: "📘",
    title: "Concept refreshers",
    eyebrow: "Understand the idea",
    description: "Short, focused revision paths for concepts that appear on your current learning trail.",
    intro: "Start with the subject you want to review. Trailhead will take you to the subject page where your strong topics, focus areas and current milestone are visible.",
    links: SUBJECTS.map((subject) => ({ label: `${subject} progress`, to: `/subjects/${subject.toLowerCase().replace(/\s+/g, "-")}` })),
  },
  "visual-lessons": {
    icon: "🎥",
    title: "Visual lessons",
    eyebrow: "See the concept",
    description: "Use visual explanations when a diagram, animation or worked example makes the idea easier to understand.",
    intro: "Choose a subject to open a curated visual-learning search. These links open in a new tab so you can return to your Trailhead route when you're done.",
    links: SUBJECTS.map((subject) => ({
      label: `${subject} visual lessons`,
      external: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${subject} class 10 concepts explained`)}`,
    })),
  },
  "practice-sets": {
    icon: "📝",
    title: "Practice sets",
    eyebrow: "Test the learning",
    description: "Practice the topics that need evidence of improvement instead of repeating everything equally.",
    intro: "Use weekly tests for scored practice, then return to your analytics to see whether the topic is improving.",
    links: [
      { label: "View test reports", to: "/weekly-tests" },
      { label: "View progress & analytics", to: "/analytics" },
      ...SUBJECTS.map((subject) => ({ label: `${subject} practice context`, to: `/subjects/${subject.toLowerCase().replace(/\s+/g, "-")}` })),
    ],
  },
  "trail-recommendations": {
    icon: "🧭",
    title: "Trail recommendations",
    eyebrow: "Follow your route",
    description: "Continue from the milestone Trailhead currently considers most useful for you.",
    intro: "Your learning trail is the source of truth for what comes next. Use it to inspect milestones and your progress, then use analytics to verify the change.",
    links: [
      { label: "Open my learning trail", to: "/learning-trail" },
      { label: "See progress & analytics", to: "/analytics" },
      { label: "Open Mathematics", to: "/subjects/mathematics" },
      { label: "Open Physics", to: "/subjects/physics" },
    ],
  },
};

export default function ResourceDetail() {
  const { type } = useParams();
  const { user } = useAuth();
  const studentClass = user?.studentClass || "";
  const basePage = resourcePages[type] || resourcePages["concept-refreshers"];
  const page = type === "visual-lessons"
    ? {
        ...basePage,
        links: SUBJECTS.map((subject) => ({
          label: `${subject} visual lessons`,
          external: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${subject} ${studentClass} concepts explained`)}`,
        })),
      }
    : basePage;

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1560px] px-5 py-8 sm:px-6 lg:py-10">
        <Link to="/resources" className="text-xs font-semibold text-slate transition hover:text-ink">← Back to resources</Link>

        <section className="mt-6 dashboard-card overflow-hidden">
          <div className="bg-ink p-7 text-paper sm:p-10">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gold text-xl text-ink">{page.icon}</span>
              <p className="eyebrow !text-gold">{page.eyebrow}</p>
            </div>
            <h1 className="mt-6 font-display text-4xl font-semibold sm:text-5xl">{page.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-paper/65">{page.description}</p>
          </div>

          <div className="p-7 sm:p-10">
            <p className="max-w-3xl text-sm leading-7 text-slate">{page.intro}</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {page.links.map((item) => item.external ? (
                <a key={item.label} href={item.external} target="_blank" rel="noreferrer" className="group rounded-2xl border border-ink/10 bg-white p-4 transition hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-md">
                  <span className="text-sm font-semibold text-ink">{item.label}</span>
                  <span className="mt-1 block text-xs text-slate">Open external lesson search ↗</span>
                </a>
              ) : (
                <Link key={item.label} to={item.to} className="group rounded-2xl border border-ink/10 bg-white p-4 transition hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-md">
                  <span className="text-sm font-semibold text-ink">{item.label}</span>
                  <span className="mt-1 block text-xs text-slate">Open in Trailhead →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
