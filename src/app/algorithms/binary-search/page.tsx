import type { Metadata } from "next";
import { binarySearch } from "@/algorithms/binary-search";
import { AlgorithmPageShell } from "@/components/AlgorithmPageShell";
import { AlgorithmWorkbench } from "@/components/AlgorithmWorkbench";
import TheoryContent from "@/content/theory/binary-search.mdx";

export const metadata: Metadata = {
  title: "Binary Search — Lý thuyết & Mô phỏng trực quan | Algo3D",
  description:
    "Học Binary Search qua lý thuyết, ví dụ chạy tay và mô phỏng 2.5D từng bước thu hẹp phạm vi tìm kiếm.",
};

export default function BinarySearchPage() {
  return (
    <AlgorithmPageShell
      meta={binarySearch.meta}
      theory={
        <div className="max-w-3xl">
          <TheoryContent />
        </div>
      }
      simulation={<AlgorithmWorkbench slug={binarySearch.meta.slug} />}
    />
  );
}
