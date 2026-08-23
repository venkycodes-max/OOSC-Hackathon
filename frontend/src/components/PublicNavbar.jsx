import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import LanguageSelect from "./LanguageSelect.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import TrailheadLogo from "./TrailheadLogo.jsx";

export default function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const links = [["/about", "About"], ["/help", "Help"]];

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[74px] max-w-6xl items-center justify-between px-5 sm:px-6">
        <Link to="/" onClick={() => setOpen(false)}><TrailheadLogo /></Link>

        <nav className="hidden items-center gap-2 md:flex">
          {links.map(([href, label]) => (
            <Link key={href} to={href} className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${location.pathname === href ? "bg-gold/10 text-gold" : "text-slate hover:bg-soft hover:text-ink"}`}>
              {label}
            </Link>
          ))}
          <LanguageSelect compact />
          <ThemeToggle />
          <Link to="/login" className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate transition hover:text-ink">Login</Link>
          <Link to="/register" className="button-primary !rounded-xl !px-5 !py-2.5">Get started <span>→</span></Link>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button className="grid h-10 w-10 place-items-center rounded-2xl border border-ink/10 bg-surface" onClick={() => setOpen(v => !v)} aria-label="Open menu">
            {open ? "×" : "☰"}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-ink/10 bg-paper px-5 py-4 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1">
            {links.map(([href, label]) => <Link key={href} to={href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 font-semibold hover:bg-soft">{label}</Link>)}
            <LanguageSelect />
            <Link to="/login" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 font-semibold hover:bg-soft">Login</Link>
            <Link to="/register" onClick={() => setOpen(false)} className="button-primary mt-2 text-center">Get started →</Link>
          </div>
        </div>
      )}
    </header>
  );
}
