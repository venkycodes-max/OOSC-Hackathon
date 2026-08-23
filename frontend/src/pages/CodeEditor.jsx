import React, { useMemo, useRef, useState } from "react";
import AppShell from "../components/AppShell.jsx";

const starter = `function sum(a, b) {
  return a + b;
}

console.log("Trailhead says hello!");
console.log(sum(3, 4));`;

export default function CodeEditor() {
  const [code, setCode] = useState(starter);
  const [output, setOutput] = useState("Ready to run.");
  const [running, setRunning] = useState(false);
  const frameRef = useRef(null);

  const lines = useMemo(() => code.split("\n").length, [code]);

  function runCode() {
    setRunning(true);
    setOutput("Running...");
    const frame = frameRef.current;
    const handler = (event) => {
      if (event.source !== frame?.contentWindow) return;
      if (event.data?.type === "trailhead-console") {
        setOutput(event.data.lines.join("\n") || "Code finished with no console output.");
        window.removeEventListener("message", handler);
        setRunning(false);
      }
    };
    window.addEventListener("message", handler);
    const safeCode = code.replace(/<\/script/gi, "<\\/script");
    frame.srcdoc = `<!doctype html><html><body><script>
      const lines = [];
      const old = console.log;
      console.log = (...args) => {
        lines.push(args.map(v => typeof v === "object" ? JSON.stringify(v) : String(v)).join(" "));
        old(...args);
      };
      try { ${safeCode} }
      catch (e) { lines.push("Error: " + e.message); }
      parent.postMessage({type:"trailhead-console", lines}, "*");
    <\/script></body></html>`;
  }

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1680px] px-5 py-6 sm:px-6 lg:py-8">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="eyebrow"><span className="h-2 w-2 rounded-full bg-gold" /> CS practice workspace</div>
            <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Code Editor</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate">Write, test and experiment with JavaScript directly in your browser.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-xl bg-gold/10 px-3 py-2 text-xs font-bold text-gold">JavaScript</span>
            <span className="rounded-xl bg-soft px-3 py-2 text-xs font-semibold text-slate">{lines} lines</span>
          </div>
        </div>

        <section className="overflow-hidden rounded-[28px] border border-ink/10 bg-surface shadow-2xl shadow-slate-950/10">
          <div className="flex items-center justify-between border-b border-ink/10 bg-soft px-4 py-3 text-ink">
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-rose-400" /><span className="h-3 w-3 rounded-full bg-amber-400" /><span className="h-3 w-3 rounded-full bg-emerald-400" /><span className="ml-3 text-xs font-semibold text-slate">main.js</span></div>
            <button onClick={runCode} disabled={running} className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-400 disabled:opacity-60">
              {running ? "Running..." : "▶ Run"}
            </button>
          </div>

          <div className="grid min-h-[520px] lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,.75fr)]">
            <div className="relative flex min-h-[520px] bg-surface">
              <div className="w-12 shrink-0 select-none border-r border-ink/10 bg-soft px-3 py-4 text-right font-mono text-[12px] leading-6 text-slate">
                {Array.from({length: Math.max(1, lines)}, (_, i) => <div key={i}>{i + 1}</div>)}
              </div>
              <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                spellCheck="false"
                className="min-h-[520px] flex-1 resize-none bg-surface px-4 py-4 font-mono text-[13px] leading-6 text-ink outline-none"
                aria-label="Code editor"
              />
            </div>

            <div className="border-t border-ink/10 bg-soft text-ink lg:border-l lg:border-t-0">
              <div className="border-b border-ink/10 px-4 py-3 text-xs font-bold">Console Output</div>
              <pre className="min-h-[460px] whitespace-pre-wrap px-4 py-4 font-mono text-xs leading-6 text-emerald-300">{output}</pre>
            </div>
          </div>
        </section>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            ["Practice", "Try small functions and algorithms before your subject quiz."],
            ["Safe sandbox", "Your code runs in an isolated browser frame; nothing is sent to the backend."],
            ["Next step", "Use the Resources section for deeper programming lessons."],
          ].map(([title, text]) => (
            <div key={title} className="surface-card p-4"><p className="text-sm font-bold">{title}</p><p className="mt-1 text-xs leading-5 text-slate">{text}</p></div>
          ))}
        </div>
        <iframe ref={frameRef} title="code runner" sandbox="allow-scripts" className="hidden" />
      </div>
    </AppShell>
  );
}
