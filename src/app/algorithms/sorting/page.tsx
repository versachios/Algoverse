import type { Metadata } from "next";
import { catalogue } from "@/algorithms/catalogue";
import { LessonGroupShell } from "@/components/LessonGroupShell";
import TheoryContent from "@/content/theory/sorting-overview.mdx";

const entry = catalogue.find((c) => c.slug === "sorting")!;

export const metadata: Metadata = {
  title: "Các kỹ thuật sort | Algoverse",
  description:
    "Ba thuật toán sắp xếp cơ bản O(n²): Bubble Sort, Selection Sort, Insertion Sort — cùng cách so sánh và chọn thuật toán phù hợp.",
};

export default function SortingGroupPage() {
  return (
    <LessonGroupShell
      group={entry.group}
      title={entry.name}
      summary="Ba cách tiếp cận khác nhau cho cùng một bài toán — chọn 1 dạng con bên phải để xem mô phỏng cụ thể."
      basePath="/algorithms/sorting"
      subLessons={entry.subLessons ?? []}
      activeSlug={null}
      theory={
        <div className="max-w-3xl">
          <TheoryContent />
        </div>
      }
    />
  );
}
