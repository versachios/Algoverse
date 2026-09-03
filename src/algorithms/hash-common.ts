import type { AlgorithmStep, HashBucketItem, HashCellRole } from "./types";

export function hashFn(key: number, numBuckets: number): number {
  return ((key % numBuckets) + numBuckets) % numBuckets;
}

export function hashStep(
  numBuckets: number,
  buckets: HashBucketItem[][],
  cellStates: Record<string, HashCellRole>,
  codeLine: number,
  explanation: string,
  stats: Record<string, number>
): AlgorithmStep {
  return {
    kind: "hash",
    numBuckets,
    buckets: buckets.map((b) => [...b]),
    cellStates,
    highlights: [],
    codeLine,
    explanation,
    stats,
  };
}
