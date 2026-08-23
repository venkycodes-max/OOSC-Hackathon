import React from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell.jsx";
import { getSubjectsForUser } from "../lib/onboarding.js";
import { useAuth } from "../context/AuthContext.jsx";

const resourceTypes = [
  { slug: "concept-refreshers", icon: "📘", title: "Concept refreshers", text: "Short explanations for topics currently appearing on your trail." },
  { slug: "visual-lessons", icon: "🎥", title: "Visual lessons", text: "Visual explanations and worked examples for concepts that benefit from seeing the idea." },
  { slug: "practice-sets", icon: "📝", title: "Practice sets", text: "Targeted practice to test whether a weak topic is actually improving." },
  { slug: "trail-recommendations", icon: "🧭", title: "Trail recommendations", text: "Resources organized around your current milestones rather than a generic syllabus." },
];

export default function Resources() {
  const { user } = useAuth();
  const subjects = getSubjectsForUser(user);
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1680px] px-5 py-8 sm:px-6 lg:py-10">
        <div className="mb-8">
          <p className="eyebrow">Learn with direction</p>
          <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">Resources</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate">Every resource category now opens its own useful destination. There are no placeholder “Coming next” cards.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {resourceTypes.map((resource, index) => (
            <Link
              key={resource.slug}
              to={`/resources/${resource.slug}`}
              className={`dashboard-card group p-6 transition duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-lg animate-fade-up ${index ? `delay-${Math.min(index,4)*100}` : ""}`}
            >
              <div className="flex items-start justify-between gap-4">
                <span className="text-2xl">{resource.icon}</span>
                <span className="text-xs font-semibold text-gold transition group-hover:translate-x-1">Open →</span>
              </div>
              <h2 className="mt-5 font-display text-2xl font-semibold">{resource.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate">{resource.text}</p>
            </Link>
          ))}
        </div>

        <section className="mt-6 dashboard-card p-6 sm:p-8">
          <p className="eyebrow">Quick subject access</p>
          <h2 className="mt-2 font-display text-3xl font-semibold">Open a subject and study from your data</h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {subjects.map((subject) => (
              <Link key={subject} to={`/subjects/${subject.toLowerCase().replace(/\s+/g, "-")}`} className="rounded-full border border-ink/10 px-4 py-2 text-xs font-medium text-ink transition hover:border-gold hover:bg-gold/5">
                {subject}
              </Link>
            ))}
          </div>
        </section>

        <div className="adaptive-panel mt-6 rounded-3xl p-6 sm:p-8">
          <p className="eyebrow !text-gold">Need a personalized next step?</p>
          <h2 className="mt-2 font-display text-3xl font-semibold">Use your Learning Trail.</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-paper/65">Your trail connects your assessment, strengths, focus areas and next milestone into one route.</p>
          <Link to="/learning-trail" className="mt-6 inline-flex rounded-xl bg-gold px-4 py-3 text-sm font-semibold text-ink">Open my trail →</Link>
        </div>
      </div>
    </AppShell>
  );
}
