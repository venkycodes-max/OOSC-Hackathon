import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Welcome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="adaptive-panel min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-lg text-center">
        <p className="text-gold font-mono text-xs tracking-widest uppercase mb-4">Trailhead</p>
        <h1 className="text-4xl text-ink dark:text-paper font-display font-semibold leading-tight mb-4">
          Welcome aboard, {user?.name?.split(" ")[0]}.
        </h1>
        <p className="text-slate text-base leading-relaxed mb-10">
          Before we map your learning trail, we'll assess your starting point across the subjects
          subjects. This is a baseline, not a test you can fail — it helps Trailhead understand
          where you stand before your subject-specific practice begins.
        </p>

        <div className="bg-paper rounded-2xl p-6 shadow-xl text-left">
          <p className="text-ink font-display font-semibold text-lg mb-1">Your overall 3-level check-in</p>
          <p className="text-slate text-sm mb-5">
            12 questions mixed across Mathematics, Physics, Chemistry, Biology, Computer Science,
            and English — with exactly 4 Easy, 4 Medium, and 4 Hard questions. You'll get two
            questions from each subject so every subject can start with its own learning trail.
          </p>

          <div className="grid grid-cols-3 gap-2 mb-5">
            {["Easy · 4", "Medium · 4", "Hard · 4"].map((label) => (
              <div key={label} className="rounded-lg bg-ink/5 px-3 py-2 text-center text-xs font-mono text-slate">
                {label}
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate("/assessment", { state: { mode: "onboarding" } })}
            className="w-full bg-ink text-paper dark:bg-paper dark:text-ink rounded-lg py-2.5 font-medium hover:bg-ink/90 transition"
          >
            Start overall check-in →
          </button>
        </div>
      </div>
    </div>
  );
}
