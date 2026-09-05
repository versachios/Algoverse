import type { AlgorithmModule, AlgorithmStep } from "./types";

export const code = `int binarySearch(vector<int>& a, int target) {
    int low = 0, high = a.size() - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (a[mid] == target) {
            return mid;
        } else if (a[mid] < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    return -1; // không tìm thấy
}`;

/** Input packing: [target, a0, a1, ...] — a is sorted ascending before the search runs. */
export function* run(input: number[]): Generator<AlgorithmStep, void, unknown> {
  const [target, ...rest] = input;
  const a = [...rest].sort((x, y) => x - y);
  const n = a.length;
  const t = target;
  let low = 0;
  let high = n - 1;
  let comparisons = 0;

  function eliminated() {
    const idxs: number[] = [];
    for (let k = 0; k < low; k++) idxs.push(k);
    for (let k = high + 1; k < n; k++) idxs.push(k);
    return idxs.map((index) => ({ index, role: "eliminated" as const }));
  }

  yield {
    array: [...a],
    highlights: [
      { index: low, role: "pointer", label: "low" },
      { index: high, role: "pointer", label: "high" },
    ],
    codeLine: 2,
    explanation: `Tìm target = ${t} trong mảng đã sắp xếp gồm ${n} phần tử. low = 0, high = ${high}.`,
    stats: { comparisons, target: t },
  };

  while (low <= high) {
    const mid = low + Math.floor((high - low) / 2);
    comparisons++;
    yield {
      array: [...a],
      highlights: [
        ...eliminated(),
        { index: low, role: "pointer", label: "low" },
        { index: high, role: "pointer", label: "high" },
        { index: mid, role: "comparing", label: "mid" },
      ],
      codeLine: 4,
      explanation: `mid = ${mid} → a[mid] = ${a[mid]}. So sánh với target = ${t}.`,
      stats: { comparisons, target: t },
    };

    if (a[mid] === t) {
      yield {
        array: [...a],
        highlights: [...eliminated(), { index: mid, role: "sorted", label: "found" }],
        codeLine: 6,
        explanation: `a[${mid}] = ${t} → tìm thấy target tại vị trí ${mid}!`,
        stats: { comparisons, target: t },
      };
      return;
    } else if (a[mid] < t) {
      low = mid + 1;
      yield {
        array: [...a],
        highlights: [
          ...eliminated(),
          { index: low, role: "pointer", label: "low mới" },
          { index: high, role: "pointer", label: "high" },
        ],
        codeLine: 8,
        explanation: `a[${mid}] = ${a[mid]} < ${t} → loại nửa trái, low = ${low}.`,
        stats: { comparisons, target: t },
      };
    } else {
      high = mid - 1;
      yield {
        array: [...a],
        highlights: [
          ...eliminated(),
          { index: low, role: "pointer", label: "low" },
          { index: high, role: "pointer", label: "high mới" },
        ],
        codeLine: 10,
        explanation: `a[${mid}] = ${a[mid]} > ${t} → loại nửa phải, high = ${high}.`,
        stats: { comparisons, target: t },
      };
    }
  }

  yield {
    array: [...a],
    highlights: eliminated(),
    codeLine: 13,
    explanation: `low > high → không tìm thấy ${t} trong mảng.`,
    stats: { comparisons, target: t },
  };
}

export const binarySearch: AlgorithmModule = {
  meta: {
    slug: "binary-search",
    name: "Binary Search",
    group: "Searching",
    level: "Cơ bản",
    renderMode: "2.5d",
    summary:
      "Tìm kiếm trên mảng đã sắp xếp bằng cách liên tục thu hẹp một nửa phạm vi tìm kiếm — O(log n) thay vì O(n) như tìm kiếm tuyến tính.",
  },
  code,
  run,
};
