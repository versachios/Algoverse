import type { Metadata } from "next";
import { minHeap } from "@/algorithms/min-heap";
import { AlgorithmPageShell } from "@/components/AlgorithmPageShell";
import { AlgorithmWorkbench } from "@/components/AlgorithmWorkbench";
import TheoryContent from "@/content/theory/min-heap.mdx";

export const metadata: Metadata = {
  title: "Min-Heap — Lý thuyết & Mô phỏng trực quan | Algoverse",
  description:
    "Học Min-Heap qua lý thuyết, ví dụ chạy tay và mô phỏng 3D thao tác sift-up khi chèn giá trị mới.",
};

export default function MinHeapPage() {
  return (
    <AlgorithmPageShell
      meta={minHeap.meta}
      theory={
        <div className="max-w-3xl">
          <TheoryContent />
        </div>
      }
      simulation={<AlgorithmWorkbench slug={minHeap.meta.slug} />}
    />
  );
}
