import type { Metadata } from "next";
import { dfs } from "@/algorithms/dfs";
import { AlgorithmPageShell } from "@/components/AlgorithmPageShell";
import { AlgorithmWorkbench } from "@/components/AlgorithmWorkbench";
import TheoryContent from "@/content/theory/dfs.mdx";

export const metadata: Metadata = {
  title: "DFS — Duyệt theo chiều sâu | Algoverse",
  description:
    "Học thuật toán duyệt đồ thị theo chiều sâu (Depth-First Search) với đệ quy/ngăn xếp: lý thuyết và mô phỏng 3D từng bước.",
};

export default function DfsPage() {
  return (
    <AlgorithmPageShell
      meta={dfs.meta}
      theory={
        <div className="max-w-3xl">
          <TheoryContent />
        </div>
      }
      simulation={<AlgorithmWorkbench slug={dfs.meta.slug} />}
    />
  );
}
