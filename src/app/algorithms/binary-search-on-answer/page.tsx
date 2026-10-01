import type { Metadata } from "next";
import { binarySearchOnAnswer } from "@/algorithms/binary-search-on-answer";
import { AlgorithmPageShell } from "@/components/AlgorithmPageShell";
import { AlgorithmWorkbench } from "@/components/AlgorithmWorkbench";
import TheoryContent from "@/content/theory/binary-search-on-answer.mdx";

export const metadata: Metadata = {
  title: "Binary Search trên đáp án | Algoverse",
  description:
    "Học kỹ thuật nhị phân trên đáp án: biến bài toán tối ưu thành bài toán kiểm tra khả thi.",
};

export default function BinarySearchOnAnswerPage() {
  return (
    <AlgorithmPageShell
      meta={binarySearchOnAnswer.meta}
      theory={
        <div className="max-w-3xl">
          <TheoryContent />
        </div>
      }
      simulation={<AlgorithmWorkbench slug={binarySearchOnAnswer.meta.slug} />}
    />
  );
}
