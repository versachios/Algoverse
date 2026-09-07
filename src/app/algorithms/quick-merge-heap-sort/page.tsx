import type { Metadata } from "next";
import { catalogue } from "@/algorithms/catalogue";
import { LessonGroupShell } from "@/components/LessonGroupShell";
import TheoryContent from "@/content/theory/quick-merge-heap-overview.mdx";

const entry = catalogue.find((c) => c.slug === "quick-merge-heap-sort")!;

export const metadata: Metadata = {
  title: "Quick / Merge / Heap Sort | Algoverse",
  description:
    "Ba thuật toán sắp xếp O(n log n): Quick Sort, Merge Sort, Heap Sort — trọng tâm ôn thi tuyển sinh 10 chuyên Tin.",
};

export default function QuickMergeHeapGroupPage() {
  return (
    <LessonGroupShell
      group={entry.group}
      title={entry.name}
      summary="Ba cách khác nhau để đạt O(n log n) — chọn 1 dạng con bên phải để xem mô phỏng cụ thể."
      basePath="/algorithms/quick-merge-heap-sort"
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
