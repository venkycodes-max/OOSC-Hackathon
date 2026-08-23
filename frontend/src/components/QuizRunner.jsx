import React, { useState } from "react";

const DIFFICULTY_LABEL = {
  easy: { label: "Easy", color: "bg-moss/15 text-moss" },
  medium: { label: "Medium", color: "bg-gold/15 text-gold" },
  hard: { label: "Hard", color: "bg-rust/15 text-rust" },
};

const OPTION_LABELS = ["A", "B", "C", "D"];

// questions: flat array of { subject?, question, topic, difficulty, options, correctAnswer }
// mixed=true is used only by the new-account overall diagnostic.
export default function QuizRunner({ questions, onComplete, busy, mixed = false }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);

  const current = questions[index];
  const isLast = index === questions.length - 1;
  const diff = DIFFICULTY_LABEL[current?.difficulty] || DIFFICULTY_LABEL.easy;

  function selectOption(opt) {
    setSelected(opt);
  }

  function handleNext() {
    const updatedAnswers = { ...answers, [index]: selected };
    setAnswers(updatedAnswers);

    if (isLast) {
      const finalized = questions.map((q, i) => ({
        ...q,
        studentAnswer: updatedAnswers[i] || "",
      }));
      onComplete(finalized);
    } else {
      setIndex((i) => i + 1);
      setSelected(updatedAnswers[index + 1] || null);
    }
  }

  if (!current) return null;

  return (
    <div className="bg-paper rounded-2xl p-6 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
        <span className="text-xs font-mono text-slate">
          Question {index + 1} of {questions.length}
        </span>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {mixed && current.subject && (
            <span className="text-xs font-mono px-2 py-1 rounded-full bg-ink/5 text-ink">
              {current.subject}
            </span>
          )}
          <span className={`text-xs font-mono px-2 py-1 rounded-full ${diff.color}`}>
            {diff.label}{current.challenge === "extreme" ? " · Extreme" : ""} · {current.topic}
          </span>
        </div>
      </div>

      <div className="w-full h-1.5 bg-slate/15 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-gold transition-all duration-300"
          style={{ width: `${((index + 1) / questions.length) * 100}%` }}
        />
      </div>

      <p className="text-ink font-display text-lg font-medium mb-6 leading-snug">
        {current.question}
      </p>

      <div className="space-y-2 mb-6">
        {current.options.map((opt, optionIndex) => (
          <button
            key={`${optionIndex}-${opt}`}
            onClick={() => selectOption(opt)}
            className={`w-full flex items-start gap-3 text-left px-4 py-3 rounded-lg border transition min-h-[48px] break-words whitespace-normal ${
              selected === opt
                ? "border-gold bg-gold/10 text-ink"
                : "border-slate/20 hover:border-slate/40 text-ink"
            }`}
          >
            <span className="shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink/5 text-xs font-mono text-slate">
              {OPTION_LABELS[optionIndex]}
            </span>
            <span className="min-w-0 flex-1 leading-5 break-words">{opt}</span>
          </button>
        ))}
      </div>

      <button
        onClick={handleNext}
        disabled={!selected || busy}
        className="w-full bg-ink text-paper dark:bg-paper dark:text-ink rounded-lg py-2.5 font-medium hover:bg-ink/90 transition disabled:opacity-40"
      >
        {busy ? "Submitting..." : isLast ? "Finish & see results" : "Next question"}
      </button>
    </div>
  );
}
