import React from "react";

export default function TrailheadLogo({ compact = false }) {
  return (
    <span className={`flex items-center gap-2.5 ${compact ? "" : "group"}`}>
      <span className="trailhead-logo-mark relative grid h-10 w-10 place-items-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:-rotate-3">
        <svg viewBox="0 0 32 32" className="h-6 w-6 text-white" fill="none" aria-hidden="true">
          <path d="M6 23.5 15.2 7l4.2 7.2 2.5-4.1L27 23.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8.5 20h15" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/>
          <path d="M12.2 16.2h3.8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
        </svg>
        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-fuchsia-400 ring-2 ring-paper" />
      </span>
      {!compact && (
        <span>
          <span className="block font-display text-xl font-bold tracking-tight text-ink">Trailhead</span>
          <span className="hidden text-[9px] font-bold uppercase tracking-[.2em] text-slate sm:block">Learn with direction</span>
        </span>
      )}
    </span>
  );
}
