import React, { useRef, useState } from "react";
import AppShell from "../components/AppShell.jsx";
import { getSubjectsForUser } from "../lib/onboarding.js";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";

function renderError(err) {
  const status = err?.response?.status;
  const serverError = err?.response?.data?.error;
  if (serverError) return serverError;
  if (status === 413) return "That file is too large. Please upload a file under 10 MB.";
  if (status === 415) return "That file type is not supported. Use JPG, PNG, WEBP, GIF, PDF or TXT.";
  if (status === 422) return "Trailhead could not read that document. Try a text-based PDF or a clearer image.";
  return err?.message || "Trailhead could not solve this doubt. Please try again.";
}

export default function DoubtSolver() {
  const { user } = useAuth();
  const subjects = getSubjectsForUser(user);
  const [subject, setSubject] = useState("Mathematics");
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  async function solve(e) {
    e.preventDefault();
    if (!text.trim() && !file) {
      setError("Add a question, image, PDF, or text document first.");
      return;
    }

    if (file && file.size > 10 * 1024 * 1024) {
      setError("That file is too large. Please upload a file under 10 MB.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const form = new FormData();
      form.append("subject", subject);
      form.append("question", text.trim());
      if (file) form.append("file", file);

      // Do not set Content-Type manually. Axios/browser adds the multipart
      // boundary automatically, which Express/multer needs to parse the file.
      const res = await api.post("/doubts/solve", form);
      setResult(res.data);
    } catch (err) {
      setError(renderError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1560px] px-5 py-8 sm:px-6 lg:py-10">
        <div className="mb-8">
          <p className="eyebrow">Learn by asking</p>
          <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">Doubt Solver</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate">
            Ask in text or upload a question image/PDF. Trailhead identifies the concept,
            explains it step by step, and gives you a similar problem to try.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <form onSubmit={solve} className="dashboard-card p-6 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Your doubt</p>
                <h2 className="mt-1 font-display text-2xl font-semibold">What are you stuck on?</h2>
              </div>
              <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-medium text-gold">Text + image + PDF</span>
            </div>

            <label className="mt-6 block text-xs font-mono uppercase tracking-wider text-slate">
              Subject
              <select value={subject} onChange={(e) => setSubject(e.target.value)} className="input mt-2">
                {subjects.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>

            <label className="mt-5 block text-xs font-mono uppercase tracking-wider text-slate">
              Question
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={7}
                className="input mt-2 resize-y"
                placeholder="For example: Why do we divide both sides by the coefficient here? Please explain the step where I got confused..."
              />
            </label>

            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,text/plain,.jpg,.jpeg,.png,.webp,.gif,.pdf,.txt"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" onClick={() => inputRef.current?.click()} className="button-secondary !px-4 !py-2.5">
                📎 Upload image / PDF / TXT
              </button>
              {file && (
                <button
                  type="button"
                  onClick={() => { setFile(null); if (inputRef.current) inputRef.current.value = ""; }}
                  className="rounded-xl bg-moss/10 px-3 py-2.5 text-xs font-medium text-moss"
                  title="Remove attachment"
                >
                  {file.name} ×
                </button>
              )}
            </div>
            <p className="mt-2 text-[11px] leading-5 text-slate">Images up to 10 MB are read by Trailhead's vision model. Text-based PDFs are extracted and solved; scanned PDFs should be uploaded as an image.</p>

            {error && <p className="mt-4 rounded-xl bg-rust/5 p-3 text-xs leading-5 text-rust">{error}</p>}
            <button disabled={loading} className="button-primary mt-6 w-full justify-center disabled:cursor-not-allowed disabled:opacity-50">
              {loading ? "Trailhead is thinking..." : "Solve my doubt →"}
            </button>
          </form>

          <div className="rounded-3xl bg-ink p-6 text-paper sm:p-8">
            <p className="eyebrow !text-gold">How Trailhead teaches</p>
            <h2 className="mt-2 font-display text-3xl font-semibold">Don't just give me the answer.</h2>
            <div className="mt-7 space-y-4">
              {[
                "Read the typed question or attachment",
                "Identify the exact misconception",
                "Explain the idea in small steps",
                "Give a similar practice question",
                "Connect the doubt back to your learning trail",
              ].map((x, i) => (
                <div key={x} className="flex gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gold text-xs font-bold text-ink">{i + 1}</span>
                  <p className="text-sm leading-6 text-paper/70">{x}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {result && (
          <section className="mt-6 dashboard-card overflow-hidden">
            <div className="border-b border-ink/10 bg-moss/5 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="eyebrow !text-moss">Trailhead explanation</p>
                  <h2 className="mt-1 font-display text-2xl font-semibold">Let's work through it</h2>
                </div>
                {result.topic && <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-medium text-gold">{result.topic}</span>}
              </div>
            </div>

            <div className="space-y-7 p-6">
              <div>
                <h3 className="font-display text-xl font-semibold">Answer</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate">{result.answer}</p>
              </div>

              {Array.isArray(result.steps) && result.steps.length > 0 && (
                <div>
                  <h3 className="font-display text-xl font-semibold">Step by step</h3>
                  <ol className="mt-3 space-y-3">
                    {result.steps.map((step, index) => (
                      <li key={`${index}-${step}`} className="flex gap-3 text-sm leading-6 text-slate">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink text-xs font-bold text-paper">{index + 1}</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {result.misconception && (
                <div className="rounded-2xl bg-rust/5 p-5">
                  <p className="eyebrow !text-rust">Watch out</p>
                  <p className="mt-2 text-sm leading-6 text-slate">{result.misconception}</p>
                </div>
              )}

              {result.practiceQuestion && (
                <div className="rounded-2xl bg-gold/10 p-5">
                  <p className="eyebrow !text-gold">Try this next</p>
                  <p className="mt-2 text-sm font-medium leading-6 text-ink">{result.practiceQuestion}</p>
                  {result.hint && <p className="mt-2 text-xs leading-5 text-slate"><strong>Hint:</strong> {result.hint}</p>}
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
