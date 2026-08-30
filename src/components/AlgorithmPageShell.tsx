"use client";

import { useState, type ReactNode } from "react";
import clsx from "clsx";
import type { AlgorithmMeta } from "@/algorithms/types";
import { Footer } from "@/components/Footer";

export function AlgorithmPageShell({
  meta,
  theory,
  simulation,
}: {
  meta: AlgorithmMeta;
  theory: ReactNode;
  simulation: ReactNode;
}) {
  const [tab, setTab] = useState<"theory" | "sim">("theory");

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6 py-8 flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-[var(--color-muted)] font-mono-tech">
          <span>{meta.group}</span>
          <span>·</span>
          <span>{meta.level}</span>
          <span>·</span>
          <span className="text-[var(--color-signal-amber)]">render: {meta.renderMode}</span>
        </div>
        <h1 className="font-display font-semibold text-3xl md:text-4xl tracking-tight">{meta.name}</h1>
        <p className="text-[var(--color-muted)] max-w-2xl">{meta.summary}</p>
      </header>

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
      <Footer />
    </div>
  );
}
