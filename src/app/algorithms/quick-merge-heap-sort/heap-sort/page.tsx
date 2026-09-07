import type { Metadata } from "next";
import { catalogue } from "@/algorithms/catalogue";
import { heapSort } from "@/algorithms/heap-sort";
import { LessonGroupShell } from "@/components/LessonGroupShell";
import { AlgorithmWorkbench } from "@/components/AlgorithmWorkbench";
import TheoryContent from "@/content/theory/heap-sort.mdx";

const entry = catalogue.find((c) => c.slug === "quick-merge-heap-sort")!;

export const metadata: Metadata = {
  title: "Heap Sort — Lý thuyết & Mô phỏng trực quan | Algoverse",
  description:
    "Học Heap Sort qua lý thuyết, ví dụ chạy tay và mô phỏng 3D từng bước: xây max-heap và sift-down trên chính mảng.",
};

export default function HeapSortPage() {
  return (
    <LessonGroupShell
      group={entry.group}
      title={entry.name}
      summary={entry.name}
      basePath="/algorithms/quick-merge-heap-sort"
      subLessons={entry.subLessons ?? []}
      activeSlug={heapSort.meta.slug}
      theory={null}
      active={{
        meta: heapSort.meta,
        theory: (
          <div className="max-w-3xl">
            <TheoryContent />
          </div>
        ),
        simulation: <AlgorithmWorkbench slug={heapSort.meta.slug} />,
      }}
    />
  );
}
