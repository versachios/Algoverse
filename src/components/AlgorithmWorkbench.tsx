"use client";

import { useEffect, useState } from "react";
import { usePlaybackStore } from "@/store/playback-store";
import { BarsScene } from "@/components/render-3d/BarsScene";
import { TreeScene } from "@/components/render-3d/TreeScene";
import { GridScene } from "@/components/render-3d/GridScene";
import { GraphScene } from "@/components/render-3d/GraphScene";
import { HashTableScene } from "@/components/render-3d/HashTableScene";
import { RbtScene } from "@/components/render-3d/RbtScene";
import { ArrayRow2D } from "@/components/render-2d/ArrayRow2D";
import { CodePanel } from "@/components/CodePanel";
import { StepTrace } from "@/components/StepTrace";
import { getAlgorithm } from "@/algorithms";
import { isGridStep, isGraphStep, isHashStep, isRbtStep, isTreeStep } from "@/algorithms/types";

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
  // Dijkstra: [source, numNodes, numEdges, u, v, w, ...]
  dijkstra: [0, 6, 8, 0, 1, 2, 0, 2, 6, 1, 3, 1, 2, 3, 1, 1, 4, 3, 3, 4, 2, 3, 5, 4, 4, 5, 1],
  // BFS / DFS: same graph format as Dijkstra (weights ignored)
  bfs: [0, 6, 8, 0, 1, 0, 0, 2, 0, 1, 3, 0, 2, 3, 0, 1, 4, 0, 3, 4, 0, 3, 5, 0, 4, 5, 0],
  dfs: [0, 6, 8, 0, 1, 0, 0, 2, 0, 1, 3, 0, 2, 3, 0, 1, 4, 0, 3, 4, 0, 3, 5, 0, 4, 5, 0],
  // Union-Find: [numNodes, numOps, op...] with op = (type, a, b); type 1 = union, 0 = find
  "union-find": [7, 6, 1, 0, 1, 1, 2, 3, 1, 1, 3, 0, 5, 0, 1, 4, 5, 1, 0, 4],
  // Hash map/set: [numBuckets, numOps, op, key, val?...]; op 1=insert, 2=erase, 3=find
  "unordered-map": [5, 6, 1, 12, 5, 1, 25, 2, 1, 35, 9, 1, 42, 1, 3, 35, 0, 3, 99, 0],
  "unordered-set": [5, 8, 1, 12, 0, 1, 25, 0, 1, 35, 0, 1, 42, 0, 1, 7, 0, 3, 25, 0, 0, 12, 0, 3, 12, 0],
  // Tree map/set (red-black): [numOps, op, key, val?...]
  "tree-map": [7, 1, 10, 5, 1, 20, 2, 1, 30, 9, 1, 25, 4, 3, 30, 0, 0, 20, 0],
  "tree-set": [6, 1, 10, 0, 1, 20, 0, 1, 30, 0, 1, 25, 0, 3, 25, 0],
  // Two pointers: [target, a...]; sliding window: [k, a...]; kadane: [a...]
  "two-pointers": [10, 1, 3, 4, 6, 8, 9, 11, 14],
  "sliding-window": [3, 7, 2, 5, 1, 8, 3, 6, 4],
  kadane: [-2, 1, -3, 4, -1, 2, 1, -5, 4],
};

// Tree algorithms take "sequence of values to insert"; knapsack takes a packed
// [capacity, w1, v1, ...] list — both still fit AlgorithmModule.run(number[]),
// so only the label/hint text needs to change per slug.
const INPUT_LABELS: Record<string, string> = {
  bst: "Dãy giá trị sẽ chèn lần lượt (2–12 số, cách nhau bởi dấu phẩy)",
  "avl-tree": "Dãy giá trị sẽ chèn lần lượt (2–12 số, cách nhau bởi dấu phẩy)",
  "min-heap": "Dãy giá trị sẽ chèn lần lượt (2–12 số, cách nhau bởi dấu phẩy)",
  knapsack: "Sức chứa, rồi từng cặp (trọng lượng, giá trị) — vd: 8, 2,3, 3,4, 4,5",
  dijkstra:
    "Nguồn, số đỉnh, số cạnh, rồi từng bộ ba (u, v, trọng lượng) — vd: 0, 6, 8, 0,1,2, 0,2,6, 1,3,1",
  bfs: "Nguồn, số đỉnh, số cạnh, rồi từng bộ ba (u, v, 0) — vd: 0, 6, 8, 0,1,0, 0,2,0, 1,3,0",
  dfs: "Nguồn, số đỉnh, số cạnh, rồi từng bộ ba (u, v, 0) — vd: 0, 6, 8, 0,1,0, 0,2,0, 1,3,0",
  "union-find":
    "Số đỉnh, số thao tác, rồi từng bộ ba (loại, a, b); loại 1 = union, 0 = find — vd: 7, 6, 1,0,1, 1,2,3, 1,1,3",
  "unordered-map":
    "Số bucket, số thao tác, rồi từng bộ ba (loại, khóa, giá trị); loại 1 = chèn, 2 = xóa, 3 = tìm — vd: 5, 6, 1,12,5, 1,25,2, 3,35,0",
  "unordered-set":
    "Số bucket, số thao tác, rồi từng bộ ba (loại, khóa, 0); loại 1 = chèn, 2 = xóa, 3 = tìm — vd: 5, 8, 1,12,0, 1,25,0, 3,25,0",
  "tree-map":
    "Số thao tác, rồi từng bộ ba (loại, khóa, giá trị); loại 1 = chèn, 2 = xóa, 3 = tìm — vd: 7, 1,10,5, 1,20,2, 1,30,9, 3,30,0",
  "tree-set":
    "Số thao tác, rồi từng bộ ba (loại, khóa, 0); loại 1 = chèn, 2 = xóa, 3 = tìm — vd: 6, 1,10,0, 1,20,0, 1,30,0, 3,25,0",
  "two-pointers": "Tổng mục tiêu X, rồi dãy đã sắp xếp tăng dần — vd: 10, 1, 3, 4, 6, 8, 9, 11, 14",
  "sliding-window": "Kích thước cửa sổ k, rồi dãy số — vd: 3, 7, 2, 5, 1, 8, 3, 6, 4",
  kadane: "Dãy số (có thể gồm số âm) — vd: -2, 1, -3, 4, -1, 2, 1, -5, 4",
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
    const longInputs = new Set([
      "knapsack",
      "dijkstra",
      "bfs",
      "dfs",
      "union-find",
      "unordered-map",
      "unordered-set",
      "tree-map",
      "tree-set",
      "two-pointers",
      "sliding-window",
      "kadane",
    ]);
    const maxLen = longInputs.has(slug) ? 60 : 12;
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
            ) : isRbtStep(step) ? (
              <RbtScene step={step} />
            ) : isHashStep(step) ? (
              <HashTableScene step={step} />
            ) : isGridStep(step) ? (
              <GridScene step={step} />
            ) : isGraphStep(step) ? (
              <GraphScene step={step} />
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
