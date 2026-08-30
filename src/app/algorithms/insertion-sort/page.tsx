import type { Metadata } from "next";
import { insertionSort } from "@/algorithms/insertion-sort";
import { AlgorithmPageShell } from "@/components/AlgorithmPageShell";
import { AlgorithmWorkbench } from "@/components/AlgorithmWorkbench";
import TheoryContent from "@/content/theory/insertion-sort.mdx";

export const metadata: Metadata = {
  title: "Insertion Sort — Lý thuyết & Mô phỏng trực quan | Algo3D",
  description:
    "Học Insertion Sort qua lý thuyết, ví dụ chạy tay và mô phỏng 3D quá trình chèn từng phần tử vào vùng đã sắp xếp.",
};

export default function InsertionSortPage() {
  return (
    <AlgorithmPageShell
      meta={insertionSort.meta}
      theory={
        <div className="max-w-3xl">
          <TheoryContent />
        </div>
      }
      simulation={<AlgorithmWorkbench slug={insertionSort.meta.slug} />}
    />
  );
}
