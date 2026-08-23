import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { AIM_OPTIONS } from "../lib/onboarding.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function AimSelection() {
  const [aim, setAim] = useState(null);
  const [aimDetail, setAimDetail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { updateUser, user } = useAuth();

  async function handleSubmit() {
    if (!aim) return;
    setBusy(true);
    setError("");
    try {
      await api.post("/roadmap/set-aim", { aim, aimDetail });
      updateUser({ ...user, aim, aimDetail, onboardingStage: "complete" });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Could not build your roadmap. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="adaptive-panel min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <p className="text-gold font-mono text-xs tracking-widest uppercase mb-3 text-center">Almost there</p>
        <h1 className="text-3xl text-ink dark:text-paper font-display font-semibold text-center mb-2">
          What are you working toward?
        </h1>
        <p className="text-slate text-sm text-center mb-8">
          This shapes how we prioritize your roadmap — same weak spots, different focus.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {AIM_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setAim(opt.value)}
              className={`text-left p-4 rounded-xl border transition bg-paper ${
                aim === opt.value ? "border-gold ring-2 ring-gold/40" : "border-transparent hover:border-slate/30"
              }`}
            >
              <p className="font-display font-semibold text-ink mb-1">{opt.label}</p>
              <p className="text-xs text-slate leading-snug">{opt.description}</p>
            </button>
          ))}
        </div>

        {aim && (aim === "entrance-exam" || aim === "btech-placements") && (
          <div className="bg-paper rounded-xl p-4 mb-5">
            <label className="block text-xs font-mono text-slate mb-1">
              {aim === "entrance-exam" ? "Which exam? (e.g. JEE Mains, NEET)" : "What kind of role? (e.g. SDE, core mechanical)"}
            </label>
            <input
              value={aimDetail}
              onChange={(e) => setAimDetail(e.target.value)}
              className="w-full rounded-lg border border-slate/30 px-3 py-2 bg-surface focus:border-gold outline-none"
              placeholder="Optional, but helps us tailor further"
            />
          </div>
        )}

        {error && <p className="text-rust text-sm text-center mb-4">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={!aim || busy}
          className="w-full bg-gold text-ink rounded-lg py-3 font-semibold hover:bg-gold/90 transition disabled:opacity-40"
        >
          {busy ? "Charting your trail..." : "Build my roadmap"}
        </button>
      </div>
    </div>
  );
}
