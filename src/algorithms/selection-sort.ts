import type { AlgorithmModule, AlgorithmStep, IndexHighlight } from "./types";

export const code = `void selectionSort(vector<int>& a) {
    int n = a.size();
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (a[j] < a[minIdx]) {
                minIdx = j;
            }
        }
        if (minIdx != i) {
            swap(a[i], a[minIdx]);
        }
    }
}`;

function sortedTail(n: number, from: number): IndexHighlight[] {
  const out: IndexHighlight[] = [];
  for (let k = 0; k < from; k++) out.push({ index: k, role: "sorted" });
  return out;
}

export function* run(input: number[]): Generator<AlgorithmStep, void, unknown> {
  const a = [...input];
  const n = a.length;
  let comparisons = 0;
  let swaps = 0;

  yield {
    array: [...a],
    highlights: [],
    codeLine: 2,
    explanation: `Selection Sort sẽ chọn phần tử nhỏ nhất trong phần chưa sắp xếp và đặt vào đầu, lặp lại ${n - 1} lần.`,
    stats: { comparisons, swaps },
  };

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    yield {
      array: [...a],
      highlights: [...sortedTail(n, i), { index: i, role: "pointer", label: "min" }],
      codeLine: 4,
      explanation: `Giả sử a[${i}] = ${a[i]} là nhỏ nhất trong phần còn lại.`,
      stats: { comparisons, swaps },
    };

    for (let j = i + 1; j < n; j++) {
      comparisons++;
      yield {
        array: [...a],
        highlights: [
          ...sortedTail(n, i),
          { index: minIdx, role: "pointer", label: "min" },
          { index: j, role: "comparing", label: "j" },
        ],
        codeLine: 6,
        explanation: `So sánh a[${j}] = ${a[j]} với ứng viên nhỏ nhất hiện tại a[${minIdx}] = ${a[minIdx]}.`,
        stats: { comparisons, swaps },
      };
      if (a[j] < a[minIdx]) {
        minIdx = j;
        yield {
          array: [...a],
          highlights: [...sortedTail(n, i), { index: minIdx, role: "pointer", label: "min mới" }],
          codeLine: 7,
          explanation: `Tìm thấy giá trị nhỏ hơn: a[${j}] = ${a[j]} → cập nhật vị trí nhỏ nhất.`,
          stats: { comparisons, swaps },
        };
      }
    }

    if (minIdx !== i) {
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
      swaps++;
      yield {
        array: [...a],
        highlights: [...sortedTail(n, i), { index: i, role: "swapping" }, { index: minIdx, role: "swapping" }],
        codeLine: 11,
        explanation: `Đổi chỗ a[${i}] với phần tử nhỏ nhất tìm được ở vị trí ${minIdx}.`,
        stats: { comparisons, swaps },
      };
    }

    yield {
      array: [...a],
      highlights: sortedTail(n, i + 1),
      codeLine: 1,
      explanation: `Vị trí ${i} đã cố định giá trị đúng: ${a[i]}.`,
      stats: { comparisons, swaps },
    };
  }

  yield {
    array: [...a],
    highlights: sortedTail(n, n),
    codeLine: 1,
    explanation: "Hoàn tất! Mảng đã sắp xếp tăng dần.",
    stats: { comparisons, swaps },
  };
}

export const selectionSort: AlgorithmModule = {
  meta: {
    slug: "selection-sort",
    name: "Selection Sort",
    group: "Sorting",
    level: "Cơ bản",
    renderMode: "3d",
    summary:
      "Lặp lại việc tìm phần tử nhỏ nhất trong phần chưa sắp xếp rồi đặt vào đầu — luôn O(n²), nhưng số lần đổi chỗ tối thiểu (tối đa n-1 lần).",
  },
  code,
  run,
};
