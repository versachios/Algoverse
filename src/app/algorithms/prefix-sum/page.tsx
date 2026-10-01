import type { Metadata } from "next";
import { prefixSum } from "@/algorithms/prefix-sum";
import { AlgorithmPageShell } from "@/components/AlgorithmPageShell";
import { AlgorithmWorkbench } from "@/components/AlgorithmWorkbench";
import TheoryContent from "@/content/theory/prefix-sum.mdx";

export const metadata: Metadata = {
  title: "Prefix Sum — Tổng tiền tố | Algoverse",
  description:
    "Học Prefix Sum và Difference Array: trả lời tổng đoạn trong O(1) sau khi tiền xử lý O(n).",
};

export default function PrefixSumPage() {
  return (
    <AlgorithmPageShell
      meta={prefixSum.meta}
      theory={
        <div className="max-w-3xl">
          <TheoryContent />
        </div>
      }
      simulation={<AlgorithmWorkbench slug={prefixSum.meta.slug} />}
    />
  );
}
