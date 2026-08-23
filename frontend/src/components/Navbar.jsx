import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import LanguageSelect from "./LanguageSelect.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  function handleLogout() { logout(); navigate("/login"); }
  return <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper/95 backdrop-blur">
    <div className="mx-auto flex h-[68px] max-w-[1680px] items-center justify-between px-5 sm:px-6">
      <Link to="/dashboard" className="flex items-center gap-3"><span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-ink font-display font-bold text-gold">T</span><div><p className="font-display text-lg font-semibold leading-none">Trailhead</p><p className="mt-1 hidden text-[9px] font-mono uppercase tracking-[.18em] text-slate sm:block">Your learning trail</p></div></Link>
      <div className="flex items-center gap-2"><LanguageSelect compact /><div className="hidden text-right sm:block"><p className="text-sm font-medium">{user?.name}</p><p className="text-[9px] font-mono uppercase tracking-wider text-slate">{user?.studentClass}</p></div><button type="button" className="grid h-9 w-9 place-items-center rounded-xl border border-ink/10 bg-white text-slate" aria-label="Notifications">⌁</button><button onClick={handleLogout} className="rounded-xl border border-ink/15 px-3 py-2 text-xs font-medium text-slate transition hover:border-rust hover:text-rust">Log out</button></div>
    </div>
  </header>;
}
