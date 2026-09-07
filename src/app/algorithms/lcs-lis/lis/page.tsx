import type { Metadata } from "next";
import { catalogue } from "@/algorithms/catalogue";
import { lis } from "@/algorithms/lis";
import { LessonGroupShell } from "@/components/LessonGroupShell";
import { AlgorithmWorkbench } from "@/components/AlgorithmWorkbench";
import TheoryContent from "@/content/theory/lis.mdx";

const entry = catalogue.find((c) => c.slug === "lcs-lis")!;

export const metadata: Metadata = {
  title: "LIS — Lý thuyết & Mô phỏng trực quan | Algoverse",
  description:
    "Học bài toán dãy con tăng dài nhất (LIS) qua lý thuyết, ví dụ chạy tay và mô phỏng 3D bảng dp[i] từng bước.",
};

export default function LisPage() {
  return (
    <LessonGroupShell
      group={entry.group}
      title={entry.name}
      summary={entry.name}
      basePath="/algorithms/lcs-lis"
      subLessons={entry.subLessons ?? []}
      activeSlug={lis.meta.slug}
      theory={null}
      active={{
        meta: lis.meta,
        theory: (
          <div className="max-w-3xl">
            <TheoryContent />
          </div>
        ),
        simulation: <AlgorithmWorkbench slug={lis.meta.slug} />,
      }}
    />
  );
}
