"use client";

import dynamic from "next/dynamic";

// next/dynamic with ssr:false is only allowed inside a Client Component, so
// this thin wrapper exists purely so page.tsx (a Server Component) can stay
// server-rendered while still deferring the heavy three.js bundle.
const TopicGraph3D = dynamic(() => import("@/components/TopicGraph3D").then((m) => m.TopicGraph3D), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center font-mono-tech text-xs uppercase tracking-widest text-[var(--color-muted)]">
      đang tải bản đồ chủ đề…
    </div>
  ),
});

export { TopicGraph3D as TopicGraph3DLazy };
