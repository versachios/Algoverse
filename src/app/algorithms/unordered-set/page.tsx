import type { Metadata } from "next";
import { unorderedSet } from "@/algorithms/unordered-set";
import { AlgorithmPageShell } from "@/components/AlgorithmPageShell";
import { AlgorithmWorkbench } from "@/components/AlgorithmWorkbench";
import TheoryContent from "@/content/theory/unordered-set.mdx";

export const metadata: Metadata = {
  title: "Hash Set (unordered_set) — Tập hợp băm | Algoverse",
  description:
    "Học cấu trúc dữ liệu Hash Set (unordered_set): lưu khóa duy nhất bằng bảng băm, thao tác O(1) trung bình.",
};

export default function UnorderedSetPage() {
  return (
    <AlgorithmPageShell
      meta={unorderedSet.meta}
      theory={
        <div className="max-w-3xl">
          <TheoryContent />
        </div>
      }
      simulation={<AlgorithmWorkbench slug={unorderedSet.meta.slug} />}
    />
  );
}
