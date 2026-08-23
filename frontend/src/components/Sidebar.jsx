import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getSubjectsForUser } from "../lib/onboarding.js";
import ThemeToggle from "./ThemeToggle.jsx";

const icons = {
  dashboard: <><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" /></>,
  trail: <><path d="M5 19c4-5 10-4 14-14" /><circle cx="5" cy="19" r="2" /><circle cx="19" cy="5" r="2" /></>,
  subjects: <><path d="M4 6.5 12 3l8 3.5L12 10 4 6.5Z" /><path d="M6 9v5.5c3 2 9 2 12 0V9" /></>,
  code: <><path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" /></>,
  doubt: <><path d="M5 6.5A3.5 3.5 0 0 1 8.5 3h7A3.5 3.5 0 0 1 19 6.5v5A3.5 3.5 0 0 1 15.5 15H11l-4 4v-4.8A3.5 3.5 0 0 1 5 11.5z" /><path d="M9 8.5h6M9 11h4" /></>,
  tests: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 7h6M9 11h6M9 15h4" /></>,
  analytics: <><path d="M4 19V9M10 19V5M16 19v-7M22 19V3" /><path d="M3 21h20" /></>,
  resources: <><path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v17H7.5A2.5 2.5 0 0 0 5 21.5z" /><path d="M5 4.5v17M8 6h8M8 10h8" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1a2 2 0 1 1-2.8 2.8l-.1-.1a2 2 0 0 0-3.4 1.4V19a2 2 0 1 1-4 0v-.1A2 2 0 0 0 5.8 17l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A2 2 0 0 0 1.6 10H1.5a2 2 0 1 1 0-4h.1A2 2 0 0 0 3 2.6l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A2 2 0 0 0 9.2 1.6h.1a2 2 0 1 1 4 0v.1A2 2 0 0 0 16.7 3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A2 2 0 0 0 20.9 9h.1a2 2 0 1 1 0 4h-.1a2 2 0 0 0-1.5 2Z" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 4.2 1.8c-.9.8-1.7 1.2-1.7 2.7M12 16.8v.1" /></>,
};
function Icon({ name }) {
  return <svg viewBox="0 0 24 24" className="h-[17px] w-[17px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{icons[name]}</svg>;
}
function Item({ to, label, icon, active, onClick, badge }) {
  return <Link to={to} onClick={onClick} className={`sidebar-link ${active ? "sidebar-link-active" : ""}`}>
    <Icon name={icon} /><span className="min-w-0 flex-1">{label}</span>{badge && <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${active ? "bg-white/15 text-paper" : "bg-gold/10 text-gold"}`}>{badge}</span>}
  </Link>;
}

export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  const { user } = useAuth();
  const subjects = getSubjectsForUser(user);
  const studentClass = String(user?.studentClass || "");
  const isSchoolCodeUser = /^Class\s+(8|9|10|11|12)$/i.test(studentClass);
  const isCSUG = /^UG\s+Year\s+[1-4]$/i.test(studentClass) && user?.branch === "Computer Science";
  const canUseCodeEditor = isSchoolCodeUser || isCSUG;
  const [subjectsOpen, setSubjectsOpen] = useState(location.pathname.startsWith("/subjects"));
  useEffect(() => { if (location.pathname.startsWith("/subjects")) setSubjectsOpen(true); }, [location.pathname]);
  const close = () => onClose?.();
  const active = (prefix) => location.pathname === prefix || location.pathname.startsWith(`${prefix}/`);

  return (
    <>
      {open && <button aria-label="Close learning menu" onClick={close} className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm lg:hidden" />}
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="flex items-center justify-between lg:hidden">
          <p className="font-display text-lg font-bold">Learning menu</p>
          <button onClick={close} className="rounded-xl p-2 text-slate hover:bg-soft" aria-label="Close menu">✕</button>
        </div>

        <div className="sidebar-section-label mt-3">Workspace</div>
        <div className="space-y-1">
          <Item to="/dashboard" label="Dashboard" icon="dashboard" active={active("/dashboard")} onClick={close} />
          <Item to="/learning-trail" label="My Learning Trail" icon="trail" active={active("/learning-trail")} onClick={close} />
        </div>

        <div className="sidebar-section-label">Learn</div>
        <div className="space-y-1">
          <button type="button" onClick={() => setSubjectsOpen(v => !v)} className={`sidebar-link w-full justify-between ${active("/subjects") ? "sidebar-link-active" : ""}`}>
            <span className="flex min-w-0 items-center gap-3"><Icon name="subjects" /><span>Subjects</span></span>
            <span className={`text-xs transition-transform ${subjectsOpen ? "rotate-180" : ""}`}>⌄</span>
          </button>
          {subjectsOpen && <div className="ml-4 border-l border-ink/10 py-1 pl-3 space-y-1 animate-fade-up">
            {subjects.map(subject => {
              const slug = subject.toLowerCase().replace(/\s+/g, "-");
              return <Link key={subject} to={`/subjects/${slug}`} onClick={close} className={`sidebar-subject ${location.pathname === `/subjects/${slug}` ? "sidebar-subject-active" : ""}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />{subject}
              </Link>;
            })}
          </div>}

          {canUseCodeEditor && <Item to="/code-editor" label="Code Editor" icon="code" active={active("/code-editor")} onClick={close} badge={isCSUG ? "CS" : "CODE"} />}
          <Item to="/doubt-solver" label="AI Doubt Solver" icon="doubt" active={active("/doubt-solver")} onClick={close} badge="AI" />
          <Item to="/resources" label="Resources" icon="resources" active={active("/resources")} onClick={close} />
        </div>

        <div className="sidebar-section-label">Track</div>
        <div className="space-y-1">
          <Item to="/weekly-tests" label="Test Reports" icon="tests" active={active("/weekly-tests")} onClick={close} />
          <Item to="/analytics" label="Progress & Analytics" icon="analytics" active={active("/analytics")} onClick={close} />
        </div>

        <div className="mt-5 rounded-[24px] bg-gradient-to-br from-violet-600 to-sky-500 p-4 text-white shadow-lg shadow-violet-500/20">
          <div className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-xl bg-white/15">✦</span><span className="text-[9px] font-bold uppercase tracking-[.16em] text-white/75">Smart learning</span></div>
          <p className="mt-3 font-display text-lg font-bold">Your route keeps adapting.</p>
          <p className="mt-1 text-[11px] leading-5 text-white/75">Use quizzes and the AI Doubt Solver to give your trail better information.</p>
          <Link to="/analytics" onClick={close} className="mt-3 inline-flex text-xs font-bold text-white hover:underline">See progress →</Link>
        </div>

        <div className="mt-auto pt-5">
          <div className="mb-2 flex items-center justify-between px-2">
            <span className="text-[10px] font-bold uppercase tracking-[.15em] text-slate">Preferences</span>
            <ThemeToggle />
          </div>
          <Item to="/settings" label="Settings" icon="settings" active={active("/settings")} onClick={close} />
          <Item to="/help" label="Help & support" icon="help" active={active("/help")} onClick={close} />
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-ink/10 bg-surface p-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gold/10 font-bold text-gold">{user?.name?.charAt(0)?.toUpperCase() || "T"}</span>
            <div className="min-w-0"><p className="truncate text-xs font-bold">{user?.name || "Student"}</p><p className="text-[10px] font-bold uppercase tracking-wider text-slate">{user?.studentClass || "Learner"}</p></div>
          </div>
        </div>
      </aside>
    </>
  );
}
