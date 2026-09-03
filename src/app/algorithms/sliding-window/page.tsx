import type { Metadata } from "next";
import { slidingWindow } from "@/algorithms/sliding-window";
import { AlgorithmPageShell } from "@/components/AlgorithmPageShell";
import { AlgorithmWorkbench } from "@/components/AlgorithmWorkbench";
import TheoryContent from "@/content/theory/sliding-window.mdx";

export const metadata: Metadata = {
  title: "Sliding Window — Cửa sổ trượt | Algoverse",
  description:
    "Học kỹ thuật Sliding Window: cửa sổ trượt cập nhật O(1) mỗi bước, tối ưu bài toán con liên tiếp.",
};

export default function SlidingWindowPage() {
  return (
    <AlgorithmPageShell
      meta={slidingWindow.meta}
      theory={
        <div className="max-w-3xl">
          <TheoryContent />
        </div>
      }
      simulation={<AlgorithmWorkbench slug={slidingWindow.meta.slug} />}
    />
  );
}
