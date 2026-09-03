import type { Metadata } from "next";
import { unorderedMap } from "@/algorithms/unordered-map";
import { AlgorithmPageShell } from "@/components/AlgorithmPageShell";
import { AlgorithmWorkbench } from "@/components/AlgorithmWorkbench";
import TheoryContent from "@/content/theory/unordered-map.mdx";

export const metadata: Metadata = {
  title: "Hash Map (unordered_map) — Bảng băm | Algoverse",
  description:
    "Học cấu trúc dữ liệu Hash Map (unordered_map): bảng băm, hàm băm, chaining, xung đột và độ phức tạp O(1) trung bình.",
};

export default function UnorderedMapPage() {
  return (
    <AlgorithmPageShell
      meta={unorderedMap.meta}
      theory={
        <div className="max-w-3xl">
          <TheoryContent />
        </div>
      }
      simulation={<AlgorithmWorkbench slug={unorderedMap.meta.slug} />}
    />
  );
}
