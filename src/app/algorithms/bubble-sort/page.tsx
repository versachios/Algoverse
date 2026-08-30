import type { Metadata } from "next";
import { bubbleSort } from "@/algorithms/bubble-sort";
import { AlgorithmPageShell } from "@/components/AlgorithmPageShell";
import { AlgorithmWorkbench } from "@/components/AlgorithmWorkbench";
import TheoryContent from "@/content/theory/bubble-sort.mdx";

export const metadata: Metadata = {
  title: "Bubble Sort — Lý thuyết & Mô phỏng trực quan | Algo3D",
  description:
    "Học Bubble Sort qua lý thuyết, ví dụ chạy tay và mô phỏng 3D từng bước: so sánh, đổi chỗ, độ phức tạp O(n²).",
};

export default function BubbleSortPage() {
  return (
    <AlgorithmPageShell
      meta={bubbleSort.meta}
      theory={
        <div className="max-w-3xl">
          <TheoryContent />
        </div>
      }
      simulation={<AlgorithmWorkbench slug={bubbleSort.meta.slug} />}
    />
  );
}
