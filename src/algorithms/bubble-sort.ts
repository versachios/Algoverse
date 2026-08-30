import type { AlgorithmModule, AlgorithmStep, IndexHighlight } from "./types";

export const code = `void bubbleSort(vector<int>& a) {
    int n = a.size();
    for (int i = 0; i < n - 1; i++) {
        bool swapped = false;
        for (int j = 0; j < n - 1 - i; j++) {
            if (a[j] > a[j + 1]) {
                swap(a[j], a[j + 1]);
                swapped = true;
            }
        }
        if (!swapped) break; // mảng đã sắp xếp xong sớm
    }
}`;

function highlightsFor(
  n: number,
  sortedFrom: number,
  extra: IndexHighlight[]
): IndexHighlight[] {
  const sorted: IndexHighlight[] = [];
  for (let k = sortedFrom; k < n; k++) sorted.push({ index: k, role: "sorted" });
  return [...sorted, ...extra];
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
    explanation: `Bắt đầu với mảng gồm ${n} phần tử. Bubble Sort sẽ "sủi bọt" phần tử lớn nhất về cuối mỗi vòng.`,
    stats: { comparisons, swaps },
  };

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    yield {
      array: [...a],
      highlights: highlightsFor(n, n - i, []),
      codeLine: 4,
      explanation: `Vòng lặp ngoài i = ${i}: sẽ đẩy phần tử lớn nhất còn lại về vị trí ${n - 1 - i}.`,
      stats: { comparisons, swaps },
    };

    for (let j = 0; j < n - 1 - i; j++) {
      comparisons++;
      yield {
        array: [...a],
        highlights: highlightsFor(n, n - i, [
          { index: j, role: "comparing", label: "j" },
          { index: j + 1, role: "comparing", label: "j+1" },
        ]),
        codeLine: 6,
        explanation: `So sánh a[${j}] = ${a[j]} và a[${j + 1}] = ${a[j + 1]}.`,
        stats: { comparisons, swaps },
      };

      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swaps++;
        swapped = true;
        yield {
          array: [...a],
          highlights: highlightsFor(n, n - i, [
            { index: j, role: "swapping", label: "j" },
            { index: j + 1, role: "swapping", label: "j+1" },
          ]),
          codeLine: 7,
          explanation: `${a[j + 1]} > ${a[j]} → đổi chỗ hai phần tử.`,
          stats: { comparisons, swaps },
        };
      }
    }

    if (!swapped) {
      yield {
        array: [...a],
        highlights: highlightsFor(n, 0, []),
        codeLine: 11,
        explanation: "Không có lần đổi chỗ nào ở vòng này → mảng đã sắp xếp xong, thoát sớm.",
        stats: { comparisons, swaps },
      };
      break;
    }
  }

  yield {
    array: [...a],
    highlights: highlightsFor(n, 0, []),
    codeLine: 13,
    explanation: "Hoàn tất! Mảng đã được sắp xếp tăng dần.",
    stats: { comparisons, swaps },
  };
}

export const bubbleSort: AlgorithmModule = {
  meta: {
    slug: "bubble-sort",
    name: "Bubble Sort",
    group: "Sorting",
    level: "Cơ bản",
    renderMode: "3d",
    summary:
      "Thuật toán sắp xếp cơ bản: lặp lại việc so sánh và đổi chỗ hai phần tử liền kề để 'sủi bọt' giá trị lớn nhất về cuối mảng sau mỗi vòng.",
  },
  code,
  run,
};
