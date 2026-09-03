import type { Metadata } from "next";
import { dijkstra } from "@/algorithms/dijkstra";
import { AlgorithmPageShell } from "@/components/AlgorithmPageShell";
import { AlgorithmWorkbench } from "@/components/AlgorithmWorkbench";
import TheoryContent from "@/content/theory/dijkstra.mdx";

export const metadata: Metadata = {
  title: "Dijkstra — Đường đi ngắn nhất | Algoverse",
  description:
    "Học thuật toán Dijkstra tìm đường đi ngắn nhất trên đồ thị có trọng số không âm: lý thuyết và mô phỏng 3D từng bước với hàng đợi ưu tiên.",
};

export default function DijkstraPage() {
  return (
    <AlgorithmPageShell
      meta={dijkstra.meta}
      theory={
        <div className="max-w-3xl">
          <TheoryContent />
        </div>
      }
      simulation={<AlgorithmWorkbench slug={dijkstra.meta.slug} />}
    />
  );
}
