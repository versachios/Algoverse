import type { Metadata } from "next";
import { bst } from "@/algorithms/bst";
import { AlgorithmPageShell } from "@/components/AlgorithmPageShell";
import { AlgorithmWorkbench } from "@/components/AlgorithmWorkbench";
import TheoryContent from "@/content/theory/bst.mdx";

export const metadata: Metadata = {
  title: "Binary Search Tree — Lý thuyết & Mô phỏng trực quan | Algoverse",
  description:
    "Học Binary Search Tree qua lý thuyết, ví dụ chạy tay và mô phỏng 3D từng bước chèn giá trị vào cây.",
};

export default function BSTPage() {
  return (
    <AlgorithmPageShell
      meta={bst.meta}
      theory={
        <div className="max-w-3xl">
          <TheoryContent />
        </div>
      }
      simulation={<AlgorithmWorkbench slug={bst.meta.slug} />}
    />
  );
}
