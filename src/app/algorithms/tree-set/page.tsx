import type { Metadata } from "next";
import { treeSet } from "@/algorithms/tree-set";
import { AlgorithmPageShell } from "@/components/AlgorithmPageShell";
import { AlgorithmWorkbench } from "@/components/AlgorithmWorkbench";
import TheoryContent from "@/content/theory/tree-set.mdx";

export const metadata: Metadata = {
  title: "Tree Set (std::set) — Tập hợp cây đỏ-đen | Algoverse",
  description:
    "Học cấu trúc dữ liệu Tree Set (std::set): cây đỏ-đen lưu khóa duy nhất có thứ tự, thao tác O(log n).",
};

export default function TreeSetPage() {
  return (
    <AlgorithmPageShell
      meta={treeSet.meta}
      theory={
        <div className="max-w-3xl">
          <TheoryContent />
        </div>
      }
      simulation={<AlgorithmWorkbench slug={treeSet.meta.slug} />}
    />
  );
}
