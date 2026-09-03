import type { Metadata } from "next";
import { bfs } from "@/algorithms/bfs";
import { AlgorithmPageShell } from "@/components/AlgorithmPageShell";
import { AlgorithmWorkbench } from "@/components/AlgorithmWorkbench";
import TheoryContent from "@/content/theory/bfs.mdx";

export const metadata: Metadata = {
  title: "BFS — Duyệt theo bề rộng | Algoverse",
  description:
    "Học thuật toán duyệt đồ thị theo chiều rộng (Breadth-First Search) với hàng đợi FIFO: lý thuyết và mô phỏng 3D từng bước.",
};

export default function BfsPage() {
  return (
    <AlgorithmPageShell
      meta={bfs.meta}
      theory={
        <div className="max-w-3xl">
          <TheoryContent />
        </div>
      }
      simulation={<AlgorithmWorkbench slug={bfs.meta.slug} />}
    />
  );
}
