import type { Metadata } from "next";
import { catalogue } from "@/algorithms/catalogue";
import { quickSort } from "@/algorithms/quick-sort";
import { LessonGroupShell } from "@/components/LessonGroupShell";
import { AlgorithmWorkbench } from "@/components/AlgorithmWorkbench";
import TheoryContent from "@/content/theory/quick-sort.mdx";

const entry = catalogue.find((c) => c.slug === "quick-merge-heap-sort")!;

export const metadata: Metadata = {
  title: "Quick Sort — Lý thuyết & Mô phỏng trực quan | Algoverse",
  description:
    "Học Quick Sort qua lý thuyết, ví dụ chạy tay và mô phỏng 3D từng bước: phân hoạch (partition) quanh pivot, đệ quy chia để trị.",
};

export default function QuickSortPage() {
  return (
    <LessonGroupShell
      group={entry.group}
      title={entry.name}
      summary={entry.name}
      basePath="/algorithms/quick-merge-heap-sort"
      subLessons={entry.subLessons ?? []}
      activeSlug={quickSort.meta.slug}
      theory={null}
      active={{
        meta: quickSort.meta,
        theory: (
          <div className="max-w-3xl">
            <TheoryContent />
          </div>
        ),
        simulation: <AlgorithmWorkbench slug={quickSort.meta.slug} />,
      }}
    />
  );
}
