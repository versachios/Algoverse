import type { AlgorithmModule, AlgorithmStep, IndexHighlight } from "./types";

export const code = `// chia mảng thành tối đa k đoạn liên tiếp, tối thiểu hoá tổng đoạn lớn nhất
bool ok(vector<int>& a, int k, long long cap) {
    int parts = 1; long long cur = 0;
    for (int x : a) {
        if (cur + x > cap) { parts++; cur = 0; }
        cur += x;
    }
    return parts <= k;
}

long long lo = *max_element(a.begin(), a.end());
long long hi = accumulate(a.begin(), a.end(), 0LL);
while (lo < hi) {
    long long mid = (lo + hi) / 2;
    if (ok(a, k, mid)) hi = mid;      // mid đủ rộng → thử nhỏ hơn
    else               lo = mid + 1;  // mid quá chật → phải lớn hơn
}
// đáp án: lo`;

/** Input packing: [k, a...] — các phần tử a phải dương. */
export function* run(input: number[]): Generator<AlgorithmStep, void, unknown> {
  const [rawK, ...rest] = input;
  const a = rest.map((x) => Math.max(1, Math.round(x)));
  const k = Math.max(1, Math.min(a.length, Math.round(rawK)));
  let lo = Math.max(...a);
  let hi = a.reduce((s, x) => s + x, 0);

  yield {
    array: [...a],
    highlights: [],
    codeLine: 11,
    explanation: `Chia mảng thành tối đa k = ${k} đoạn liên tiếp sao cho tổng đoạn lớn nhất NHỎ NHẤT. Ta tìm nhị phân trên đáp án: lo = max(a) = ${lo}, hi = tổng = ${hi}.`,
    stats: { k, lo, hi },
  };

  let guard = 0;
  while (lo < hi && guard++ < 64) {
    const mid = Math.floor((lo + hi) / 2);
    yield {
      array: [...a],
      highlights: [],
      codeLine: 14,
      explanation: `lo = ${lo}, hi = ${hi} → thử sức chứa mid = ${mid}. Kiểm tra: tham lam gom phần tử, mỗi đoạn có tổng ≤ ${mid}, cần bao nhiêu đoạn?`,
      stats: { k, lo, hi, mid },
    };

    // Greedy check — show finished segments in "sorted", the open one in "comparing".
    let parts = 1;
    let cur = 0;
    let segStart = 0;
    const done: IndexHighlight[] = [];
    for (let i = 0; i < a.length; i++) {
      if (cur + a[i] > mid) {
        for (let j = segStart; j < i; j++) done.push({ index: j, role: "sorted" });
        parts++;
        cur = 0;
        segStart = i;
        yield {
          array: [...a],
          highlights: [...done, { index: i, role: "swapping", label: "cắt" }],
          codeLine: 5,
          explanation: `Thêm a[${i}] = ${a[i]} sẽ vượt ${mid} → cắt đoạn tại đây, mở đoạn thứ ${parts}.`,
          stats: { k, lo, hi, mid, "số đoạn": parts },
        };
      }
      cur += a[i];
      yield {
        array: [...a],
        highlights: [
          ...done,
          ...Array.from({ length: i - segStart + 1 }, (_, j) => ({ index: segStart + j, role: "comparing" as const })),
        ],
        codeLine: 6,
        explanation: `Đoạn ${parts} có tổng ${cur} (≤ ${mid}).`,
        stats: { k, lo, hi, mid, "số đoạn": parts },
      };
    }

    const feasible = parts <= k;
    if (feasible) {
      hi = mid;
      yield {
        array: [...a],
        highlights: a.map((_, j) => ({ index: j, role: "sorted" as const })),
        codeLine: 16,
        explanation: `Cần ${parts} đoạn ≤ k = ${k} → mid = ${mid} khả thi. Thử chặt hơn: hi = ${hi}.`,
        stats: { k, lo, hi, mid, "số đoạn": parts },
      };
    } else {
      lo = mid + 1;
      yield {
        array: [...a],
        highlights: a.map((_, j) => ({ index: j, role: "eliminated" as const })),
        codeLine: 17,
        explanation: `Cần ${parts} đoạn > k = ${k} → mid = ${mid} quá chật. Phải nới ra: lo = ${lo}.`,
        stats: { k, lo, hi, mid, "số đoạn": parts },
      };
    }
  }

  yield {
    array: [...a],
    highlights: [],
    codeLine: 19,
    explanation: `lo = hi = ${lo} → tổng đoạn lớn nhất nhỏ nhất khi chia thành tối đa ${k} đoạn là ${lo}.`,
    stats: { k, lo, hi, "đáp án": lo },
  };
}

export const binarySearchOnAnswer: AlgorithmModule = {
  meta: {
    slug: "binary-search-on-answer",
    name: "Binary Search trên đáp án",
    group: "Searching",
    level: "Cấp 2 - Cấp 3",
    renderMode: "2.5d",
    summary:
      "Khi bài toán 'tối thiểu hoá giá trị lớn nhất' có tính đơn điệu, ta nhị phân trực tiếp trên đáp án và kiểm tra bằng tham lam.",
  },
  code,
  run,
};
