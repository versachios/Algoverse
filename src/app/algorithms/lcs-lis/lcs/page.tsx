import type { Metadata } from "next";
import { catalogue } from "@/algorithms/catalogue";
import { lcs } from "@/algorithms/lcs";
import { LessonGroupShell } from "@/components/LessonGroupShell";
import { AlgorithmWorkbench } from "@/components/AlgorithmWorkbench";
import TheoryContent from "@/content/theory/lcs.mdx";

const entry = catalogue.find((c) => c.slug === "lcs-lis")!;

export const metadata: Metadata = {
  title: "LCS — Lý thuyết & Mô phỏng trực quan | Algoverse",
  description:
    "Học bài toán dãy con chung dài nhất (LCS) qua lý thuyết, ví dụ chạy tay và mô phỏng 3D bảng dp[i][j] từng ô.",
};

export default function LcsPage() {
  return (
    <LessonGroupShell
      group={entry.group}
      title={entry.name}
      summary={entry.name}
      basePath="/algorithms/lcs-lis"
      subLessons={entry.subLessons ?? []}
      activeSlug={lcs.meta.slug}
      theory={null}
      active={{
        meta: lcs.meta,
        theory: (
          <div className="max-w-3xl">
            <TheoryContent />
          </div>
        ),
        simulation: <AlgorithmWorkbench slug={lcs.meta.slug} />,
      }}
    />
  );
}
