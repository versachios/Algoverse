import type { Metadata } from "next";
import { catalogue } from "@/algorithms/catalogue";
import { twoPointersTwoArrays } from "@/algorithms/two-pointers-two-arrays";
import { LessonGroupShell } from "@/components/LessonGroupShell";
import { AlgorithmWorkbench } from "@/components/AlgorithmWorkbench";
import TheoryContent from "@/content/theory/two-pointers-two-arrays.mdx";

const entry = catalogue.find((c) => c.slug === "two-pointers")!;

export const metadata: Metadata = {
  title: "Two Pointers — 2 mảng | Algoverse",
  description: "Hai con trỏ trên hai mảng khác nhau: trộn hai mảng đã sắp xếp trong O(n + m).",
};

export default function TwoPointersTwoArraysPage() {
  return (
    <LessonGroupShell
      group={entry.group}
      title={entry.name}
      summary={entry.name}
      basePath="/algorithms/two-pointers"
      subLessons={entry.subLessons ?? []}
      activeSlug={twoPointersTwoArrays.meta.slug}
      theory={null}
      active={{
        meta: twoPointersTwoArrays.meta,
        theory: (
          <div className="max-w-3xl">
            <TheoryContent />
          </div>
        ),
        simulation: <AlgorithmWorkbench slug={twoPointersTwoArrays.meta.slug} />,
      }}
    />
  );
}
