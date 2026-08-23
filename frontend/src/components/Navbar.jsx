import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import LanguageSelect from "./LanguageSelect.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import TrailheadLogo from "./TrailheadLogo.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  function handleLogout() { logout(); navigate("/login"); }

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[74px] max-w-[1680px] items-center justify-between px-5 sm:px-6">
        <Link to="/dashboard" aria-label="Trailhead dashboard">
          <TrailheadLogo />
        </Link>

        <div className="flex items-center gap-2.5">
          <LanguageSelect compact />
          <ThemeToggle />
          <div className="hidden items-center gap-2.5 rounded-2xl border border-ink/10 bg-surface px-3 py-2 sm:flex">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-gold/10 text-xs font-bold text-gold">
              {user?.name?.charAt(0)?.toUpperCase() || "T"}
            </span>
            <div className="max-w-[150px]">
              <p className="truncate text-xs font-bold">{user?.name}</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate">{user?.studentClass}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="rounded-2xl border border-ink/10 bg-surface px-3.5 py-2.5 text-xs font-bold text-slate transition hover:border-rust/40 hover:text-rust">
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
