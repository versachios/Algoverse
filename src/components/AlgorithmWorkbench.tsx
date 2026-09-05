"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePlaybackStore } from "@/store/playback-store";

// Each scene pulls in three.js + @react-three/fiber (~1MB combined). Loading
// all 7 statically meant every algorithm page — even a simple sort — shipped
// every render mode's JS up front, delaying first paint. Dynamic-importing
// with ssr:false means a page only ever fetches the ONE scene it actually
// uses, as a separate chunk, after the surrounding page shell (title, theory
// text, code panel) has already painted.
const SCENE_LOADING = <div className="h-full w-full animate-pulse bg-[var(--color-hairline)]/20" />;
const BarsScene = dynamic(() => import("@/components/render-3d/BarsScene").then((m) => m.BarsScene), { ssr: false, loading: () => SCENE_LOADING });
const TreeScene = dynamic(() => import("@/components/render-3d/TreeScene").then((m) => m.TreeScene), { ssr: false, loading: () => SCENE_LOADING });
const GridScene = dynamic(() => import("@/components/render-3d/GridScene").then((m) => m.GridScene), { ssr: false, loading: () => SCENE_LOADING });
const GraphScene = dynamic(() => import("@/components/render-3d/GraphScene").then((m) => m.GraphScene), { ssr: false, loading: () => SCENE_LOADING });
const HashTableScene = dynamic(() => import("@/components/render-3d/HashTableScene").then((m) => m.HashTableScene), { ssr: false, loading: () => SCENE_LOADING });
const RbtScene = dynamic(() => import("@/components/render-3d/RbtScene").then((m) => m.RbtScene), { ssr: false, loading: () => SCENE_LOADING });
const ArrayRow2D = dynamic(() => import("@/components/render-2d/ArrayRow2D").then((m) => m.ArrayRow2D), { ssr: false, loading: () => SCENE_LOADING });
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
  // Two pointers: [target, a...]; sliding window: [n, k, a...]; kadane: [a...]
  "two-pointers": [10, 1, 3, 4, 6, 8, 9, 11, 14],
  "sliding-window": [9, 3, 3, 7, 2, 5, 1, 8, 3, 6, 4],
  kadane: [-2, 1, -3, 4, -1, 2, 1, -5, 4],
};

/**
 * Structured input spec for the workbench controls.
 *
 * Every algorithm consumes a flat `number[]` (AlgorithmModule.run) but the
 * leading values have different meanings per slug: sliding window reads
 * [n, k, a...], knapsack [capacity, w1, v1, ...], dijkstra
 * [source, N, E, (u,v,w)...], and so on. Each spec describes how to split
 * that packed list into one labeled scalar input per leading value plus a
 * single array input (fixed: 0, always last) that owns the rest.
 * `checksArrayLength` marks a scalar that must equal the array length (used
 * by sliding window's explicit n).
 */
type InputFieldSpec = {
  label: string;
  /** 1 = single scalar at the start of the packed input; 0 = the array field (only the last may be 0). */
  fixed: 1 | 0;
  checksArrayLength?: boolean;
};

