"use client";

import { useEffect, useState } from "react";
import { BarsScene } from "@/components/render-3d/BarsScene";
import { ArrayRow2D } from "@/components/render-2d/ArrayRow2D";
import { getAlgorithm } from "@/algorithms";
import type { AlgorithmStep } from "@/algorithms/types";

const PREVIEW_INPUTS: Record<string, number[]> = {
  "bubble-sort": [5, 2, 8, 3],
  "selection-sort": [7, 1, 5, 4],
  "insertion-sort": [5, 3, 8, 2],
  "binary-search": [1, 3, 5, 7, 9, 11],
  "linear-search": [4, 9, 2, 7, 5],
};

export function MiniPreview({ slug }: { slug: string }) {
  const algorithm = getAlgorithm(slug);
  const [steps, setSteps] = useState<AlgorithmStep[]>(() => [
    ...algorithm.run(PREVIEW_INPUTS[slug] ?? [4, 2, 6, 1]),
  ]);
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
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
  }, [steps.length, algorithm, slug]);

  const step = steps[cursor];
  if (!step) return null;

  return (
    <div className="h-24 pointer-events-none -mx-1">
      {algorithm.meta.renderMode === "3d" ? (
        <BarsScene step={step} interactive={false} />
      ) : (
        <ArrayRow2D step={step} interactive={false} />
      )}
    </div>
  );
}
