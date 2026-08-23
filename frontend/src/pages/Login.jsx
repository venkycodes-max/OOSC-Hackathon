import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { stageToRoute } from "../lib/onboarding.js";
import PublicNavbar from "../components/PublicNavbar.jsx";
import PublicFooter from "../components/PublicFooter.jsx";

export default function Login() {
  const [email, setEmail] = useState(""), [password, setPassword] = useState(""), [error, setError] = useState(""), [busy, setBusy] = useState(false);
  const { login } = useAuth(); const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.token, res.data.user);
      navigate(stageToRoute(res.data.user.onboardingStage));
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 404) {
        setError("Invalid email or password. Please try again.");
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.request) {
        setError("Unable to reach the server. Please try again in a moment.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  return <div className="page-shell bg-paper"><PublicNavbar /><main className="auth-shell flex-1"><div className="auth-copy"><p className="eyebrow">Welcome back</p><h1 className="mt-3 font-display text-5xl font-semibold leading-tight">Pick up where your trail left off.</h1><p className="mt-5 text-slate leading-7">Your assessment results, roadmap, and progress are saved to your account.</p></div><form onSubmit={handleSubmit} className="dashboard-card p-6 sm:p-8">
    {error && <div className="mb-5 rounded-xl border border-rust/20 bg-rust/5 px-4 py-3 text-sm text-rust">{error}</div>}
    <div className="space-y-5">
      <Field label="Email"><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="input" placeholder="you@example.com" /></Field>
      <Field label="Password"><input type="password" required value={password} onChange={e=>setPassword(e.target.value)} className="input" placeholder="Your password" /></Field>
      <button disabled={busy} className="button-primary w-full justify-center disabled:opacity-50">{busy ? "Logging in..." : "Log in →"}</button>
    </div>
    <p className="mt-6 text-center text-sm text-slate">New to Trailhead? <Link to="/register" className="font-semibold text-ink hover:text-gold">Create an account</Link></p>
  </form></main><PublicFooter /></div>;
}
function Field({label,children}) { return <label className="block"><span className="mb-2 block text-xs font-mono uppercase tracking-wider text-slate">{label}</span>{children}</label>; }