const INPUT_FIELDS: Record<string, InputFieldSpec[]> = {
  "bubble-sort": [{ label: "Mảng a", fixed: 0 }],
  "selection-sort": [{ label: "Mảng a", fixed: 0 }],
  "insertion-sort": [{ label: "Mảng a", fixed: 0 }],
  "binary-search": [{ label: "Mảng a (đã sắp xếp tăng dần)", fixed: 0 }],
  "linear-search": [{ label: "Mảng a", fixed: 0 }],
  bst: [{ label: "Dãy giá trị chèn", fixed: 0 }],
  "avl-tree": [{ label: "Dãy giá trị chèn", fixed: 0 }],
  "min-heap": [{ label: "Dãy giá trị chèn", fixed: 0 }],
  knapsack: [
    { label: "W — sức chứa", fixed: 1 },
    { label: "Các cặp (trọng lượng, giá trị)", fixed: 0 },
  ],
  dijkstra: [
    { label: "S — đỉnh nguồn", fixed: 1 },
    { label: "N — số đỉnh", fixed: 1 },
    { label: "E — số cạnh", fixed: 1 },
    { label: "Các cạnh (u, v, trọng lượng)", fixed: 0 },
  ],
  bfs: [
    { label: "S — đỉnh nguồn", fixed: 1 },
    { label: "N — số đỉnh", fixed: 1 },
    { label: "E — số cạnh", fixed: 1 },
    { label: "Các cạnh (u, v, 0)", fixed: 0 },
  ],
  dfs: [
    { label: "S — đỉnh nguồn", fixed: 1 },
    { label: "N — số đỉnh", fixed: 1 },
    { label: "E — số cạnh", fixed: 1 },
    { label: "Các cạnh (u, v, 0)", fixed: 0 },
  ],
  "union-find": [
    { label: "N — số đỉnh", fixed: 1 },
    { label: "M — số thao tác", fixed: 1 },
    { label: "Các thao tác (loại, a, b) — 1 = union, 0 = find", fixed: 0 },
  ],
  "unordered-map": [
    { label: "B — số bucket", fixed: 1 },
    { label: "M — số thao tác", fixed: 1 },
    { label: "Các thao tác (loại, khóa, giá trị) — 1 = chèn, 2 = xóa, 3 = tìm", fixed: 0 },
  ],
  "unordered-set": [
    { label: "B — số bucket", fixed: 1 },
    { label: "M — số thao tác", fixed: 1 },
    { label: "Các thao tác (loại, khóa, 0) — 1 = chèn, 2 = xóa, 3 = tìm", fixed: 0 },
  ],
  "tree-map": [
    { label: "M — số thao tác", fixed: 1 },
    { label: "Các thao tác (loại, khóa, giá trị) — 1 = chèn, 2 = xóa, 3 = tìm", fixed: 0 },
  ],
  "tree-set": [
    { label: "M — số thao tác", fixed: 1 },
    { label: "Các thao tác (loại, khóa, 0) — 1 = chèn, 2 = xóa, 3 = tìm", fixed: 0 },
  ],
  "two-pointers": [
    { label: "X — tổng mục tiêu", fixed: 1 },
    { label: "Mảng a (đã sắp xếp tăng dần)", fixed: 0 },
  ],
  "sliding-window": [
    { label: "n — số phần tử mảng", fixed: 1, checksArrayLength: true },
    { label: "k — kích thước cửa sổ", fixed: 1 },
    { label: "Mảng a", fixed: 0 },
  ],
  kadane: [{ label: "Mảng a (có thể gồm số âm)", fixed: 0 }],
};
const FALLBACK_FIELDS: InputFieldSpec[] = [{ label: "Mảng a", fixed: 0 }];

/** Split a packed input into one joined-string per field for the text inputs. */
function splitPacked(packed: number[], fields: InputFieldSpec[]): string[] {
  let cursor = 0;
  return fields.map((f) => {
    const count = f.fixed === 0 ? packed.length - cursor : f.fixed;
    const text = packed.slice(cursor, cursor + count).join(", ");
    cursor += count;
    return text;
  });
}

type ParseResult = { packed: number[] } | { error: string };

