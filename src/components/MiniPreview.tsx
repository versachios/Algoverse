"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { getAlgorithm } from "@/algorithms";

const BarsScene = dynamic(() => import("@/components/render-3d/BarsScene").then((m) => m.BarsScene), { ssr: false });
const ArrayRow2D = dynamic(() => import("@/components/render-2d/ArrayRow2D").then((m) => m.ArrayRow2D), { ssr: false });
const TreeScene = dynamic(() => import("@/components/render-3d/TreeScene").then((m) => m.TreeScene), { ssr: false });
const GridScene = dynamic(() => import("@/components/render-3d/GridScene").then((m) => m.GridScene), { ssr: false });
const GraphScene = dynamic(() => import("@/components/render-3d/GraphScene").then((m) => m.GraphScene), { ssr: false });
const HashTableScene = dynamic(() => import("@/components/render-3d/HashTableScene").then((m) => m.HashTableScene), { ssr: false });
const RbtScene = dynamic(() => import("@/components/render-3d/RbtScene").then((m) => m.RbtScene), { ssr: false });
import {
  isGridStep,
  isGraphStep,
  isHashStep,
  isRbtStep,
  isTreeStep,
  type AlgorithmStep,
} from "@/algorithms/types";

const PREVIEW_INPUTS: Record<string, number[]> = {
  "bubble-sort": [5, 2, 8, 3],
  "selection-sort": [7, 1, 5, 4],
  "insertion-sort": [5, 3, 8, 2],
  "binary-search": [1, 3, 5, 7, 9, 11],
  "linear-search": [4, 9, 2, 7, 5],
  bst: [8, 3, 10, 1, 6],
  "avl-tree": [10, 20, 30, 15],
  "min-heap": [7, 3, 9, 1],
  knapsack: [6, 2, 3, 3, 4, 4, 5],
  dijkstra: [0, 5, 6, 0, 1, 2, 0, 2, 6, 1, 3, 1, 2, 3, 1, 1, 4, 3, 3, 4, 2],
  bfs: [0, 5, 6, 0, 1, 0, 0, 2, 0, 1, 3, 0, 2, 3, 0, 1, 4, 0, 3, 4, 0],
  dfs: [0, 5, 6, 0, 1, 0, 0, 2, 0, 1, 3, 0, 2, 3, 0, 1, 4, 0, 3, 4, 0],
  "union-find": [5, 4, 1, 0, 1, 1, 2, 3, 1, 1, 3, 1, 3, 4],
  "unordered-map": [5, 5, 1, 12, 5, 1, 25, 2, 1, 35, 9, 3, 35, 0, 3, 99, 0],
  "unordered-set": [5, 5, 1, 12, 0, 1, 25, 0, 1, 35, 0, 3, 25, 0, 0, 12, 0],
  "tree-map": [6, 1, 10, 5, 1, 20, 2, 1, 30, 9, 1, 25, 4, 3, 30, 0],
  "tree-set": [5, 1, 10, 0, 1, 20, 0, 1, 30, 0, 3, 25, 0],
  "two-pointers": [10, 1, 3, 4, 6, 8, 9],
  "sliding-window": [3, 7, 2, 5, 1, 8],
  kadane: [-2, 1, -3, 4, -1, 2, 1],
};

function useInView<T extends HTMLElement>(rootMargin = "50px") {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, inView };
}

/**
 * Each preview mounts its own <Canvas> -> its own WebGL context, and
 * browsers cap concurrent contexts (~16/page). This pool caps how many
 * MiniPreview canvases can be mounted at once so that total never gets
 * close to the limit (also protects the homepage's TopicGraph3D, which is
 * the page's oldest context and gets force-killed first if the cap is hit).
 *
 * First version of this just refused a slot to any newcomer once the pool
 * was full and never took it back — cards granted a slot early kept it
 * even after scrolling mostly out of view, so on a long catalogue page
 * everything past the first ~6 cards stayed permanently blank. This
 * version evicts the LEAST-recently-granted slot to make room for a new
 * card wanting one, so the pool always tracks whatever's most relevant
 * right now instead of whoever asked first.
 */
const MAX_ACTIVE_PREVIEWS = 10;
const grantOrder: string[] = []; // oldest-granted first
const setters = new Map<string, (v: boolean) => void>();

function acquireSlot(id: string, setGranted: (v: boolean) => void) {
  setters.set(id, setGranted);
  const idx = grantOrder.indexOf(id);
  if (idx !== -1) grantOrder.splice(idx, 1);
  grantOrder.push(id);

  while (grantOrder.length > MAX_ACTIVE_PREVIEWS) {
    const evictId = grantOrder.shift()!;
    if (evictId !== id) setters.get(evictId)?.(false);
  }
  setGranted(true);
}

function releaseSlot(id: string) {
  const idx = grantOrder.indexOf(id);
  if (idx !== -1) grantOrder.splice(idx, 1);
  setters.delete(id);
}

function usePreviewSlot(id: string, wantActive: boolean) {
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    if (!wantActive) {
      releaseSlot(id);
      setGranted(false);
      return;
    }
    acquireSlot(id, setGranted);
    return () => releaseSlot(id);
  }, [id, wantActive]);

  return granted;
}

export function MiniPreview({ slug }: { slug: string }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const active = usePreviewSlot(slug, inView);
  const algorithm = getAlgorithm(slug);
  const [steps, setSteps] = useState<AlgorithmStep[]>(() => [
    ...algorithm.run(PREVIEW_INPUTS[slug] ?? [4, 2, 6, 1]),
  ]);
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    if (!active) return; // pause stepping while off-screen or waiting for a free slot
    const id = setInterval(() => {
      setCursor((c) => {
        if (c + 1 >= steps.length) {
          setSteps([...algorithm.run(PREVIEW_INPUTS[slug] ?? [4, 2, 6, 1])]);
          return 0;
        }
        return c + 1;
      });
    }, 700);
    return () => clearInterval(id);
  }, [active, steps.length, algorithm, slug]);

  const step = steps[cursor];

  return (
    <div ref={ref} className="h-24 pointer-events-none -mx-1">
      {!active || !step ? null : isTreeStep(step) ? (
        <TreeScene step={step} interactive={false} compact />
      ) : isRbtStep(step) ? (
        <RbtScene step={step} interactive={false} compact />
      ) : isHashStep(step) ? (
        <HashTableScene step={step} interactive={false} compact />
      ) : isGridStep(step) ? (
        <GridScene step={step} interactive={false} compact />
      ) : isGraphStep(step) ? (
        <GraphScene step={step} interactive={false} compact />
      ) : algorithm.meta.renderMode === "3d" ? (
        <BarsScene step={step} interactive={false} compact />
      ) : (
        <ArrayRow2D step={step} interactive={false} compact />
      )}
    </div>
  );
}
