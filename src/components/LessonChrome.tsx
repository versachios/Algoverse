"use client";

import { useState, type ReactNode } from "react";
import clsx from "clsx";
import Link from "next/link";

export function BackButton({ href = "/" }: { href?: string }) {
  return (
    <div className="flex justify-start">
      <Link
        href={href}
        aria-label="Quay lại trang chủ"
        className="control-btn !p2 flex items-center gap-1.5 text-xs"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
      </Link>
    </div>
  );
}

/** Theory/simulation tab switcher — used both by standalone lesson pages
 *  (AlgorithmPageShell) and by each sub-lesson inside a Master-Detail
 *  lesson group (LessonGroupShell). */
export function TheorySimTabs({ theory, simulation }: { theory: ReactNode; simulation: ReactNode }) {
  const [tab, setTab] = useState<"theory" | "sim">("theory");

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex gap-1 border-b border-[var(--color-hairline)]">
        {(
          [
            ["theory", "Lý thuyết & Ví dụ"],
            ["sim", "Mô phỏng trực quan"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={clsx(
              "px-4 py-2 text-sm font-mono-tech border-b-2 -mb-px transition-colors",
              tab === key
                ? "border-[var(--color-signal-amber)] text-[var(--color-signal-amber)]"
                : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-text)]"
            )}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className={clsx(tab === "theory" ? "block" : "hidden")}>{theory}</div>
      <div className={clsx(tab === "sim" ? "block" : "hidden")}>{simulation}</div>
    </div>
  );
}
