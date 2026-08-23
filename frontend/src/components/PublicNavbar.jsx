import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import LanguageSelect from "./LanguageSelect.jsx";

function Mark() {
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-gold shadow-sm">
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <path d="M5 18.5 12 5l7 13.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8.3 14.3h7.4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
      </svg>
    </span>
  );
}

export default function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const links = [
    ["/about", "About"],
    ["/help", "Help"],
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5 sm:px-6">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <Mark />
          <span className="font-display text-xl font-semibold tracking-tight">Trailhead</span>
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          {links.map(([href, label]) => (
            <Link key={href} to={href} className={`nav-link ${location.pathname === href ? "text-ink" : ""}`}>
              {label}
            </Link>
          ))}
          <LanguageSelect compact />
          <Link to="/login" className="nav-link">Login</Link>
          <Link to="/register" className="button-primary !px-5 !py-2.5">Create account</Link>
        </nav>

        <button
          className="rounded-xl border border-ink/10 p-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Open menu"
          aria-expanded={open}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            {open ? <path d="M6 6l12 12M18 6 6 18" /> : <><path d="M4 7h16M4 12h16M4 17h16" /></>}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-ink/10 bg-paper px-5 py-4 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1">
            {links.map(([href, label]) => (
              <Link key={href} to={href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 font-medium hover:bg-ink/5">{label}</Link>
            ))}
            <LanguageSelect />
            <Link to="/login" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 font-medium hover:bg-ink/5">Login</Link>
            <Link to="/register" onClick={() => setOpen(false)} className="button-primary mt-2 text-center">Create account</Link>
          </div>
        </div>
      )}
    </header>
  );
}
