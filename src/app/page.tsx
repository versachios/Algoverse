import Link from "next/link";
import { Suspense } from "react";
import { TopicGraph3D } from "@/components/TopicGraph3D";
import { TopicBrowser } from "@/components/TopicBrowser";
import { Footer } from "@/components/Footer";

const LEARNING_PATH = [
  "Sorting cơ bản (Bubble → Selection → Insertion)",
  "Searching (Linear → Binary)",
  "Cấu trúc dữ liệu nền tảng (Stack, Queue, Linked List)",
  "Two Pointers / Sliding Window / Prefix Sum / Kadane's",
  "Sorting O(n log n) + Đệ quy & Backtracking",
  "Dynamic Programming (Knapsack, LCS, LIS)",
  "Graph (BFS/DFS → Dijkstra/A* → DSU)",
  "Tree (BST/AVL → Segment/Fenwick Tree)",
];

export default function Home() {
  return (
    <div className="flex flex-col">
      <header className="mx-auto max-w-6xl w-full px-4 md:px-6 pt-6 flex items-center justify-between">
        <span className="font-display font-semibold text-lg tracking-tight flex items-center gap-2">
          <span className="label-dot" />
          ALGOVERSE
        </span>
        <nav className="hidden sm:flex gap-5 text-xs text-[var(--color-muted)] font-mono-tech uppercase tracking-widest">
          <Link href="/?category=Cấu trúc dữ liệu#chu-de" className="hover:text-[var(--color-text)]">Cấu trúc dữ liệu</Link>
          <Link href="/?category=Giải thuật#chu-de" className="hover:text-[var(--color-text)]">Giải thuật</Link>
          <a href="#lo-trinh" className="hover:text-[var(--color-text)]">Lộ trình học</a>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl w-full px-4 md:px-6 pt-10 pb-4 flex flex-col gap-4">
        <p className="text-[11px] uppercase tracking-[0.2em] highlight-amber font-mono-tech">
          Field Guide · Học lập trình bằng cách nhìn thấy nó chạy
        </p>
        <h1 className="font-display font-semibold text-4xl md:text-6xl leading-[1.05] max-w-3xl tracking-tight">
          Thuật toán không còn là <span className="highlight-amber">hộp đen</span>.
        </h1>
        <p className="font-serif-quote text-lg md:text-xl text-[var(--color-muted)] max-w-xl">
          “Nhìn thấy một thuật toán chạy, một lần, còn đọng lại lâu hơn cả mười lần đọc pseudocode.”
        </p>
        <div className="flex gap-2 pt-2">
          <Link href="/algorithms/bubble-sort" className="control-btn !text-[var(--color-signal-amber)] !px-4 !py-2">
            Xem Bubble Sort chạy →
          </Link>
          <a href="#chu-de" className="control-btn !px-4 !py-2">
            Duyệt toàn bộ chủ đề
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-6xl w-full px-4 md:px-6 py-6">
        <div className="blueprint-frame rounded-md h-[460px] md:h-[560px] overflow-hidden">
          <TopicGraph3D />
        </div>
        <p className="text-xs text-[var(--color-muted)] font-mono-tech mt-2 uppercase tracking-wide">
          bản đồ chủ đề thật — node màu cam đã có mô phỏng, phần còn lại sẽ thêm dần
        </p>
      </section>

      <section id="chu-de" className="mx-auto max-w-6xl w-full px-4 md:px-6 py-10">
        <h2 className="font-display font-semibold text-2xl mb-4 flex items-center gap-2">
          <span className="label-dot" /> Chủ đề
        </h2>
        <Suspense fallback={null}>
          <TopicBrowser />
        </Suspense>
      </section>

      <section id="lo-trinh" className="mx-auto max-w-6xl w-full px-4 md:px-6 py-10">
        <h2 className="font-display font-semibold text-2xl mb-4 flex items-center gap-2">
          <span className="label-dot" /> Lộ trình học gợi ý
        </h2>
        <ol className="blueprint-frame rounded-md p-4 flex flex-col gap-2">
          {LEARNING_PATH.map((step, i) => (
            <li key={step} className="flex gap-3 text-sm py-1.5 border-b border-[var(--color-hairline)]/60 last:border-0">
              <span className="font-mono-tech highlight-amber w-6 shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <Footer />
    </div>
  );
}