import type { Metadata } from "next";
import { catalogue } from "@/algorithms/catalogue";
import { bubbleSort } from "@/algorithms/bubble-sort";
import { LessonGroupShell } from "@/components/LessonGroupShell";
import { AlgorithmWorkbench } from "@/components/AlgorithmWorkbench";
import TheoryContent from "@/content/theory/bubble-sort.mdx";

const entry = catalogue.find((c) => c.slug === "sorting")!;

export const metadata: Metadata = {
  title: "Bubble Sort — Lý thuyết & Mô phỏng trực quan | Algoverse",
  description:
    "Học Bubble Sort qua lý thuyết, ví dụ chạy tay và mô phỏng 3D từng bước: so sánh, đổi chỗ, độ phức tạp O(n²).",
};

export default function BubbleSortPage() {
  return (
    <LessonGroupShell
      group={entry.group}
      title={entry.name}
      summary={entry.name}
      basePath="/algorithms/sorting"
      subLessons={entry.subLessons ?? []}
      activeSlug={bubbleSort.meta.slug}
      theory={null}
      active={{
        meta: bubbleSort.meta,
        theory: (
          <div className="max-w-3xl">
            <TheoryContent />
          </div>
        ),
        simulation: <AlgorithmWorkbench slug={bubbleSort.meta.slug} />,
      }}
    />
  );
}
