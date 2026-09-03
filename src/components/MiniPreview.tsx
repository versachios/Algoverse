"use client";

import { useEffect, useRef, useState } from "react";
import { BarsScene } from "@/components/render-3d/BarsScene";
import { ArrayRow2D } from "@/components/render-2d/ArrayRow2D";
import { TreeScene } from "@/components/render-3d/TreeScene";
import { GridScene } from "@/components/render-3d/GridScene";
import { GraphScene } from "@/components/render-3d/GraphScene";
import { HashTableScene } from "@/components/render-3d/HashTableScene";
import { RbtScene } from "@/components/render-3d/RbtScene";
import { getAlgorithm } from "@/algorithms";
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

/**
 * Each preview mounts its own <Canvas>, and each <Canvas> opens its own WebGL
 * context. Browsers cap the number of live WebGL contexts per page (commonly
 * ~16) — once the catalogue grew past that, the oldest contexts started
 * getting force-killed ("Too many active WebGL contexts. Oldest context
 * will be lost."), which is what caused previews to go blank seemingly at
 * random across the whole site, not just in newly-added algorithms.
 *
 * Fix: only mount the actual <Canvas>-based scene while the card is inside
 * (or near) the viewport. Scrolling a card away unmounts its scene, which
 * also frees its WebGL context, so at most a handful of contexts exist at
 * once no matter how many cards the catalogue has.
 */
function useInView<T extends HTMLElement>(rootMargin = "200px") {
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

export function MiniPreview({ slug }: { slug: string }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const algorithm = getAlgorithm(slug);
  const [steps, setSteps] = useState<AlgorithmStep[]>(() => [
    ...algorithm.run(PREVIEW_INPUTS[slug] ?? [4, 2, 6, 1]),
  ]);
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    if (!inView) return; // pause stepping while off-screen too — no point animating what isn't rendered
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
  }, [inView, steps.length, algorithm, slug]);

  const step = steps[cursor];

  return (
    <div ref={ref} className="h-24 pointer-events-none -mx-1">
      {!inView || !step ? null : isTreeStep(step) ? (
        <TreeScene step={step} interactive={false} />
      ) : isRbtStep(step) ? (
        <RbtScene step={step} interactive={false} />
      ) : isHashStep(step) ? (
        <HashTableScene step={step} />
      ) : isGridStep(step) ? (
        <GridScene step={step} interactive={false} />
      ) : isGraphStep(step) ? (
        <GraphScene step={step} interactive={false} />
      ) : algorithm.meta.renderMode === "3d" ? (
        <BarsScene step={step} interactive={false} />
      ) : (
        <ArrayRow2D step={step} interactive={false} />
      )}
    </div>
  );
}
