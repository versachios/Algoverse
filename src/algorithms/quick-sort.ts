import type { AlgorithmModule, AlgorithmStep, IndexHighlight } from "./types";

export const code = `int partition(vector<int>& a, int lo, int hi) {
    int pivot = a[hi]; // chọn phần tử cuối làm pivot
    int i = lo - 1;
    for (int j = lo; j < hi; j++) {
        if (a[j] < pivot) {
            i++;
            swap(a[i], a[j]);
        }
    }
    swap(a[i + 1], a[hi]);
    return i + 1;
}

void quickSort(vector<int>& a, int lo, int hi) {
    if (lo >= hi) return;
    int p = partition(a, lo, hi);
    quickSort(a, lo, p - 1);
    quickSort(a, p + 1, hi);
}`;

function baseHighlights(n: number, sortedIdx: Set<number>, extra: IndexHighlight[]): IndexHighlight[] {
  const sorted: IndexHighlight[] = [];
  for (let k = 0; k < n; k++) if (sortedIdx.has(k)) sorted.push({ index: k, role: "sorted" });
  return [...sorted, ...extra];
}

export function* run(input: number[]): Generator<AlgorithmStep, void, unknown> {
  const a = [...input];
  const n = a.length;
  const sortedIdx = new Set<number>();
  let comparisons = 0;
  let swaps = 0;

  yield {
    array: [...a],
    highlights: [],
    codeLine: 15,
    explanation: `Bắt đầu Quick Sort trên ${n} phần tử — chia để trị quanh một pivot.`,
    stats: { comparisons, swaps },
  };

  function* partition(lo: number, hi: number): Generator<AlgorithmStep, number, unknown> {
    const pivot = a[hi];
    let i = lo - 1;

    yield {
      array: [...a],
      highlights: baseHighlights(n, sortedIdx, [{ index: hi, role: "pointer", label: "pivot" }]),
      codeLine: 2,
      explanation: `Đoạn [${lo}, ${hi}]: chọn pivot = a[${hi}] = ${pivot}.`,
      stats: { comparisons, swaps },
    };

    for (let j = lo; j < hi; j++) {
      comparisons++;
      yield {
        array: [...a],
        highlights: baseHighlights(n, sortedIdx, [
          { index: hi, role: "pointer", label: "pivot" },
          { index: j, role: "comparing", label: "j" },
          ...(i >= lo ? [{ index: i, role: "pointer" as const, label: "i" }] : []),
        ]),
        codeLine: 5,
        explanation: `So sánh a[${j}] = ${a[j]} với pivot ${pivot}.`,
        stats: { comparisons, swaps },
      };

      if (a[j] < pivot) {
        i++;
        [a[i], a[j]] = [a[j], a[i]];
        swaps++;
        yield {
          array: [...a],
          highlights: baseHighlights(n, sortedIdx, [
            { index: hi, role: "pointer", label: "pivot" },
            { index: i, role: "swapping" },
            { index: j, role: "swapping" },
          ]),
          codeLine: 7,
          explanation: `a[${j}] < pivot → đổi chỗ vào vùng "nhỏ hơn pivot" tại i = ${i}.`,
          stats: { comparisons, swaps },
        };
      }
    }

    [a[i + 1], a[hi]] = [a[hi], a[i + 1]];
    swaps++;
    sortedIdx.add(i + 1);
    yield {
      array: [...a],
      highlights: baseHighlights(n, sortedIdx, [{ index: i + 1, role: "sorted" }]),
      codeLine: 10,
      explanation: `Đưa pivot về đúng vị trí ${i + 1} — mọi phần tử bên trái đều nhỏ hơn, bên phải đều lớn hơn hoặc bằng.`,
      stats: { comparisons, swaps },
    };

    return i + 1;
  }

  function* quickSort(lo: number, hi: number): Generator<AlgorithmStep, void, unknown> {
    if (lo >= hi) {
      if (lo === hi) sortedIdx.add(lo);
      return;
    }
    const p = yield* partition(lo, hi);
    yield* quickSort(lo, p - 1);
    yield* quickSort(p + 1, hi);
  }

  yield* quickSort(0, n - 1);

  for (let k = 0; k < n; k++) sortedIdx.add(k);
  yield {
    array: [...a],
    highlights: baseHighlights(n, sortedIdx, []),
    codeLine: 18,
    explanation: "Hoàn tất! Toàn bộ mảng đã được sắp xếp tăng dần.",
    stats: { comparisons, swaps },
  };
}

export const quickSort: AlgorithmModule = {
  meta: {
    slug: "quick-sort",
    name: "Quick Sort",
    group: "Sorting",
    level: "Cấp 2 - Cấp 3",
    renderMode: "3d",
    summary:
      "Chia để trị: chọn một pivot, phân hoạch mảng thành 'nhỏ hơn pivot' và 'lớn hơn/bằng pivot', rồi đệ quy lên từng nửa. Trung bình O(n log n), xấu nhất O(n²).",
  },
  code,
  run,
};
