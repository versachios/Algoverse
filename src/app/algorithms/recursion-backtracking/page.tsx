import type { Metadata } from "next";
import { recursionBacktracking } from "@/algorithms/recursion-backtracking";
import { AlgorithmPageShell } from "@/components/AlgorithmPageShell";
import { AlgorithmWorkbench } from "@/components/AlgorithmWorkbench";
import TheoryContent from "@/content/theory/recursion-backtracking.mdx";

export const metadata: Metadata = {
  title: "Đệ quy & Quay lui (N-Queens) | Algoverse",
  description:
    "Học đệ quy quay lui qua bài N-Queens: thử, kiểm tra, đi sâu và rút lại khi bí đường.",
};

export default function RecursionBacktrackingPage() {
  return (
    <AlgorithmPageShell
      meta={recursionBacktracking.meta}
      theory={
        <div className="max-w-3xl">
          <TheoryContent />
        </div>
      }
      simulation={<AlgorithmWorkbench slug={recursionBacktracking.meta.slug} />}
    />
  );
}
