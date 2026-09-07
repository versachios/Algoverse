export type Category = "Cấu trúc dữ liệu" | "Giải thuật";

/** A sub-lesson inside a Master-Detail lesson group (see `subLessons` below). */
export interface SubLesson {
  slug: string;
  name: string;
  ready: boolean;
}

export interface CatalogueEntry {
  slug: string;
  name: string;
  group: string;
  category: Category;
  level: "Cơ bản" | "Cấp 2 - Cấp 3" | "Olympiad";
  renderMode: "3d" | "2.5d";
  ready: boolean;
  /** If set, the card/graph preview renders this slug's algorithm instead of
   *  `slug` itself — used by Master-Detail group entries whose own slug has
   *  no runnable algorithm (it renders the group's theory + sidebar instead). */
  previewSlug?: string;
  /** If set, this entry is a Master-Detail lesson group: its own page shows
   *  general theory by default, and the sidebar lists these sub-lessons —
   *  each a real algorithm reachable at `/algorithms/${slug}/${sub.slug}`. */
  subLessons?: SubLesson[];
}

/** Display-only override for a catalogue `group` value — lets a group's
 *  internal identifier (used for routing/orbits) differ from the label shown
 *  on cards, so renaming what's shown never touches data/routing. */
const GROUP_LABELS: Record<string, string> = {
  "Two Pointers": "Array Techniques",
  Sorting: "Array Techniques",
};

export function groupLabel(group: string): string {
  return GROUP_LABELS[group] ?? group;
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
  {
    slug: "sorting",
    name: "Các kỹ thuật sort",
    group: "Sorting",
    category: "Giải thuật",
    level: "Cơ bản",
    renderMode: "3d",
    ready: true,
    previewSlug: "bubble-sort",
    subLessons: [
      { slug: "bubble-sort", name: "Bubble Sort", ready: true },
      { slug: "selection-sort", name: "Selection Sort", ready: true },
      { slug: "insertion-sort", name: "Insertion Sort", ready: true },
    ],
  },
  {
    slug: "quick-merge-heap-sort",
    name: "Quick / Merge / Heap Sort",
    group: "Sorting",
    category: "Giải thuật",
    level: "Cấp 2 - Cấp 3",
    renderMode: "3d",
    ready: true,
    previewSlug: "quick-sort",
    subLessons: [
      { slug: "quick-sort", name: "Quick Sort", ready: true },
      { slug: "merge-sort", name: "Merge Sort", ready: true },
      { slug: "heap-sort", name: "Heap Sort", ready: true },
    ],
  },
  { slug: "recursion-backtracking", name: "Recursion & Backtracking", group: "Sorting", category: "Giải thuật", level: "Cấp 2 - Cấp 3", renderMode: "3d", ready: false },

  // ---- Giải thuật: Tìm kiếm ----
  { slug: "linear-search", name: "Linear Search", group: "Searching", category: "Giải thuật", level: "Cơ bản", renderMode: "2.5d", ready: true },
  { slug: "binary-search", name: "Binary Search", group: "Searching", category: "Giải thuật", level: "Cơ bản", renderMode: "2.5d", ready: true },
  { slug: "binary-search-on-answer", name: "Binary Search trên đáp án", group: "Searching", category: "Giải thuật", level: "Cấp 2 - Cấp 3", renderMode: "2.5d", ready: false },

  // ---- Giải thuật: Hai con trỏ ----
  {
    slug: "two-pointers",
    name: "Two Pointers",
    group: "Two Pointers",
    category: "Giải thuật",
    level: "Cấp 2 - Cấp 3",
    renderMode: "2.5d",
    ready: true,
    previewSlug: "two-pointers-converging",
    subLessons: [
      { slug: "two-pointers-two-arrays", name: "2 mảng", ready: true },
      { slug: "two-pointers-converging", name: "1 mảng, ngược chiều", ready: true },
      { slug: "two-pointers-same-direction", name: "1 mảng, cùng chiều", ready: true },
    ],
  },
  { slug: "sliding-window", name: "Sliding Window", group: "Two Pointers", category: "Giải thuật", level: "Cấp 2 - Cấp 3", renderMode: "2.5d", ready: true },
  { slug: "kadane", name: "Kadane's Algorithm", group: "Two Pointers", category: "Giải thuật", level: "Cấp 2 - Cấp 3", renderMode: "2.5d", ready: true },
  { slug: "prefix-sum", name: "Prefix Sum / Difference Array", group: "Two Pointers", category: "Giải thuật", level: "Cấp 2 - Cấp 3", renderMode: "2.5d", ready: false },

  // ---- Giải thuật: Đồ thị ----
  { slug: "bfs", name: "BFS — Duyệt theo bề rộng", group: "Graph", category: "Giải thuật", level: "Olympiad", renderMode: "3d", ready: true },
  { slug: "dfs", name: "DFS — Duyệt theo chiều sâu", group: "Graph", category: "Giải thuật", level: "Olympiad", renderMode: "3d", ready: true },
  { slug: "dijkstra", name: "Dijkstra (Đường đi ngắn nhất)", group: "Graph", category: "Giải thuật", level: "Olympiad", renderMode: "3d", ready: true },

  // ---- Giải thuật: Quy hoạch động ----
  {
    slug: "dp",
    name: "Quy hoạch động (DP)",
    group: "DP",
    category: "Giải thuật",
    level: "Olympiad",
    renderMode: "3d",
    ready: true,
    previewSlug: "knapsack",
    subLessons: [
      { slug: "lis", name: "LIS — Dãy con tăng dài nhất", ready: true },
      { slug: "lcs", name: "LCS — Dãy con chung dài nhất", ready: true },
      { slug: "knapsack", name: "0/1 Knapsack", ready: true },
    ],
  },
  { slug: "big-o-playground", name: "Big-O Playground", group: "DP", category: "Giải thuật", level: "Cơ bản", renderMode: "3d", ready: false },
];

export const groups = Array.from(new Set(catalogue.map((c) => c.group)));
export const levels: CatalogueEntry["level"][] = ["Cơ bản", "Cấp 2 - Cấp 3", "Olympiad"];
export const categories: Category[] = ["Cấu trúc dữ liệu", "Giải thuật"];
