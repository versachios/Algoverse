import type { AlgorithmModule, AlgorithmStep, IndexHighlight } from "./types";

export const code = `void heapify(vector<int>& a, int n, int i) {
    int largest = i, l = 2 * i + 1, r = 2 * i + 2;
    if (l < n && a[l] > a[largest]) largest = l;
    if (r < n && a[r] > a[largest]) largest = r;
    if (largest != i) {
        swap(a[i], a[largest]);
        heapify(a, n, largest);
    }
}

void heapSort(vector<int>& a) {
    int n = a.size();
    for (int i = n / 2 - 1; i >= 0; i--) heapify(a, n, i);
    for (int i = n - 1; i > 0; i--) {
        swap(a[0], a[i]);   // đưa max hiện tại về cuối
        heapify(a, i, 0);   // sift-down phần còn lại
    }
}`;

export function* run(input: number[]): Generator<AlgorithmStep, void, unknown> {
  const a = [...input];
  const n = a.length;
  let comparisons = 0;
  let swaps = 0;
  const sortedIdx = new Set<number>();

  function sortedHighlights(extra: IndexHighlight[]): IndexHighlight[] {
    const h: IndexHighlight[] = [];
    for (const idx of sortedIdx) h.push({ index: idx, role: "sorted" });
    return [...h, ...extra];
  }

  yield {
    array: [...a],
    highlights: [],
    codeLine: 11,
    explanation: `Bắt đầu Heap Sort trên ${n} phần tử — xây max-heap rồi lần lượt lấy phần tử lớn nhất ra cuối mảng.`,
    stats: { comparisons, swaps },
  };

  function* heapify(size: number, i: number): Generator<AlgorithmStep, void, unknown> {
    let largest = i;
    const l = 2 * i + 1;
    const r = 2 * i + 2;

    yield {
      array: [...a],
      highlights: sortedHighlights([
        { index: i, role: "pointer", label: "i" },
        ...(l < size ? [{ index: l, role: "comparing" as const }] : []),
        ...(r < size ? [{ index: r, role: "comparing" as const }] : []),
      ]),
      codeLine: 2,
      explanation: `heapify tại nút ${i}: so sánh với con trái${l < size ? ` (${l})` : ""} và con phải${r < size ? ` (${r})` : ""}.`,
      stats: { comparisons, swaps },
    };

    if (l < size) {
      comparisons++;
      if (a[l] > a[largest]) largest = l;
    }
    if (r < size) {
      comparisons++;
      if (a[r] > a[largest]) largest = r;
    }

    if (largest !== i) {
      [a[i], a[largest]] = [a[largest], a[i]];
      swaps++;
      yield {
        array: [...a],
        highlights: sortedHighlights([
          { index: i, role: "swapping" },
          { index: largest, role: "swapping" },
        ]),
        codeLine: 6,
        explanation: `Con lớn hơn cha → đổi chỗ nút ${i} và ${largest}, tiếp tục sift-down.`,
        stats: { comparisons, swaps },
      };
      yield* heapify(size, largest);
    }
  }

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    yield* heapify(n, i);
  }

  yield {
    array: [...a],
    highlights: [],
    codeLine: 14,
    explanation: "Đã xây xong max-heap: mọi nút cha đều lớn hơn hoặc bằng các con. Phần tử a[0] là lớn nhất.",
    stats: { comparisons, swaps },
  };

  for (let i = n - 1; i > 0; i--) {
    [a[0], a[i]] = [a[i], a[0]];
    swaps++;
    sortedIdx.add(i);
    yield {
      array: [...a],
      highlights: sortedHighlights([
        { index: 0, role: "swapping" },
        { index: i, role: "swapping" },
      ]),
      codeLine: 16,
      explanation: `Đổi a[0] = ${a[i]} (gốc heap, lớn nhất còn lại) xuống vị trí cuối ${i}.`,
      stats: { comparisons, swaps },
    };
    yield* heapify(i, 0);
  }

  sortedIdx.add(0);
  yield {
    array: [...a],
    highlights: sortedHighlights([]),
    codeLine: 18,
    explanation: "Hoàn tất! Toàn bộ mảng đã được sắp xếp tăng dần.",
    stats: { comparisons, swaps },
  };
}

export const heapSort: AlgorithmModule = {
  meta: {
    slug: "heap-sort",
    name: "Heap Sort",
    group: "Sorting",
    level: "Cấp 2 - Cấp 3",
    renderMode: "3d",
    summary:
      "Xây một max-heap trên chính mảng (dạng cây nhị phân ẩn trong mảng), rồi lặp lại việc đưa gốc (phần tử lớn nhất) về cuối và sift-down lại phần còn lại. Luôn O(n log n), sắp xếp tại chỗ.",
  },
  code,
  run,
};
