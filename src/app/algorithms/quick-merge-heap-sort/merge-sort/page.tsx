import type { Metadata } from "next";
import { catalogue } from "@/algorithms/catalogue";
import { mergeSort } from "@/algorithms/merge-sort";
import { LessonGroupShell } from "@/components/LessonGroupShell";
import { AlgorithmWorkbench } from "@/components/AlgorithmWorkbench";
import TheoryContent from "@/content/theory/merge-sort.mdx";

const entry = catalogue.find((c) => c.slug === "quick-merge-heap-sort")!;

export const metadata: Metadata = {
  title: "Merge Sort — Lý thuyết & Mô phỏng trực quan | Algoverse",
  description:
    "Học Merge Sort qua lý thuyết, ví dụ chạy tay và mô phỏng 3D từng bước: chia đôi đệ quy rồi trộn (merge) các đoạn đã sắp xếp.",
};

export default function MergeSortPage() {
  return (
    <LessonGroupShell
      group={entry.group}
      title={entry.name}
      summary={entry.name}
      basePath="/algorithms/quick-merge-heap-sort"
      subLessons={entry.subLessons ?? []}
      activeSlug={mergeSort.meta.slug}
      theory={null}
      active={{
        meta: mergeSort.meta,
        theory: (
          <div className="max-w-3xl">
            <TheoryContent />
          </div>
        ),
        simulation: <AlgorithmWorkbench slug={mergeSort.meta.slug} />,
      }}
    />
  );
}
