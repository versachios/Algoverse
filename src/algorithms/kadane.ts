import type { AlgorithmModule, AlgorithmStep } from "./types";

export const code = `// tổng lớn nhất của dãy con liên tiếp (Kadane)
int kadane(vector<int>& a) {
    int cur = 0, best = INT_MIN;
    for (int x : a) {
        cur = max(x, cur + x); // hoặc bắt đầu dãy mới từ x
        best = max(best, cur);
    }
    return best;
}`;

export function* run(input: number[]): Generator<AlgorithmStep, void, unknown> {
  const a = [...input];
  let cur = 0;
  let best = Number.NEGATIVE_INFINITY;

  yield {
    array: [...a],
    highlights: [],
    codeLine: 2,
    explanation: `Kadane: cur = tổng tốt nhất kết thúc tại vị trí hiện tại, best = tổng lớn nhất toàn cục. Khởi tạo cur = 0, best = -∞.`,
    stats: { cur, best: -999999 },
  };

  for (let i = 0; i < a.length; i++) {
    const x = a[i];
    const prevCur = cur;
    yield {
      array: [...a],
      highlights: [{ index: i, role: "pointer", label: "i" }],
      codeLine: 3,
      explanation: `Xét a[${i}] = ${x}: bắt đầu dãy mới (${x}) hay nối tiếp (cur + x = ${prevCur + x})?`,
      stats: { cur, best },
    };
    cur = Math.max(x, prevCur + x);
    best = Math.max(best, cur);
    yield {
      array: [...a],
      highlights: [{ index: i, role: "sorted", label: "i" }],
      codeLine: 4,
      explanation: `cur = max(${x}, ${prevCur} + ${x}) → cur = ${cur}, best = ${best}.`,
      stats: { cur, best },
    };
  }

  yield {
    array: [...a],
    highlights: [],
    codeLine: 5,
    explanation: `Hoàn tất — tổng dãy con liên tiếp lớn nhất là ${best}.`,
    stats: { cur, best },
  };
}

export const kadane: AlgorithmModule = {
  meta: {
    slug: "kadane",
    name: "Kadane's Algorithm",
    group: "Two Pointers",
    level: "Cấp 2 - Cấp 3",
    renderMode: "2.5d",
    summary:
      "Tìm tổng lớn nhất của dãy con liên tiếp trong mảng một chiều trong O(n) với thuật toán Kadane.",
  },
  code,
  run,
};
