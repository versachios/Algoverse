import type { Metadata } from "next";
import { kadane } from "@/algorithms/kadane";
import { AlgorithmPageShell } from "@/components/AlgorithmPageShell";
import { AlgorithmWorkbench } from "@/components/AlgorithmWorkbench";
import TheoryContent from "@/content/theory/kadane.mdx";

export const metadata: Metadata = {
  title: "Kadane's Algorithm — Tổng dãy con liên tiếp lớn nhất | Algoverse",
  description:
    "Học thuật toán Kadane: tìm tổng dãy con liên tiếp lớn nhất trong O(n) bằng quy hoạch động.",
};

export default function KadanePage() {
  return (
    <AlgorithmPageShell
      meta={kadane.meta}
      theory={
        <div className="max-w-3xl">
          <TheoryContent />
        </div>
      }
      simulation={<AlgorithmWorkbench slug={kadane.meta.slug} />}
    />
  );
}
