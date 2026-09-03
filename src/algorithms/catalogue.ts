export type Category = "Cấu trúc dữ liệu" | "Giải thuật";

export interface CatalogueEntry {
  slug: string;
  name: string;
  group: string;
  category: Category;
  level: "Cơ bản" | "Cấp 2 - Cấp 3" | "Olympiad";
  renderMode: "3d" | "2.5d";
  ready: boolean;
}

export const catalogue: CatalogueEntry[] = [
  // ---- Cấu trúc dữ liệu ----
  { slug: "unordered-map", name: "Hash Map (unordered_map)", group: "Data Structures", category: "Cấu trúc dữ liệu", level: "Cấp 2 - Cấp 3", renderMode: "3d", ready: true },
  { slug: "unordered-set", name: "Hash Set (unordered_set)", group: "Data Structures", category: "Cấu trúc dữ liệu", level: "Cấp 2 - Cấp 3", renderMode: "3d", ready: true },
  { slug: "tree-map", name: "Tree Map (std::map)", group: "Data Structures", category: "Cấu trúc dữ liệu", level: "Cấp 2 - Cấp 3", renderMode: "3d", ready: true },
  { slug: "tree-set", name: "Tree Set (std::set)", group: "Data Structures", category: "Cấu trúc dữ liệu", level: "Cấp 2 - Cấp 3", renderMode: "3d", ready: true },
  { slug: "stack-queue-linked-list", name: "Stack / Queue / Linked List", group: "Data Structures", category: "Cấu trúc dữ liệu", level: "Cơ bản", renderMode: "2.5d", ready: false },
  { slug: "union-find", name: "Union-Find / DSU", group: "Data Structures", category: "Cấu trúc dữ liệu", level: "Olympiad", renderMode: "3d", ready: true },
  { slug: "bst", name: "Binary Search Tree", group: "Tree", category: "Cấu trúc dữ liệu", level: "Olympiad", renderMode: "3d", ready: true },
  { slug: "avl-tree", name: "AVL Tree", group: "Tree", category: "Cấu trúc dữ liệu", level: "Olympiad", renderMode: "3d", ready: true },
  { slug: "min-heap", name: "Min-Heap", group: "Tree", category: "Cấu trúc dữ liệu", level: "Olympiad", renderMode: "3d", ready: true },
  { slug: "segment-fenwick-tree", name: "Segment Tree / Fenwick Tree", group: "Tree", category: "Cấu trúc dữ liệu", level: "Olympiad", renderMode: "3d", ready: false },

  // ---- Giải thuật: Sắp xếp ----
  { slug: "bubble-sort", name: "Bubble Sort", group: "Sorting", category: "Giải thuật", level: "Cơ bản", renderMode: "3d", ready: true },
  { slug: "selection-sort", name: "Selection Sort", group: "Sorting", category: "Giải thuật", level: "Cơ bản", renderMode: "3d", ready: true },
  { slug: "insertion-sort", name: "Insertion Sort", group: "Sorting", category: "Giải thuật", level: "Cơ bản", renderMode: "3d", ready: true },
  { slug: "quick-merge-heap-sort", name: "Quick / Merge / Heap Sort", group: "Sorting", category: "Giải thuật", level: "Cấp 2 - Cấp 3", renderMode: "3d", ready: false },
  { slug: "recursion-backtracking", name: "Recursion & Backtracking", group: "Sorting", category: "Giải thuật", level: "Cấp 2 - Cấp 3", renderMode: "3d", ready: false },

  // ---- Giải thuật: Tìm kiếm ----
  { slug: "linear-search", name: "Linear Search", group: "Searching", category: "Giải thuật", level: "Cơ bản", renderMode: "2.5d", ready: true },
  { slug: "binary-search", name: "Binary Search", group: "Searching", category: "Giải thuật", level: "Cơ bản", renderMode: "2.5d", ready: true },
  { slug: "binary-search-on-answer", name: "Binary Search trên đáp án", group: "Searching", category: "Giải thuật", level: "Cấp 2 - Cấp 3", renderMode: "2.5d", ready: false },

  // ---- Giải thuật: Hai con trỏ ----
  { slug: "two-pointers", name: "Two Pointers (Tìm cặp tổng)", group: "Two Pointers", category: "Giải thuật", level: "Cấp 2 - Cấp 3", renderMode: "2.5d", ready: true },
  { slug: "sliding-window", name: "Sliding Window", group: "Two Pointers", category: "Giải thuật", level: "Cấp 2 - Cấp 3", renderMode: "2.5d", ready: true },
  { slug: "kadane", name: "Kadane's Algorithm", group: "Two Pointers", category: "Giải thuật", level: "Cấp 2 - Cấp 3", renderMode: "2.5d", ready: true },
  { slug: "prefix-sum", name: "Prefix Sum / Difference Array", group: "Two Pointers", category: "Giải thuật", level: "Cấp 2 - Cấp 3", renderMode: "2.5d", ready: false },

  // ---- Giải thuật: Đồ thị ----
  { slug: "bfs", name: "BFS — Duyệt theo bề rộng", group: "Graph", category: "Giải thuật", level: "Olympiad", renderMode: "3d", ready: true },
  { slug: "dfs", name: "DFS — Duyệt theo chiều sâu", group: "Graph", category: "Giải thuật", level: "Olympiad", renderMode: "3d", ready: true },
  { slug: "dijkstra", name: "Dijkstra (Đường đi ngắn nhất)", group: "Graph", category: "Giải thuật", level: "Olympiad", renderMode: "3d", ready: true },

  // ---- Giải thuật: Quy hoạch động ----
  { slug: "knapsack", name: "0/1 Knapsack", group: "DP", category: "Giải thuật", level: "Olympiad", renderMode: "3d", ready: true },
  { slug: "lcs-lis", name: "DP: LCS / LIS", group: "DP", category: "Giải thuật", level: "Olympiad", renderMode: "3d", ready: false },
  { slug: "big-o-playground", name: "Big-O Playground", group: "DP", category: "Giải thuật", level: "Cơ bản", renderMode: "3d", ready: false },
];

export const groups = Array.from(new Set(catalogue.map((c) => c.group)));
export const levels: CatalogueEntry["level"][] = ["Cơ bản", "Cấp 2 - Cấp 3", "Olympiad"];
export const categories: Category[] = ["Cấu trúc dữ liệu", "Giải thuật"];
