import type { AlgorithmModule, AlgorithmStep, IndexHighlight } from "./types";

export const code = `// pre[i] = a[0] + ... + a[i]   (mảng tiền tố, làm tại chỗ)
for (int i = 1; i < n; i++)
    a[i] += a[i - 1];

// tổng đoạn [l, r] trong O(1)
int query(int l, int r) {
    return a[r] - (l > 0 ? a[l - 1] : 0);
}`;

/** Input packing: [l, r, a...] — truy vấn tổng đoạn [l, r] (chỉ số từ 0). */
export function* run(input: number[]): Generator<AlgorithmStep, void, unknown> {
  const [rawL, rawR, ...rest] = input;
  const orig = [...rest];
  const n = orig.length;
  const l = Math.max(0, Math.min(n - 1, Math.min(rawL, rawR)));
  const r = Math.max(0, Math.min(n - 1, Math.max(rawL, rawR)));
  const a = [...orig];

  yield {
    array: [...a],
    highlights: [],
    codeLine: 2,
    explanation: `Mảng ban đầu. Ta sẽ biến a[i] thành tổng a[0..i] ngay tại chỗ, sau đó mọi truy vấn tổng đoạn chỉ tốn O(1).`,
    stats: { n },
  };

  for (let i = 1; i < n; i++) {
    const before = a[i];
    yield {
      array: [...a],
      highlights: [
        { index: i - 1, role: "comparing" },
        { index: i, role: "pointer", label: "i" },
      ],
      codeLine: 3,
      explanation: `i = ${i}: cộng tổng tiền tố đã có a[${i - 1}] = ${a[i - 1]} vào a[${i}] = ${before}.`,
      stats: { i },
    };
    a[i] += a[i - 1];
    yield {
      array: [...a],
      highlights: [
        ...Array.from({ length: i }, (_, k) => ({ index: k, role: "sorted" as const })),
        { index: i, role: "pointer", label: "i" },
      ],
      codeLine: 3,
      explanation: `a[${i}] = ${before} + ${a[i - 1]} = ${a[i]} → đây là tổng của a[0..${i}] ban đầu.`,
      stats: { i },
    };
  }

  yield {
    array: [...a],
    highlights: a.map((_, k) => ({ index: k, role: "sorted" as const })),
    codeLine: 4,
    explanation: `Mảng tiền tố đã xây xong (O(n)). Giờ trả lời truy vấn tổng đoạn [${l}, ${r}].`,
    stats: { l, r },
  };

  const hi = a[r];
  yield {
    array: [...a],
    highlights: [{ index: r, role: "comparing", label: "r" }],
    codeLine: 7,
    explanation: `Lấy pre[${r}] = ${hi} (tổng a[0..${r}]).`,
    stats: { l, r, "pre[r]": hi },
  };

  if (l > 0) {
    const lo = a[l - 1];
    const lowHs: IndexHighlight[] = [
      { index: l - 1, role: "swapping", label: "l-1" },
      { index: r, role: "comparing", label: "r" },
    ];
    yield {
      array: [...a],
      highlights: lowHs,
      codeLine: 7,
      explanation: `Trừ phần đứng trước đoạn: pre[${l - 1}] = ${lo} (tổng a[0..${l - 1}]).`,
      stats: { l, r, "pre[r]": hi, "pre[l-1]": lo },
    };
    const ans = hi - lo;
    yield {
      array: [...a],
      highlights: Array.from({ length: r - l + 1 }, (_, k) => ({ index: l + k, role: "sorted" as const })),
      codeLine: 7,
      explanation: `Tổng đoạn [${l}, ${r}] = ${hi} − ${lo} = ${ans}. Chỉ một phép trừ, không cần duyệt lại đoạn.`,
      stats: { l, r, "tổng": ans },
    };
  } else {
    yield {
      array: [...a],
      highlights: Array.from({ length: r - l + 1 }, (_, k) => ({ index: l + k, role: "sorted" as const })),
      codeLine: 7,
      explanation: `l = 0 nên không có phần phía trước để trừ: tổng đoạn [0, ${r}] = pre[${r}] = ${hi}.`,
      stats: { l, r, "tổng": hi },
    };
  }
}

export const prefixSum: AlgorithmModule = {
  meta: {
    slug: "prefix-sum",
    name: "Prefix Sum / Difference Array",
    group: "Two Pointers",
    level: "Cấp 2 - Cấp 3",
    renderMode: "2.5d",
    summary:
      "Xây mảng tổng tiền tố trong O(n) để trả lời mọi truy vấn tổng đoạn trong O(1); mở rộng sang mảng hiệu cho cập nhật đoạn.",
  },
  code,
  run,
};
