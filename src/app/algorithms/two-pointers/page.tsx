import type { Metadata } from "next";
import { twoPointers } from "@/algorithms/two-pointers";
import { AlgorithmPageShell } from "@/components/AlgorithmPageShell";
import { AlgorithmWorkbench } from "@/components/AlgorithmWorkbench";
import TheoryContent from "@/content/theory/two-pointers.mdx";

export const metadata: Metadata = {
  title: "Two Pointers — Tìm cặp tổng | Algoverse",
  description:
    "Học kỹ thuật Two Pointers: tìm cặp phần tử có tổng X trên mảng đã sắp xếp trong O(n).",
};

export default function TwoPointersPage() {
  return (
    <AlgorithmPageShell
      meta={twoPointers.meta}
      theory={
        <div className="max-w-3xl">
          <TheoryContent />
        </div>
      }
      simulation={<AlgorithmWorkbench slug={twoPointers.meta.slug} />}
    />
  );
}
