export interface CatalogueEntry {
  slug: string;
  name: string;
  group: string;
  level: "Cơ bản" | "Cấp 2 - Cấp 3" | "Olympiad";
  renderMode: "3d" | "2.5d";
  ready: boolean;
}

export const catalogue: CatalogueEntry[] = [
  { slug: "bubble-sort", name: "Bubble Sort", group: "Sorting", level: "Cơ bản", renderMode: "3d", ready: true },
  { slug: "selection-sort", name: "Selection Sort", group: "Sorting", level: "Cơ bản", renderMode: "3d", ready: true },
  { slug: "insertion-sort", name: "Insertion Sort", group: "Sorting", level: "Cơ bản", renderMode: "3d", ready: true },
  { slug: "linear-search", name: "Linear Search", group: "Searching", level: "Cơ bản", renderMode: "2.5d", ready: true },
  { slug: "binary-search", name: "Binary Search", group: "Searching", level: "Cơ bản", renderMode: "2.5d", ready: true },
  { slug: "stack-queue-linked-list", name: "Stack / Queue / Linked List", group: "Data Structures", level: "Cơ bản", renderMode: "2.5d", ready: false },
  { slug: "two-pointers", name: "Two Pointers", group: "Two Pointers", level: "Cấp 2 - Cấp 3", renderMode: "2.5d", ready: false },
  { slug: "sliding-window", name: "Sliding Window", group: "Two Pointers", level: "Cấp 2 - Cấp 3", renderMode: "2.5d", ready: false },
  { slug: "kadane", name: "Kadane's Algorithm", group: "Two Pointers", level: "Cấp 2 - Cấp 3", renderMode: "2.5d", ready: false },
  { slug: "prefix-sum", name: "Prefix Sum / Difference Array", group: "Two Pointers", level: "Cấp 2 - Cấp 3", renderMode: "2.5d", ready: false },
  { slug: "binary-search-on-answer", name: "Binary Search trên đáp án", group: "Searching", level: "Cấp 2 - Cấp 3", renderMode: "2.5d", ready: false },
  { slug: "quick-merge-heap-sort", name: "Quick / Merge / Heap Sort", group: "Sorting", level: "Cấp 2 - Cấp 3", renderMode: "3d", ready: false },
  { slug: "recursion-backtracking", name: "Recursion & Backtracking", group: "Sorting", level: "Cấp 2 - Cấp 3", renderMode: "3d", ready: false },
  { slug: "graph-bfs-dfs", name: "Graph: BFS / DFS", group: "Graph", level: "Olympiad", renderMode: "3d", ready: false },
  { slug: "dijkstra-astar", name: "Dijkstra / A*", group: "Graph", level: "Olympiad", renderMode: "3d", ready: false },
  { slug: "union-find", name: "Union-Find / DSU", group: "Graph", level: "Olympiad", renderMode: "3d", ready: false },
  { slug: "bst-avl", name: "BST / AVL Rotation", group: "Tree", level: "Olympiad", renderMode: "3d", ready: false },
  { slug: "segment-fenwick-tree", name: "Segment Tree / Fenwick Tree", group: "Tree", level: "Olympiad", renderMode: "3d", ready: false },
  { slug: "dp-knapsack-lcs-lis", name: "DP: Knapsack / LCS / LIS", group: "DP", level: "Olympiad", renderMode: "3d", ready: false },
  { slug: "big-o-playground", name: "Big-O Playground", group: "DP", level: "Cơ bản", renderMode: "3d", ready: false },
];

export const groups = Array.from(new Set(catalogue.map((c) => c.group)));
export const levels: CatalogueEntry["level"][] = ["Cơ bản", "Cấp 2 - Cấp 3", "Olympiad"];
