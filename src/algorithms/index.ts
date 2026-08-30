import { bubbleSort } from "./bubble-sort";
import { selectionSort } from "./selection-sort";
import { insertionSort } from "./insertion-sort";
import { binarySearch } from "./binary-search";
import { linearSearch } from "./linear-search";
import type { AlgorithmModule } from "./types";

export const algorithmRegistry: Record<string, AlgorithmModule> = {
  "bubble-sort": bubbleSort,
  "selection-sort": selectionSort,
  "insertion-sort": insertionSort,
  "binary-search": binarySearch,
  "linear-search": linearSearch,
};

export function getAlgorithm(slug: string): AlgorithmModule {
  const mod = algorithmRegistry[slug];
  if (!mod) throw new Error(`Unknown algorithm slug: ${slug}`);
  return mod;
}
