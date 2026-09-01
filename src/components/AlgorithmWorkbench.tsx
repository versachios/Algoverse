"use client";

import { useEffect, useState } from "react";
import { usePlaybackStore } from "@/store/playback-store";
import { BarsScene } from "@/components/render-3d/BarsScene";
import { TreeScene } from "@/components/render-3d/TreeScene";
import { GridScene } from "@/components/render-3d/GridScene";
import { ArrayRow2D } from "@/components/render-2d/ArrayRow2D";
import { CodePanel } from "@/components/CodePanel";
import { StepTrace } from "@/components/StepTrace";
import { getAlgorithm } from "@/algorithms";
import { isGridStep, isTreeStep } from "@/algorithms/types";

const DEFAULT_INPUTS: Record<string, number[]> = {
  "bubble-sort": [6, 2, 9, 4, 1, 7, 3],
  "selection-sort": [6, 2, 9, 4, 1, 7, 3],
  "insertion-sort": [6, 2, 9, 4, 1, 7, 3],
  "binary-search": [1, 3, 4, 6, 8, 9, 11, 14],
  "linear-search": [6, 2, 9, 4, 1, 7, 3],
  bst: [50, 30, 70, 20, 40, 60, 80, 10],
  "avl-tree": [10, 20, 30, 40, 50, 25],
  "min-heap": [9, 4, 7, 1, 8, 3, 6],
  // Knapsack packs its input as [capacity, w1, v1, w2, v2, ...]
  knapsack: [8, 2, 3, 3, 4, 4, 5, 5, 6],
};

// Tree algorithms take "sequence of values to insert"; knapsack takes a packed
// [capacity, w1, v1, ...] list — both still fit AlgorithmModule.run(number[]),
// so only the label/hint text needs to change per slug.
const INPUT_LABELS: Record<string, string> = {
  bst: "Dãy giá trị sẽ chèn lần lượt (2–12 số, cách nhau bởi dấu phẩy)",
  "avl-tree": "Dãy giá trị sẽ chèn lần lượt (2–12 số, cách nhau bởi dấu phẩy)",
  "min-heap": "Dãy giá trị sẽ chèn lần lượt (2–12 số, cách nhau bởi dấu phẩy)",
  knapsack: "Sức chứa, rồi từng cặp (trọng lượng, giá trị) — vd: 8, 2,3, 3,4, 4,5",
};
const DEFAULT_LABEL = "Mảng đầu vào (2–12 số, cách nhau bởi dấu phẩy)";

export function AlgorithmWorkbench({ slug }: { slug: string }) {
  const algorithm = getAlgorithm(slug);
  const defaultInput = DEFAULT_INPUTS[slug] ?? [6, 2, 9, 4, 1, 7, 3];
  const { load, steps, cursor } = usePlaybackStore();
  const [inputText, setInputText] = useState(defaultInput.join(", "));

  useEffect(() => {
    load(algorithm, defaultInput);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const step = steps[cursor];

  function applyInput() {
    const parsed = inputText
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n));
    const maxLen = slug === "knapsack" ? 21 : 12;
    if (parsed.length >= 2 && parsed.length <= maxLen) {
      load(algorithm, parsed);
    }
  }

  return (
    <div className="grid lg:grid-cols-[1.6fr_1fr] gap-4">
      <div className="flex flex-col gap-3">
        <div className="blueprint-frame rounded-md h-[420px] overflow-hidden">
          {step ? (
            isTreeStep(step) ? (
              <TreeScene step={step} />
            ) : isGridStep(step) ? (
              <GridScene step={step} />
            ) : algorithm.meta.renderMode === "3d" ? (
              <BarsScene step={step} />
            ) : (
              <ArrayRow2D step={step} />
            )
          ) : (
            <div className="h-full grid place-items-center text-[var(--color-muted)] font-mono-tech text-sm">
              Đang khởi tạo mô phỏng…
            </div>
          )}
        </div>
        <StepTrace />
      </div>

      <div className="flex flex-col gap-3">
        <div className="blueprint-frame rounded-md p-3 flex flex-col gap-2">
          <label className="text-[11px] uppercase tracking-widest text-[var(--color-muted)] font-mono-tech">
            {INPUT_LABELS[slug] ?? DEFAULT_LABEL}
          </label>
          <div className="flex gap-2">
            <input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-[var(--color-panel-raised)] border border-[var(--color-hairline)] rounded px-2 py-1.5 font-mono-tech text-sm focus:outline-none focus:border-[var(--color-signal-amber)]"
            />
            <button onClick={applyInput} className="control-btn !text-[var(--color-signal-amber)]">
              Áp dụng
            </button>
          </div>
        </div>

        {step && <CodePanel code={algorithm.code} activeLine={step.codeLine} />}
      </div>
    </div>
  );
}
