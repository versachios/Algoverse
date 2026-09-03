import type { Metadata } from "next";
import { treeMap } from "@/algorithms/tree-map";
import { AlgorithmPageShell } from "@/components/AlgorithmPageShell";
import { AlgorithmWorkbench } from "@/components/AlgorithmWorkbench";
import TheoryContent from "@/content/theory/tree-map.mdx";

export const metadata: Metadata = {
  title: "Tree Map (std::map) — Bản đồ cây đỏ-đen | Algoverse",
  description:
    "Học cấu trúc dữ liệu Tree Map (std_map): cây đỏ-đen lưu cặp khóa-giá trị có thứ tự, thao tác O(log n).",
};

export default function TreeMapPage() {
  return (
    <AlgorithmPageShell
      meta={treeMap.meta}
      theory={
        <div className="max-w-3xl">
          <TheoryContent />
        </div>
      }
      simulation={<AlgorithmWorkbench slug={treeMap.meta.slug} />}
    />
  );
}
