import React from "react";
import { useLanguage } from "../context/LanguageContext.jsx";

export default function LanguageSelect({ compact = false }) {
  const { language, languages, changeLanguage } = useLanguage();
  return (
    <label className={`inline-flex items-center gap-2 rounded-xl border border-ink/10 bg-white ${compact ? "px-2.5 py-2" : "px-3 py-2"}`}>
      <span className="text-[10px] font-mono uppercase tracking-wider text-slate">Aa</span>
      <select
        value={language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="bg-transparent text-xs font-medium text-ink outline-none cursor-pointer"
        aria-label="Language"
      >
        {languages.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}
      </select>
    </label>
  );
}