function parseFields(
  texts: string[],
  fields: InputFieldSpec[],
  maxArray: number,
): ParseResult {
  const packed: number[] = [];
  for (let i = 0; i < fields.length; i++) {
    const f = fields[i];
    const raw = texts[i] ?? "";
    const vals = raw
      .split(/[\s,]+/)
      .filter((s) => s.length > 0)
      .map(Number);
    if (f.fixed === 0) {
      if (vals.length === 0) return { error: "Dòng mảng rỗng — hãy nhập dãy số." };
      if (vals.length > maxArray) return { error: `Mảng quá dài — tối đa ${maxArray} số.` };
      if (vals.some((v) => !Number.isFinite(v)))
        return { error: `Dòng "${f.label}" chứa giá trị không phải số.` };
      packed.push(...vals);
    } else {
      if (vals.length !== 1 || !Number.isFinite(vals[0]))
        return { error: `Trường "${f.label}" cần đúng 1 số.` };
      packed.push(vals[0]);
    }
  }
  const fixedTotal = fields.reduce((s, f) => s + f.fixed, 0);
  const arrayLen = packed.length - fixedTotal;
  for (let i = 0; i < fields.length; i++) {
    if (fields[i].checksArrayLength) {
      if (packed[i] !== arrayLen)
        return { error: `"${fields[i].label}" phải bằng số phần tử mảng (hiện tại ${arrayLen}).` };
      if (arrayLen < 2)
        return { error: `"${fields[i].label}" phải từ 2 trở lên.` };
    }
  }
  if (fixedTotal === 0 && arrayLen < 2) return { error: "Mảng cần ít nhất 2 số." };
  return { packed };
}

export function AlgorithmWorkbench({ slug }: { slug: string }) {
  const algorithm = getAlgorithm(slug);
  const defaultInput = DEFAULT_INPUTS[slug] ?? [6, 2, 9, 4, 1, 7, 3];
  const fields = INPUT_FIELDS[slug] ?? FALLBACK_FIELDS;
  const { load, steps, cursor } = usePlaybackStore();
  const [fieldTexts, setFieldTexts] = useState<string[]>(() => splitPacked(defaultInput, fields));
  const [error, setError] = useState<string | null>(null);
  const fixedTotal = fields.reduce((s, f) => s + f.fixed, 0);

  useEffect(() => {
    load(algorithm, defaultInput);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const step = steps[cursor];

  function applyInput() {
    const maxArray = fixedTotal > 0 || slug === "kadane" ? 60 : 12;
    const result = parseFields(fieldTexts, fields, maxArray);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setError(null);
    load(algorithm, result.packed);
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
        <div className="blueprint-frame rounded-md p-3 flex flex-col gap-2.5">
          <div className="text-[11px] uppercase tracking-widest text-[var(--color-muted)] font-mono-tech">
            Dữ liệu mô phỏng
          </div>
          {fields.map((f, i) =>
            f.fixed === 1 ? (
              <label
                key={f.label}
                className="flex items-center gap-2 text-xs text-[var(--color-muted)] font-mono-tech"
              >
                <span className="w-28 shrink-0">{f.label}</span>
                <input
                  value={fieldTexts[i]}
                  onChange={(e) => {
                    const next = [...fieldTexts];
                    next[i] = e.target.value;
                    setFieldTexts(next);
                  }}
                  className="flex-1 bg-[var(--color-panel-raised)] border border-[var(--color-hairline)] rounded px-2 py-1.5 font-mono-tech text-sm focus:outline-none focus:border-[var(--color-signal-amber)]"
                />
              </label>
            ) : (
              <label
                key={f.label}
                className="flex flex-col gap-1.5 text-xs text-[var(--color-muted)] font-mono-tech"
              >
                <span className="text-[11px] uppercase tracking-widest">{f.label}</span>
                <textarea
                  rows={2}
                  value={fieldTexts[i]}
                  onChange={(e) => {
                    const next = [...fieldTexts];
                    next[i] = e.target.value;
                    setFieldTexts(next);
                  }}
                  className="w-full resize-y bg-[var(--color-panel-raised)] border border-[var(--color-hairline)] rounded px-2 py-1.5 font-mono-tech text-sm focus:outline-none focus:border-[var(--color-signal-amber)]"
                />
              </label>
            ),
          )}
          <div className="flex items-center gap-3">
            <button onClick={applyInput} className="control-btn !text-[var(--color-signal-amber)]">
              Áp dụng
            </button>
            {error && (
              <span className="text-xs text-[var(--color-signal-amber)]">
                {error}
              </span>
            )}
          </div>
        </div>

        {step && <CodePanel code={algorithm.code} activeLine={step.codeLine} />}
      </div>
    </div>
  );
}