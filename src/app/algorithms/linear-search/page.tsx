import type { Metadata } from "next";
import { linearSearch } from "@/algorithms/linear-search";
import { AlgorithmPageShell } from "@/components/AlgorithmPageShell";
import { AlgorithmWorkbench } from "@/components/AlgorithmWorkbench";
import TheoryContent from "@/content/theory/linear-search.mdx";

export const metadata: Metadata = {
  title: "Linear Search — Lý thuyết & Mô phỏng trực quan | Algo3D",
  description:
    "Học Linear Search qua lý thuyết, ví dụ chạy tay và mô phỏng 2.5D quét tuần tự trên mảng chưa sắp xếp.",
};

export default function LinearSearchPage() {
  return (
    <AlgorithmPageShell
      meta={linearSearch.meta}
      theory={
        <div className="max-w-3xl">
          <TheoryContent />
        </div>
      }
      simulation={<AlgorithmWorkbench slug={linearSearch.meta.slug} />}
    />
  );
}
