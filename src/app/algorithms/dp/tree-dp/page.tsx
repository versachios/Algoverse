import type { Metadata } from "next";
import { catalogue } from "@/algorithms/catalogue";
import { treeDp } from "@/algorithms/tree-dp";
import { LessonGroupShell } from "@/components/LessonGroupShell";
import { AlgorithmWorkbench } from "@/components/AlgorithmWorkbench";
import TheoryContent from "@/content/theory/tree-dp.mdx";

const entry = catalogue.find((c) => c.slug === "dp")!;

export const metadata: Metadata = {
  title: "DP trên cây — Lý thuyết & Mô phỏng trực quan | Algoverse",
  description:
    "Học quy hoạch động trên cây qua bài Tập độc lập trọng số lớn nhất (Maximum Weight Independent Set): lý thuyết, độ phức tạp và mô phỏng 3D theo thứ tự hậu duyệt.",
};

export default function TreeDpPage() {
  return (
    <LessonGroupShell
      group={entry.group}
      title={entry.name}
      summary={entry.name}
      basePath="/algorithms/dp"
      subLessons={entry.subLessons ?? []}
      activeSlug={treeDp.meta.slug}
      theory={null}
      active={{
        meta: treeDp.meta,
        theory: (
          <div className="max-w-3xl">
            <TheoryContent />
          </div>
        ),
        simulation: <AlgorithmWorkbench slug={treeDp.meta.slug} />,
      }}
    />
  );
}
