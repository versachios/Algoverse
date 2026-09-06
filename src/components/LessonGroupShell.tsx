import type { ReactNode } from "react";
import Link from "next/link";
import clsx from "clsx";
import type { AlgorithmMeta } from "@/algorithms/types";
import type { SubLesson } from "@/algorithms/catalogue";
import { groupLabel } from "@/algorithms/catalogue";
import { Footer } from "@/components/Footer";
import { BackButton, TheorySimTabs } from "@/components/LessonChrome";

/** Master-Detail shell for a lesson group: visiting the group's own route
 *  (activeSlug = null) shows the general theory in the main area; visiting
 *  `${basePath}/${sub.slug}` (activeSlug = sub.slug) swaps the main area for
 *  that sub-lesson's own theory/sim tabs. The sidebar (list of sub-lessons)
 *  stays visible and highlights whichever sub-lesson is active. */
export function LessonGroupShell({
  group,
  title,
  summary,
  basePath,
  subLessons,
  activeSlug,
  theory,
  active,
}: {
  group: string;
  title: string;
  summary: string;
  basePath: string;
  subLessons: SubLesson[];
  activeSlug: string | null;
  /** General group theory — shown when no sub-lesson is selected. */
  theory: ReactNode;
  /** The active sub-lesson's own content — required when activeSlug is set. */
  active?: { meta: AlgorithmMeta; theory: ReactNode; simulation: ReactNode };
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6 py-8 flex flex-col gap-6">
      <BackButton />
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-[var(--color-muted)] font-mono-tech">
          <span>{groupLabel(group)}</span>
          {active && (
            <>
              <span>·</span>
              <span>{active.meta.level}</span>
              <span>·</span>
              <span className="text-[var(--color-signal-amber)]">render: {active.meta.renderMode}</span>
            </>
          )}
        </div>
        <h1 className="font-display font-semibold text-3xl md:text-4xl tracking-tight">
          {title}
          {active && (
            <span className="text-[var(--color-muted)]"> — {active.meta.name}</span>
          )}
        </h1>
        <p className="text-[var(--color-muted)] max-w-2xl">{active ? active.meta.summary : summary}</p>
      </header>

      <div className="grid lg:grid-cols-[1fr_240px] gap-4 items-start">
        <div>
          {active ? (
            <TheorySimTabs theory={active.theory} simulation={active.simulation} />
          ) : (
            theory
          )}
        </div>

        <aside className="flex flex-col gap-2">
          <div className="text-[11px] uppercase tracking-widest text-[var(--color-muted)] font-mono-tech px-1">
            Các dạng con
          </div>
          {subLessons.map((sl) => {
            const isActive = sl.slug === activeSlug;
            const content = (
              <div
                className={clsx(
                  "blueprint-frame rounded-md px-3 py-2.5 text-sm transition-colors",
                  sl.ready ? "cursor-pointer hover:border-[var(--color-signal-amber)]" : "opacity-50",
                  isActive && "!border-[var(--color-signal-amber)] text-[var(--color-signal-amber)]"
                )}
              >
                {sl.name}
                {!sl.ready && (
                  <span className="block text-[10px] text-[var(--color-muted)] font-mono-tech uppercase tracking-widest mt-0.5">
                    sắp ra mắt
                  </span>
                )}
              </div>
            );
            return sl.ready ? (
              <Link key={sl.slug} href={`${basePath}/${sl.slug}`}>
                {content}
              </Link>
            ) : (
              <div key={sl.slug}>{content}</div>
            );
          })}
        </aside>
      </div>

      <Footer />
    </div>
  );
}
