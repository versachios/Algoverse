import type { Metadata } from "next";
import { knapsack } from "@/algorithms/knapsack";
import { AlgorithmPageShell } from "@/components/AlgorithmPageShell";
import { AlgorithmWorkbench } from "@/components/AlgorithmWorkbench";
import TheoryContent from "@/content/theory/knapsack.mdx";

export const metadata: Metadata = {
  title: "0/1 Knapsack — Lý thuyết & Mô phỏng trực quan | Algoverse",
  description:
    "Học quy hoạch động qua bài toán cái túi 0/1: lý thuyết, ví dụ chạy tay và mô phỏng 3D bảng dp[i][w] từng ô.",
};

export default function KnapsackPage() {
  return (
    <AlgorithmPageShell
      meta={knapsack.meta}
      theory={
        <div className="max-w-3xl">
          <TheoryContent />
        </div>
      }
      simulation={<AlgorithmWorkbench slug={knapsack.meta.slug} />}
    />
  );
}
