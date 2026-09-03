import type { AlgorithmModule, AlgorithmStep, IndexHighlight } from "./types";

export const code = `// tổng lớn nhất của dãy con liên tiếp độ dài K
int maxWindow(vector<int>& a, int k) {
    long long sum = 0;
    for (int i = 0; i < k; i++) sum += a[i];  // cửa sổ đầu tiên
    long long best = sum;
    for (int i = k; i < a.size(); i++) {
        sum += a[i] - a[i - k];               // trượt cửa sổ: bỏ cũ, thêm mới
        best = max(best, sum);
    }
    return best;
}`;

/** Input packing: [k, a0, a1, ...]. */
function parseInput(input: number[]): { k: number; a: number[] } {
  const [k, ...a] = input;
  return { k, a };
}

function windowHighlights(a: number[], l: number, r: number): IndexHighlight[] {
  const list: IndexHighlight[] = [];
  for (let i = l; i <= r; i++) list.push({ index: i, role: "comparing", label: i === l ? "L" : i === r ? "R" : "" });
  return list;
}

export function* run(input: number[]): Generator<AlgorithmStep, void, unknown> {
  const { k, a } = parseInput(input);
  const n = a.length;

  if (k < 1 || k > n) {
    yield {
      array: [...a],
      highlights: [],
      codeLine: 1,
      explanation: `Kích thước cửa sổ k = ${k} không hợp lệ với mảng ${n} phần tử.`,
    };
    return;
  }

  let sum = 0;
  for (let i = 0; i < k; i++) sum += a[i];
  let best = sum;

  yield {
    array: [...a],
    highlights: windowHighlights(a, 0, k - 1),
    codeLine: 3,
    explanation: `Cửa sổ đầu tiên [0..${k - 1}]: tổng = ${sum}.`,
    stats: { "Tốt nhất": best },
  };

  for (let i = k; i < n; i++) {
    const l = i - k + 1;
    const r = i;
    yield {
      array: [...a],
      highlights: windowHighlights(a, l, r),
      codeLine: 5,
      explanation: `Trượt cửa sổ tới [${l}..${r}]: bỏ a[${l - 1}] = ${a[l - 1]}, thêm a[${i}] = ${a[i]}.`,
      stats: { "Tốt nhất": best },
    };
    sum += a[i] - a[i - k];
    if (sum > best) {
      best = sum;
      yield {
        array: [...a],
        highlights: windowHighlights(a, l, r),
        codeLine: 6,
        explanation: `Tổng mới ${sum} > tốt nhất → cập nhật best = ${best}.`,
        stats: { "Tốt nhất": best },
      };
    }
  }

  yield {
    array: [...a],
    highlights: [],
    codeLine: 7,
    explanation: `Hoàn tất — tổng lớn nhất của dãy con dài ${k} là ${best}.`,
    stats: { "Tốt nhất": best },
  };
}

export const slidingWindow: AlgorithmModule = {
  meta: {
    slug: "sliding-window",
    name: "Sliding Window",
    group: "Two Pointers",
    level: "Cấp 2 - Cấp 3",
    renderMode: "2.5d",
    summary:
      "Kỹ thuật cửa sổ trượt: duy trì một khoảng [L..R] và cập nhật O(1) mỗi bước để giải bài tổng con / chuỗi con trong O(n).",
  },
  code,
  run,
};
