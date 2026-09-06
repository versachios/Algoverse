import type { Metadata } from "next";
import { catalogue } from "@/algorithms/catalogue";
import { twoPointersSameDirection } from "@/algorithms/two-pointers-same-direction";
import { LessonGroupShell } from "@/components/LessonGroupShell";
import { AlgorithmWorkbench } from "@/components/AlgorithmWorkbench";
import TheoryContent from "@/content/theory/two-pointers-same-direction.mdx";

const entry = catalogue.find((c) => c.slug === "two-pointers")!;

export const metadata: Metadata = {
  title: "Two Pointers — 1 mảng, cùng chiều | Algoverse",
  description:
    "Hai con trỏ cùng hướng, khác vai trò (slow/fast) trên một mảng: xoá phần tử trùng trong O(n).",
};

export default function TwoPointersSameDirectionPage() {
  return (
    <LessonGroupShell
      group={entry.group}
      title={entry.name}
      summary={entry.name}
      basePath="/algorithms/two-pointers"
      subLessons={entry.subLessons ?? []}
      activeSlug={twoPointersSameDirection.meta.slug}
      theory={null}
      active={{
        meta: twoPointersSameDirection.meta,
        theory: (
          <div className="max-w-3xl">
            <TheoryContent />
          </div>
        ),
        simulation: <AlgorithmWorkbench slug={twoPointersSameDirection.meta.slug} />,
      }}
    />
  );
}
