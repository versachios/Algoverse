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

/** A single snapshot yielded by an algorithm generator. */
export interface AlgorithmStep {
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
  /** Builds the generator for a given input array. */
  run: (input: number[]) => Generator<AlgorithmStep, void, unknown>;
}
