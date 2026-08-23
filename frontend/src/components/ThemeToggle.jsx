import React, { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("trailhead_theme");
    return saved === "dark";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("trailhead_theme", dark ? "dark" : "light");
    window.dispatchEvent(new CustomEvent("trailhead-theme-change", { detail: dark }));
  }, [dark]);

  useEffect(() => {
    const sync = (event) => setDark(Boolean(event.detail));
    window.addEventListener("trailhead-theme-change", sync);
    return () => window.removeEventListener("trailhead-theme-change", sync);
  }, []);

  return (
    <button
      type="button"
      onClick={() => setDark(v => !v)}
      className="theme-toggle"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
    >
      {dark ? "☀" : "☾"}
    </button>
  );
}
