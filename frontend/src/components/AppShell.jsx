import React, { useState } from "react";
import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";
import PublicFooter from "./PublicFooter.jsx";

export default function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="page-shell bg-paper text-ink">
      <Navbar />
      <div className="mx-auto flex w-full max-w-none flex-1">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="min-w-0 flex-1">
          <div className="border-b border-ink/10 bg-paper/90 px-5 py-3 backdrop-blur lg:hidden">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-ink/10 bg-surface px-3 py-2 text-xs font-semibold text-ink shadow-sm"
            >
              <span className="text-gold">☰</span> Open learning menu
            </button>
          </div>
          <main className="min-w-0">{children}</main>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
