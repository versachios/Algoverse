/**
 * Core contract every algorithm module follows.
 *
 * An algorithm is a *generator function*: each `yield` produces an
 * immutable snapshot of state. Render components (2D or 3D) are dumb —
 * they only ever read the latest snapshot from the Player/store, they
 * never contain algorithm logic themselves. This keeps "what the
 * algorithm does" and "how it looks" fully decoupled, so the same
 * generator could power a 3D bar chart today and a 2D row view later.
 */

export type RenderMode = "3d" | "2.5d";

/** One highlighted region of the array for a given step. */
export type IndexRole =
  | "default"
  | "comparing"
  | "swapping"
  | "sorted"
  | "pointer"
  | "eliminated";

export interface IndexHighlight {
  index: number;
  role: IndexRole;
  label?: string; // e.g. "i", "j", "left", "right"
}

/** A single snapshot yielded by an algorithm generator (array-shaped data: sorts, searches). */
export interface ArrayStep {
  /** Full array state at this point in time. */
  array: number[];
  /** Which indices to highlight, and how. */
  highlights: IndexHighlight[];
  /** 1-based line number in the displayed source that this step maps to. */
  codeLine: number;
  /** Short human-readable explanation of what's happening right now. */
  explanation: string;
  /** Optional counters to surface in the instrument panel. */
  stats?: Record<string, number>;
}

/** Node role for tree-shaped algorithms (BST, AVL, Min-Heap). */
export type TreeNodeRole =
  | "idle"
  | "comparing"
  | "path"
  | "found"
  | "inserted"
  | "flagged" // e.g. marked for deletion, or an imbalanced AVL node
  | "highlight"; // e.g. rotation pivot, heap sift target

export interface TreeNodeData {
  id: string;
  value: number;
  left: string | null;
  right: string | null;
}

/** A single snapshot for tree-shaped algorithms. Shares codeLine/explanation/stats
 *  with ArrayStep so CodePanel/StepTrace work unchanged; `highlights` stays empty
 *  since tick-coloring in StepTrace is index-based and doesn't apply here. */
export interface TreeStep {
  kind: "tree";
  nodes: Record<string, TreeNodeData>;
  rootId: string | null;
  nodeStates: Record<string, TreeNodeRole>;
  edgeHighlight?: [string, string] | null;
  highlights: IndexHighlight[]; // always [] — kept for StepTrace compatibility
  codeLine: number;
  explanation: string;
  stats?: Record<string, number>;
}

/** Cell role for grid-shaped algorithms (DP tables). */
export type GridCellRole = "idle" | "computing" | "source" | "filled";

/** A single snapshot for grid-shaped algorithms (2D DP tables). */
export interface GridStep {
  kind: "grid";
  grid: number[][];
  cellStates: Record<string, GridCellRole>; // key = `${row}-${col}`
  highlights: IndexHighlight[]; // always [] — kept for StepTrace compatibility
  codeLine: number;
  explanation: string;
  stats?: Record<string, number>;
}

export type AlgorithmStep = ArrayStep | TreeStep | GridStep;

/** Runtime guards — ArrayStep is the implicit default (no `kind` field) so the
 *  5 existing array algorithms never needed editing when this union was introduced. */
export function isTreeStep(step: AlgorithmStep): step is TreeStep {
  return (step as TreeStep).kind === "tree";
}
export function isGridStep(step: AlgorithmStep): step is GridStep {
  return (step as GridStep).kind === "grid";
}

export interface AlgorithmMeta {
  slug: string;
  name: string;
  group: "Sorting" | "Searching" | "Two Pointers" | "Graph" | "Tree" | "DP" | "Data Structures";
  level: "Cơ bản" | "Cấp 2 - Cấp 3" | "Olympiad";
  renderMode: RenderMode;
  summary: string;
}

export interface AlgorithmModule {
  meta: AlgorithmMeta;
  /** The C++ source shown in the code panel; codeLine in steps indexes into this, split by "\n". */
  code: string;
  /** Builds the generator for a given input. For tree/heap algorithms, `input` is the
   *  sequence of values to insert in order. For DP algorithms, see each module's own
   *  doc comment for how it packs extra parameters (e.g. capacity) into the array. */
  run: (input: number[]) => Generator<AlgorithmStep, void, unknown>;
}
