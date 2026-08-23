import React from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar.jsx";
import PublicFooter from "../components/PublicFooter.jsx";

const faqs = [
  ["Is Trailhead free?", "The current hackathon version is designed to be free to use. Create a student account to begin."],
  ["Can I study multiple subjects?", "Yes, but each assessment and its roadmap is intentionally subject-specific. Pick the subject you want to work on when starting an assessment."],
  ["How is my roadmap created?", "Trailhead looks at your question-level performance, identifies weak and strong topics, and combines those results with the goal you choose."],
  ["Does AI decide whether my answers are correct?", "No. Answer grading is deterministic. AI is used to interpret performance patterns and generate the diagnostic summary, roadmap, and practice content."],
  ["What happens after the diagnostic?", "You'll choose your aim, then Trailhead generates a sequence of milestones. Your dashboard becomes the home for that learning trail."],
];

export default function Help() {
  return (
    <div className="page-shell bg-paper">
      <PublicNavbar />
      <main className="flex-1 mx-auto w-full max-w-[1400px] px-5 py-16 sm:px-6 md:py-24">
        <p className="eyebrow">Help & support</p>
        <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight">Questions? Start here.</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate">A few answers about how Trailhead works. If you still need help, email us and tell us what you were trying to do.</p>
        <div className="mt-12 divide-y divide-ink/10 rounded-3xl border border-ink/10 bg-white px-6 sm:px-8">
          {faqs.map(([q, a]) => (
            <details key={q} className="group py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-display text-lg font-semibold">
                {q}
                <span className="text-gold transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate">{a}</p>
            </details>
          ))}
        </div>
        <div className="mt-10 rounded-3xl bg-ink p-7 text-paper sm:p-9">
          <p className="font-display text-2xl font-semibold">Still stuck?</p>
          <p className="mt-2 text-sm leading-6 text-paper/60">We're happy to help with account, assessment, or dashboard issues.</p>
          <a href="mailto:hello@trailhead.study" className="mt-5 inline-flex font-medium text-gold hover:underline">hello@trailhead.study →</a>
          <Link to="/register" className="ml-5 inline-flex font-medium text-paper hover:underline">Create an account</Link>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
