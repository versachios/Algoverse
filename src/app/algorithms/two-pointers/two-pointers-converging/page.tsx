import type { Metadata } from "next";
import { catalogue } from "@/algorithms/catalogue";
import { twoPointersConverging } from "@/algorithms/two-pointers-converging";
import { LessonGroupShell } from "@/components/LessonGroupShell";
import { AlgorithmWorkbench } from "@/components/AlgorithmWorkbench";
import TheoryContent from "@/content/theory/two-pointers-converging.mdx";

const entry = catalogue.find((c) => c.slug === "two-pointers")!;

export const metadata: Metadata = {
  title: "Two Pointers — 1 mảng, ngược chiều | Algoverse",
  description:
    "Hai con trỏ ở hai đầu một mảng đã sắp xếp, tiến vào nhau: tìm cặp có tổng bằng X trong O(n).",
};

export default function TwoPointersConvergingPage() {
  return (
    <LessonGroupShell
      group={entry.group}
      title={entry.name}
      summary={entry.name}
      basePath="/algorithms/two-pointers"
      subLessons={entry.subLessons ?? []}
      activeSlug={twoPointersConverging.meta.slug}
      theory={null}
      active={{
        meta: twoPointersConverging.meta,
        theory: (
          <div className="max-w-3xl">
            <TheoryContent />
          </div>
        ),
        simulation: <AlgorithmWorkbench slug={twoPointersConverging.meta.slug} />,
      }}
    />
  );
}
