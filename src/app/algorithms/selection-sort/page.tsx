import type { Metadata } from "next";
import { selectionSort } from "@/algorithms/selection-sort";
import { AlgorithmPageShell } from "@/components/AlgorithmPageShell";
import { AlgorithmWorkbench } from "@/components/AlgorithmWorkbench";
import TheoryContent from "@/content/theory/selection-sort.mdx";

export const metadata: Metadata = {
  title: "Selection Sort — Lý thuyết & Mô phỏng trực quan | Algo3D",
  description:
    "Học Selection Sort qua lý thuyết, so sánh với Bubble Sort và mô phỏng 3D từng bước tìm phần tử nhỏ nhất.",
};

export default function SelectionSortPage() {
  return (
    <AlgorithmPageShell
      meta={selectionSort.meta}
      theory={
        <div className="max-w-3xl">
          <TheoryContent />
        </div>
      }
      simulation={<AlgorithmWorkbench slug={selectionSort.meta.slug} />}
    />
  );
}
