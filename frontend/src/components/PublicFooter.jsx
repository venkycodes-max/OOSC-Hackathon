import React from "react";
import { Link } from "react-router-dom";

export default function PublicFooter() {
  return (
    <footer className="border-t border-ink/10 bg-ink text-paper">
      <div className="mx-auto grid max-w-[1680px] gap-10 px-5 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gold text-ink font-display font-bold">T</span>
            <span className="font-display text-xl font-semibold">Trailhead</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-6 text-paper/65">
            A personalized learning trail that starts with what you know and builds toward where you want to go.
          </p>
        </div>
        <div>
          <p className="footer-heading">Explore</p>
          <div className="mt-4 space-y-3 text-sm text-paper/65">
            <Link className="footer-link" to="/about">About Trailhead</Link>
            <Link className="footer-link" to="/help">Help & support</Link>
            <Link className="footer-link" to="/login">Log in</Link>
            <Link className="footer-link" to="/register">Create account</Link>
          </div>
        </div>
        <div>
          <p className="footer-heading">Contact</p>
          <div className="mt-4 space-y-3 text-sm text-paper/65">
            <p>Questions about your learning trail?</p>
            <a className="footer-link" href="mailto:hello@trailhead.study">hello@trailhead.study</a>
            <p className="pt-2 text-xs text-paper/40">Built for students who want a clearer next step.</p>
          </div>
        </div>
      </div>
      <div className="border-t border-paper/10">
        <div className="mx-auto flex max-w-[1680px] flex-col gap-2 px-5 py-5 text-xs text-paper/40 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Trailhead</span>
          <span>Learn with direction, not guesswork.</span>
        </div>
      </div>
    </footer>
  );
}
