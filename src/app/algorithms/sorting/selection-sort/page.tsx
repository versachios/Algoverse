import type { Metadata } from "next";
import { catalogue } from "@/algorithms/catalogue";
import { selectionSort } from "@/algorithms/selection-sort";
import { LessonGroupShell } from "@/components/LessonGroupShell";
import { AlgorithmWorkbench } from "@/components/AlgorithmWorkbench";
import TheoryContent from "@/content/theory/selection-sort.mdx";

const entry = catalogue.find((c) => c.slug === "sorting")!;

export const metadata: Metadata = {
  title: "Selection Sort — Lý thuyết & Mô phỏng trực quan | Algoverse",
  description:
    "Học Selection Sort qua lý thuyết, so sánh với Bubble Sort và mô phỏng 3D từng bước tìm phần tử nhỏ nhất.",
};

export default function SelectionSortPage() {
  return (
    <LessonGroupShell
      group={entry.group}
      title={entry.name}
      summary={entry.name}
      basePath="/algorithms/sorting"
      subLessons={entry.subLessons ?? []}
      activeSlug={selectionSort.meta.slug}
      theory={null}
      active={{
        meta: selectionSort.meta,
        theory: (
          <div className="max-w-3xl">
            <TheoryContent />
          </div>
        ),
        simulation: <AlgorithmWorkbench slug={selectionSort.meta.slug} />,
      }}
    />
  );
}
