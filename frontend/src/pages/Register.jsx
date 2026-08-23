import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import PublicNavbar from "../components/PublicNavbar.jsx";
import PublicFooter from "../components/PublicFooter.jsx";

const CLASS_OPTIONS = ["Class 8","Class 9","Class 10","Class 11","Class 12","UG Year 1","UG Year 2","UG Year 3","UG Year 4"];
const BRANCH_OPTIONS = ["Computer Science", "Mechanical Engineering", "Electrical Engineering", "Electronics & Communication Engineering"];

export default function Register() {
  const [form,setForm]=useState({name:"",email:"",password:"",studentClass:"",branch:""}), [error,setError]=useState(""), [busy,setBusy]=useState(false);
  const {login}=useAuth(); const navigate=useNavigate();
  const update=(field,value)=>setForm(f=>({...f,[field]:value}));
  async function handleSubmit(e){e.preventDefault();setError("");setBusy(true);try{const res=await api.post("/auth/register",form);login(res.data.token,res.data.user);navigate("/welcome")}catch(err){setError(err.response?.data?.error||"Something went wrong. Please try again.")}finally{setBusy(false)}}

  return <div className="page-shell bg-paper"><PublicNavbar /><main className="auth-shell flex-1"><div className="auth-copy"><p className="eyebrow">Start your trail</p><h1 className="mt-3 font-display text-5xl font-semibold leading-tight">Turn your next study session into a direction.</h1><p className="mt-5 text-slate leading-7">Create a student account, take one diagnostic, and Trailhead will build the first route around your gaps and goal.</p><div className="mt-8 space-y-3 text-sm text-slate"><p>✓ Personalized diagnostic</p><p>✓ Goal-aware roadmap</p><p>✓ Progress saved as you learn</p></div></div><form onSubmit={handleSubmit} className="dashboard-card p-6 sm:p-8">
    {error && <div className="mb-5 rounded-xl border border-rust/20 bg-rust/5 px-4 py-3 text-sm text-rust">{error}</div>}
    <div className="space-y-4">
      <Field label="Full name"><input required value={form.name} onChange={e=>update("name",e.target.value)} className="input" placeholder="Your name" /></Field>
      <Field label="Email"><input type="email" required value={form.email} onChange={e=>update("email",e.target.value)} className="input" placeholder="you@example.com" /></Field>
      <Field label="Password"><input type="password" required minLength={6} value={form.password} onChange={e=>update("password",e.target.value)} className="input" placeholder="At least 6 characters" /></Field>
      <Field label="Your class"><select required value={form.studentClass} onChange={e=>{update("studentClass",e.target.value); if (!e.target.value.startsWith("UG")) update("branch","");}} className="input"><option value="" disabled>Select your class</option>{CLASS_OPTIONS.map(c=><option key={c}>{c}</option>)}</select></Field>
      {form.studentClass.startsWith("UG") && <Field label="UG branch"><select required value={form.branch} onChange={e=>update("branch",e.target.value)} className="input"><option value="" disabled>Select your branch</option>{BRANCH_OPTIONS.map(branch=><option key={branch}>{branch}</option>)}</select><p className="mt-2 text-xs leading-5 text-slate">Your branch helps Trailhead set the right academic depth and examples. The overall diagnostic still covers all six core subjects.</p></Field>}
      <button disabled={busy} className="button-primary mt-2 w-full justify-center disabled:opacity-50">{busy ? "Creating account..." : "Create account →"}</button>
    </div>
    <p className="mt-6 text-center text-sm text-slate">Already have an account? <Link to="/login" className="font-semibold text-ink hover:text-gold">Log in</Link></p>
  </form></main><PublicFooter /></div>;
}
function Field({label,children}) { return <label className="block"><span className="mb-2 block text-xs font-mono uppercase tracking-wider text-slate">{label}</span>{children}</label>; }
