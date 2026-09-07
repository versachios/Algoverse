import type { Metadata } from "next";
import { catalogue } from "@/algorithms/catalogue";
import { LessonGroupShell } from "@/components/LessonGroupShell";
import TheoryContent from "@/content/theory/dp-overview.mdx";

const entry = catalogue.find((c) => c.slug === "dp")!;

export const metadata: Metadata = {
  title: "Quy hoạch động (DP) | Algoverse",
  description:
    "Lý thuyết nền tảng của quy hoạch động: khác biệt với đệ quy thường và cách tìm công thức truy hồi — trước khi đi vào từng dạng bài LIS, LCS, 0/1 Knapsack.",
};

export default function DpGroupPage() {
  return (
    <LessonGroupShell
      group={entry.group}
      title={entry.name}
      summary="Lý thuyết chung về DP — chọn 1 dạng bài bên phải để xem mô phỏng và code cụ thể."
      basePath="/algorithms/dp"
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
