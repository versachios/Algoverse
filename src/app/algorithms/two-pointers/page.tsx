import type { Metadata } from "next";
import { catalogue } from "@/algorithms/catalogue";
import { LessonGroupShell } from "@/components/LessonGroupShell";
import TheoryContent from "@/content/theory/two-pointers-overview.mdx";

const entry = catalogue.find((c) => c.slug === "two-pointers")!;

export const metadata: Metadata = {
  title: "Two Pointers | Algoverse",
  description:
    "Học kỹ thuật Two Pointers: 3 dạng di chuyển con trỏ thường gặp — hai mảng, hội tụ một mảng, và cùng chiều một mảng.",
};

export default function TwoPointersGroupPage() {
  return (
    <LessonGroupShell
      group={entry.group}
      title={entry.name}
      summary="Một họ kỹ thuật, không phải một bài toán — chọn 1 dạng con bên phải để xem mô phỏng cụ thể."
      basePath="/algorithms/two-pointers"
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
