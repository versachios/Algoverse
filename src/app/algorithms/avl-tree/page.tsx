import type { Metadata } from "next";
import { avlTree } from "@/algorithms/avl-tree";
import { AlgorithmPageShell } from "@/components/AlgorithmPageShell";
import { AlgorithmWorkbench } from "@/components/AlgorithmWorkbench";
import TheoryContent from "@/content/theory/avl-tree.mdx";

export const metadata: Metadata = {
  title: "AVL Tree — Lý thuyết & Mô phỏng trực quan | Algoverse",
  description:
    "Học AVL Tree qua lý thuyết, ví dụ chạy tay và mô phỏng 3D các trường hợp xoay Left-Left, Right-Right, Left-Right, Right-Left.",
};

export default function AVLTreePage() {
  return (
    <AlgorithmPageShell
      meta={avlTree.meta}
      theory={
        <div className="max-w-3xl">
          <TheoryContent />
        </div>
      }
      simulation={<AlgorithmWorkbench slug={avlTree.meta.slug} />}
    />
  );
}
