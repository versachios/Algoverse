"use client";

import clsx from "clsx";

export function CodePanel({ code, activeLine }: { code: string; activeLine: number }) {
  const lines = code.split("\n");
  return (
    <div className="blueprint-frame rounded-md overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--color-hairline)] text-[11px] tracking-widest uppercase text-[var(--color-muted)] font-mono-tech">
        <span className="flex items-center gap-2">
          <span className="term-dots">
            <span style={{ background: "var(--color-signal-rose)" }} />
            <span style={{ background: "var(--color-signal-gold)" }} />
            <span style={{ background: "var(--color-signal-amber)" }} />
          </span>
          src.cpp
        </span>
        <span className="text-[var(--color-signal-amber)]">
          dòng {activeLine.toString().padStart(2, "0")}
        </span>
      </div>
      <pre className="text-[13px] leading-6 font-mono-tech overflow-x-auto py-2">
        {lines.map((line, idx) => {
          const n = idx + 1;
          const isActive = n === activeLine;
          return (
            <div
              key={n}
              className={clsx(
                "px-3 flex gap-3 border-l-2",
                isActive
                  ? "border-l-[var(--color-signal-amber)] bg-[var(--color-signal-amber-dim)]"
                  : "border-l-transparent"
              )}
            >
              <span className="select-none text-[var(--color-muted)] w-5 shrink-0 text-right">
                {n}
              </span>
              <span
                className={clsx(
                  isActive ? "text-[var(--color-text)]" : "text-[var(--color-muted)]"
                )}
              >
                {line || " "}
              </span>
            </div>
          );
        })}
      </pre>
    </div>
  );
}
