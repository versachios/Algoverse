import type { AlgorithmModule, AlgorithmStep, IndexHighlight } from "./types";

export const code = `// tìm xem có cặp a[l] + a[r] = x với mảng đã sắp xếp
bool findPair(vector<int>& a, int x) {
    int l = 0, r = a.size() - 1;
    while (l < r) {
        int s = a[l] + a[r];
        if (s == x) return true;   // tìm thấy cặp
        if (s < x) l++;            // cần tổng lớn hơn
        else r--;                  // cần tổng nhỏ hơn
    }
    return false;
}`;

/** Input packing: [target, a0, a1, ...] — a sorted in ascending order. */
function parseInput(input: number[]): { target: number; a: number[] } {
  const [target, ...a] = input;
  return { target, a };
}

function hl(arr: number[], l: number, r: number, extra: IndexHighlight[] = []): IndexHighlight[] {
  return [{ index: l, role: "pointer", label: "L" }, { index: r, role: "pointer", label: "R" }, ...extra];
}

export function* run(input: number[]): Generator<AlgorithmStep, void, unknown> {
  const { target, a } = parseInput(input);
  const n = a.length;
  let l = 0;
  let r = n - 1;
  let comparisons = 0;

  yield {
    array: [...a],
    highlights: hl(a, l, r),
    codeLine: 2,
    explanation: `Mảng đã sắp xếp. Đặt L = 0, R = ${n - 1}. Tìm cặp có tổng ${target}.`,
    stats: { "So sánh": comparisons },
  };

  let foundRes: [number, number] | null = null;

  while (l < r) {
    comparisons++;
    const s = a[l] + a[r];
    yield {
      array: [...a],
      highlights: hl(a, l, r),
      codeLine: 4,
      explanation: `L = ${l} (${a[l]}), R = ${r} (${a[r]}) → tổng ${a[l]} + ${a[r]} = ${s}.`,
      stats: { "So sánh": comparisons },
    };

    if (s === target) {
      foundRes = [l, r];
      yield {
        array: [...a],
        highlights: hl(a, l, r, [
          { index: l, role: "sorted" },
          { index: r, role: "sorted" },
        ]),
        codeLine: 5,
        explanation: `${a[l]} + ${a[r]} = ${target} — TÌM THẤY cặp (${l}, ${r})!`,
        stats: { "So sánh": comparisons },
      };
      break;
    }
    if (s < target) {
      yield {
        array: [...a],
        highlights: hl(a, l, r, [{ index: l, role: "eliminated", label: "L" }]),
        codeLine: 6,
        explanation: `Tổng ${s} < ${target} → tăng L lên (${a[l]} quá nhỏ, không thể ghép với R).`,
        stats: { "So sánh": comparisons },
      };
      l++;
    } else {
      yield {
        array: [...a],
        highlights: hl(a, l, r, [{ index: r, role: "eliminated", label: "R" }]),
        codeLine: 7,
        explanation: `Tổng ${s} > ${target} → giảm R xuống (${a[r]} quá lớn).`,
        stats: { "So sánh": comparisons },
      };
      r--;
    }
  }

  if (!foundRes) {
    yield {
      array: [...a],
      highlights: hl(a, l, r),
      codeLine: 9,
      explanation: `L và R gặp nhau — không có cặp nào có tổng ${target}.`,
      stats: { "So sánh": comparisons },
    };
  }
}

export const twoPointers: AlgorithmModule = {
  meta: {
    slug: "two-pointers",
    name: "Two Pointers (Tìm cặp tổng)",
    group: "Two Pointers",
    level: "Cấp 2 - Cấp 3",
    renderMode: "2.5d",
    summary:
      "Kỹ thuật hai con trỏ trên mảng đã sắp xếp: di chuyển L/R để tìm cặp có tổng bằng X trong O(n).",
  },
  code,
  run,
};
