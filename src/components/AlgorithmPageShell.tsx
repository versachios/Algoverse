import type { ReactNode } from "react";
import type { AlgorithmMeta } from "@/algorithms/types";
import { groupLabel } from "@/algorithms/catalogue";
import { Footer } from "@/components/Footer";
import { BackButton, TheorySimTabs } from "@/components/LessonChrome";

export function AlgorithmPageShell({
  meta,
  theory,
  simulation,
}: {
  meta: AlgorithmMeta;
  theory: ReactNode;
  simulation: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6 py-8 flex flex-col gap-6">
      <BackButton />
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-[var(--color-muted)] font-mono-tech">
          <span>{groupLabel(meta.group)}</span>
          <span>·</span>
          <span>{meta.level}</span>
          <span>·</span>
          <span className="text-[var(--color-signal-amber)]">render: {meta.renderMode}</span>
        </div>
        <h1 className="font-display font-semibold text-3xl md:text-4xl tracking-tight">{meta.name}</h1>
        <p className="text-[var(--color-muted)] max-w-2xl">{meta.summary}</p>
      </header>

      <TheorySimTabs theory={theory} simulation={simulation} />
      <Footer />
    </div>
  );
}
