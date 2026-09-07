import type { Metadata } from "next";
import { catalogue } from "@/algorithms/catalogue";
import { LessonGroupShell } from "@/components/LessonGroupShell";
import TheoryContent from "@/content/theory/lcs-lis-overview.mdx";

const entry = catalogue.find((c) => c.slug === "lcs-lis")!;

export const metadata: Metadata = {
  title: "DP: LCS / LIS | Algoverse",
  description:
    "Hai bài toán quy hoạch động kinh điển của HSG/Olympiad tin học: LCS (dãy con chung dài nhất) và LIS (dãy con tăng dài nhất).",
};

export default function LcsLisGroupPage() {
  return (
    <LessonGroupShell
      group={entry.group}
      title={entry.name}
      summary="Hai bài toán 'dãy con' kinh điển — chọn 1 dạng con bên phải để xem mô phỏng cụ thể."
      basePath="/algorithms/lcs-lis"
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
