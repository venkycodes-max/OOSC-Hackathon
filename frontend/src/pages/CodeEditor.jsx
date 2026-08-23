import React, { useMemo, useRef, useState } from "react";
import AppShell from "../components/AppShell.jsx";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";

const LANGUAGES = {
  javascript: {
    label: "JavaScript",
    short: "JS",
    apiLanguage: "javascript",
    version: "18.15.0",
    file: "main.js",
    starter: `function sum(a, b) {
  return a + b;
}

console.log("Trailhead says hello!");
console.log(sum(3, 4));`,
  },
  python: {
    label: "Python",
    short: "PY",
    apiLanguage: "python",
    version: "3.10.0",
    file: "main.py",
    starter: `def sum(a, b):
    return a + b

print("Trailhead says hello!")
print(sum(3, 4))`,
  },
  cpp: {
    label: "C++",
    short: "C++",
    apiLanguage: "c++",
    version: "10.2.0",
    file: "main.cpp",
    starter: `#include <iostream>
using namespace std;

int main() {
    cout << "Trailhead says hello!" << endl;
    cout << 3 + 4 << endl;
    return 0;
}`,
  },
  java: {
    label: "Java",
    short: "JAVA",
    apiLanguage: "java",
    version: "15.0.2",
    file: "Main.java",
    starter: `public class Main {
    public static void main(String[] args) {
        System.out.println("Trailhead says hello!");
        System.out.println(3 + 4);
    }
}`,
  },
};

export default function CodeEditor() {
  const { user } = useAuth();
  const studentClass = String(user?.studentClass || "");
  const canUseCodeEditor = /^Class\s+(8|9|10|11|12)$/i.test(studentClass) || (/^UG\s+Year\s+[1-4]$/i.test(studentClass) && user?.branch === "Computer Science");
  if (!canUseCodeEditor) return <Navigate to="/dashboard" replace />;

  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(LANGUAGES.javascript.starter);
  const [output, setOutput] = useState("Ready to run.");
  const [running, setRunning] = useState(false);
  const frameRef = useRef(null);
  const selected = LANGUAGES[language];
  const lines = useMemo(() => code.split("\n").length, [code]);

  function changeLanguage(next) {
    setLanguage(next);
    setCode(LANGUAGES[next].starter);
    setOutput("Ready to run.");
  }

  function runJavaScript() {
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

  async function runRemote() {
    setRunning(true);
    setOutput("Compiling and running...");
    try {
      const response = await api.post("/code/run", {
        language,
        code,
      });
      setOutput(response.data?.output || "Program finished with no output.");
    } catch (error) {
      const message = error.response?.data?.error || error.message || "Code runner is unavailable.";
      setOutput(`Unable to run ${selected.label} right now. ${message}`);
    } finally {
      setRunning(false);
    }
  }

  function runCode() {
    if (language === "javascript") runJavaScript();
    else runRemote();
  }

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1680px] px-5 py-6 sm:px-6 lg:py-8">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="eyebrow"><span className="h-2 w-2 rounded-full bg-gold" /> Coding practice workspace</div>
            <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Code Editor</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate">Practice programming in JavaScript, Python, C++ and Java directly from Trailhead.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {Object.entries(LANGUAGES).map(([key, item]) => (
              <button
                key={key}
                type="button"
                onClick={() => changeLanguage(key)}
                className={`rounded-xl px-3 py-2 text-xs font-bold transition ${language === key ? "bg-gradient-to-r from-violet-600 to-sky-500 text-white shadow-md shadow-violet-500/20" : "bg-soft text-slate hover:text-ink"}`}
              >
                {item.label}
              </button>
            ))}
            <span className="rounded-xl bg-soft px-3 py-2 text-xs font-semibold text-slate">{lines} lines</span>
          </div>
        </div>

        <section className="overflow-hidden rounded-[28px] border border-ink/10 bg-surface shadow-2xl shadow-slate-950/10">
          <div className="flex flex-col gap-3 border-b border-ink/10 bg-soft px-4 py-3 text-ink sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-400" /><span className="h-3 w-3 rounded-full bg-amber-400" /><span className="h-3 w-3 rounded-full bg-emerald-400" />
              <span className="ml-2 text-xs font-semibold text-slate">{selected.file}</span>
            </div>
            <button onClick={runCode} disabled={running} className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-400 disabled:opacity-60">
              {running ? "Running..." : "▶ Run"}
            </button>
          </div>

          <div className="grid min-h-[520px] lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,.75fr)]">
            <div className="relative flex min-h-[520px] bg-surface">
              <div className="w-12 shrink-0 select-none border-r border-ink/10 bg-soft px-3 py-4 text-right font-mono text-[12px] leading-6 text-slate">
                {Array.from({ length: Math.max(1, lines) }, (_, i) => <div key={i}>{i + 1}</div>)}
              </div>
              <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                spellCheck="false"
                className="min-h-[520px] flex-1 resize-none bg-surface px-4 py-4 font-mono text-[13px] leading-6 text-ink outline-none"
                aria-label={`${selected.label} code editor`}
              />
            </div>

            <div className="border-t border-ink/10 bg-soft text-ink lg:border-l lg:border-t-0">
              <div className="border-b border-ink/10 px-4 py-3 text-xs font-bold">Console Output</div>
              <pre className="min-h-[460px] whitespace-pre-wrap px-4 py-4 font-mono text-xs leading-6 text-emerald-500 dark:text-emerald-300">{output}</pre>
            </div>
          </div>
        </section>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            ["Practice", `Try small ${selected.label} programs and algorithms before your subject quiz.`],
            ["Safe practice", language === "javascript" ? "JavaScript runs inside a browser sandbox and is not sent to the backend." : `${selected.label} code is sent securely through Trailhead’s backend to the code runner only when you press Run.`],
            ["Next step", "Use Resources for deeper programming lessons and your Learning Trail for the next milestone."],
          ].map(([title, text]) => (
            <div key={title} className="surface-card p-4"><p className="text-sm font-bold">{title}</p><p className="mt-1 text-xs leading-5 text-slate">{text}</p></div>
          ))}
        </div>
        <iframe ref={frameRef} title="javascript code runner" sandbox="allow-scripts" className="hidden" />
      </div>
    </AppShell>
  );
}
