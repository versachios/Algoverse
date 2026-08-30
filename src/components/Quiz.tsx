"use client";

import { useState } from "react";
import clsx from "clsx";

export function Quiz({
  question,
  options,
  answer,
  correctNote,
  incorrectNote,
}: {
  question: string;
  options: string[];
  answer: number;
  correctNote?: string;
  incorrectNote?: string;
}) {
  const [picked, setPicked] = useState<number | null>(null);

  return (
    <div className="blueprint-frame rounded-md p-4 not-prose mt-4">
      <p className="text-[11px] uppercase tracking-widest text-[var(--color-signal-amber)] font-mono-tech mb-2">
        Kiểm tra nhanh
      </p>
      <p className="text-sm mb-3">{question}</p>
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt, i) => {
          const isPicked = picked === i;
          const isCorrect = i === answer;
          return (
            <button
              key={opt}
              onClick={() => setPicked(i)}
              className={clsx(
                "control-btn text-left",
                isPicked && isCorrect && "!border-[var(--color-signal-amber)] !text-[var(--color-signal-amber)]",
                isPicked && !isCorrect && "!border-[var(--color-signal-rose)] !text-[var(--color-signal-rose)]"
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <p className="text-xs mt-3 text-[var(--color-muted)]">
          {picked === answer
            ? correctNote ?? "Chính xác!"
            : incorrectNote ?? "Chưa đúng, thử lại nhé."}
        </p>
      )}
    </div>
  );
}
