import { bubbleSort } from "./bubble-sort";
import { selectionSort } from "./selection-sort";
import { insertionSort } from "./insertion-sort";
import { binarySearch } from "./binary-search";
import { linearSearch } from "./linear-search";
import { bst } from "./bst";
import { avlTree } from "./avl-tree";
import { minHeap } from "./min-heap";
import { knapsack } from "./knapsack";
import type { AlgorithmModule } from "./types";

export const algorithmRegistry: Record<string, AlgorithmModule> = {
  "bubble-sort": bubbleSort,
  "selection-sort": selectionSort,
  "insertion-sort": insertionSort,
  "binary-search": binarySearch,
  "linear-search": linearSearch,
  bst,
  "avl-tree": avlTree,
  "min-heap": minHeap,
  knapsack,
};

export function getAlgorithm(slug: string): AlgorithmModule {
  const mod = algorithmRegistry[slug];
  if (!mod) throw new Error(`Unknown algorithm slug: ${slug}`);
  return mod;
}
