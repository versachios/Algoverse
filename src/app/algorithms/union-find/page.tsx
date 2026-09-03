import type { Metadata } from "next";
import { unionFind } from "@/algorithms/union-find";
import { AlgorithmPageShell } from "@/components/AlgorithmPageShell";
import { AlgorithmWorkbench } from "@/components/AlgorithmWorkbench";
import TheoryContent from "@/content/theory/union-find.mdx";

export const metadata: Metadata = {
  title: "Union-Find / DSU | Algoverse",
  description:
    "Học cấu trúc dữ liệu Disjoint Set Union: gộp tập (union) và truy vấn cùng tập (find) với nén đường đi — lý thuyết và mô phỏng 3D rừng cây.",
};

export default function UnionFindPage() {
  return (
    <AlgorithmPageShell
      meta={unionFind.meta}
      theory={
        <div className="max-w-3xl">
          <TheoryContent />
        </div>
      }
      simulation={<AlgorithmWorkbench slug={unionFind.meta.slug} />}
    />
  );
}
