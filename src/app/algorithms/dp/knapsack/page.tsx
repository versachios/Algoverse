import type { Metadata } from "next";
import { catalogue } from "@/algorithms/catalogue";
import { knapsack } from "@/algorithms/knapsack";
import { LessonGroupShell } from "@/components/LessonGroupShell";
import { AlgorithmWorkbench } from "@/components/AlgorithmWorkbench";
import TheoryContent from "@/content/theory/knapsack.mdx";

const entry = catalogue.find((c) => c.slug === "dp")!;

export const metadata: Metadata = {
  title: "0/1 Knapsack — Lý thuyết & Mô phỏng trực quan | Algoverse",
  description:
    "Học quy hoạch động qua bài toán cái túi 0/1: lý thuyết, ví dụ chạy tay và mô phỏng 3D bảng dp[i][w] từng ô.",
};

export default function KnapsackPage() {
  return (
    <LessonGroupShell
      group={entry.group}
      title={entry.name}
      summary={entry.name}
      basePath="/algorithms/dp"
      subLessons={entry.subLessons ?? []}
      activeSlug={knapsack.meta.slug}
      theory={null}
      active={{
        meta: knapsack.meta,
        theory: (
          <div className="max-w-3xl">
            <TheoryContent />
          </div>
        ),
        simulation: <AlgorithmWorkbench slug={knapsack.meta.slug} />,
      }}
    />
  );
}
