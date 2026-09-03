import { bubbleSort } from "./bubble-sort";
import { selectionSort } from "./selection-sort";
import { insertionSort } from "./insertion-sort";
import { binarySearch } from "./binary-search";
import { linearSearch } from "./linear-search";
import { bst } from "./bst";
import { avlTree } from "./avl-tree";
import { minHeap } from "./min-heap";
import { knapsack } from "./knapsack";
import { dijkstra } from "./dijkstra";
import { bfs } from "./bfs";
import { dfs } from "./dfs";
import { unionFind } from "./union-find";
import { unorderedMap } from "./unordered-map";
import { unorderedSet } from "./unordered-set";
import { treeMap } from "./tree-map";
import { treeSet } from "./tree-set";
import { twoPointers } from "./two-pointers";
import { slidingWindow } from "./sliding-window";
import { kadane } from "./kadane";
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
  dijkstra,
  bfs,
  dfs,
  "union-find": unionFind,
  "unordered-map": unorderedMap,
  "unordered-set": unorderedSet,
  "tree-map": treeMap,
  "tree-set": treeSet,
  "two-pointers": twoPointers,
  "sliding-window": slidingWindow,
  kadane,
};

export function getAlgorithm(slug: string): AlgorithmModule {
  const mod = algorithmRegistry[slug];
  if (!mod) throw new Error(`Unknown algorithm slug: ${slug}`);
  return mod;
}
