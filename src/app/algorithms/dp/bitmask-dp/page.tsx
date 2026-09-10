import type { Metadata } from "next";
import { catalogue } from "@/algorithms/catalogue";
import { bitmaskDp } from "@/algorithms/bitmask-dp";
import { LessonGroupShell } from "@/components/LessonGroupShell";
import { AlgorithmWorkbench } from "@/components/AlgorithmWorkbench";
import TheoryContent from "@/content/theory/bitmask-dp.mdx";

const entry = catalogue.find((c) => c.slug === "dp")!;

export const metadata: Metadata = {
  title: "Bitmask DP — Lý thuyết & Mô phỏng trực quan | Algoverse",
  description:
    "Học quy hoạch động trên bitmask qua Bài toán phân công (Assignment Problem): lý thuyết, độ phức tạp và mô phỏng 3D bảng dp[i][mask].",
};

export default function BitmaskDpPage() {
  return (
    <LessonGroupShell
      group={entry.group}
      title={entry.name}
      summary={entry.name}
      basePath="/algorithms/dp"
      subLessons={entry.subLessons ?? []}
      activeSlug={bitmaskDp.meta.slug}
      theory={null}
      active={{
        meta: bitmaskDp.meta,
        theory: (
          <div className="max-w-3xl">
            <TheoryContent />
          </div>
        ),
        simulation: <AlgorithmWorkbench slug={bitmaskDp.meta.slug} />,
      }}
    />
  );
}
