import type { AlgorithmModule, AlgorithmStep } from "./types";

export const code = `int linearSearch(vector<int>& a, int target) {
    for (int i = 0; i < a.size(); i++) {
        if (a[i] == target) {
            return i;
        }
    }
    return -1; // không tìm thấy
}`;

/** Input packing: [target, a0, a1, ...]. */
export function* run(input: number[]): Generator<AlgorithmStep, void, unknown> {
  const [target, ...rest] = input;
  const a = [...rest];
  const n = a.length;
  const t = target;
  let comparisons = 0;

  yield {
    array: [...a],
    highlights: [],
    codeLine: 2,
    explanation: `Tìm target = ${t} bằng cách quét từ trái sang phải, không cần mảng đã sắp xếp.`,
    stats: { comparisons, target: t },
  };

  for (let i = 0; i < n; i++) {
    comparisons++;
    yield {
      array: [...a],
      highlights: [{ index: i, role: "comparing", label: "i" }],
      codeLine: 3,
      explanation: `So sánh a[${i}] = ${a[i]} với target = ${t}.`,
      stats: { comparisons, target: t },
    };

    if (a[i] === t) {
      yield {
        array: [...a],
        highlights: [{ index: i, role: "sorted", label: "found" }],
        codeLine: 4,
        explanation: `a[${i}] = ${t} → tìm thấy tại vị trí ${i}!`,
        stats: { comparisons, target: t },
      };
      return;
    }
  }

  yield {
    array: [...a],
    highlights: a.map((_, i) => ({ index: i, role: "eliminated" as const })),
    codeLine: 7,
    explanation: `Đã quét hết mảng, không tìm thấy ${t}.`,
    stats: { comparisons, target: t },
  };
}

export const linearSearch: AlgorithmModule = {
  meta: {
    slug: "linear-search",
    name: "Linear Search",
    group: "Searching",
    level: "Cơ bản",
    renderMode: "2.5d",
    summary:
      "Quét tuần tự từng phần tử cho đến khi tìm thấy target — không yêu cầu mảng đã sắp xếp, nhưng chậm hơn Binary Search với mảng lớn.",
  },
  code,
  run,
};
