import type { Metadata } from "next";
import { catalogue } from "@/algorithms/catalogue";
import { insertionSort } from "@/algorithms/insertion-sort";
import { LessonGroupShell } from "@/components/LessonGroupShell";
import { AlgorithmWorkbench } from "@/components/AlgorithmWorkbench";
import TheoryContent from "@/content/theory/insertion-sort.mdx";

const entry = catalogue.find((c) => c.slug === "sorting")!;

export const metadata: Metadata = {
  title: "Insertion Sort — Lý thuyết & Mô phỏng trực quan | Algoverse",
  description:
    "Học Insertion Sort qua lý thuyết, ví dụ chạy tay và mô phỏng 3D quá trình chèn từng phần tử vào vùng đã sắp xếp.",
};

export default function InsertionSortPage() {
  return (
    <LessonGroupShell
      group={entry.group}
      title={entry.name}
      summary={entry.name}
      basePath="/algorithms/sorting"
      subLessons={entry.subLessons ?? []}
      activeSlug={insertionSort.meta.slug}
      theory={null}
      active={{
        meta: insertionSort.meta,
        theory: (
          <div className="max-w-3xl">
            <TheoryContent />
          </div>
        ),
        simulation: <AlgorithmWorkbench slug={insertionSort.meta.slug} />,
      }}
    />
  );
}
