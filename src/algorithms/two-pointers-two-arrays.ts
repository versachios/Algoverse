import type { AlgorithmModule, AlgorithmStep, IndexHighlight } from "./types";

export const code = `// trộn hai mảng đã sắp xếp thành một mảng kết quả đã sắp xếp
vector<int> mergeSorted(vector<int>& a, vector<int>& b) {
    vector<int> res;
    int i = 0, j = 0;
    while (i < a.size() && j < b.size()) {
        if (a[i] <= b[j]) res.push_back(a[i++]);  // A nhỏ hơn hoặc bằng
        else res.push_back(b[j++]);               // B nhỏ hơn
    }
    while (i < a.size()) res.push_back(a[i++]);   // A còn dư
    while (j < b.size()) res.push_back(b[j++]);   // B còn dư
    return res;
}`;

/** Input packing: [n1, a0..a(n1-1), b0, b1, ...] — both a and b sorted ascending. */
function parseInput(input: number[]): { a: number[]; b: number[] } {
  const [n1, ...rest] = input;
  return { a: rest.slice(0, n1), b: rest.slice(n1) };
}

function hlA(i: number, n: number, extra: IndexHighlight[] = []): IndexHighlight[] {
  return i < n ? [{ index: i, role: "pointer", label: "i" }, ...extra] : extra;
}
function hlB(j: number, n: number, extra: IndexHighlight[] = []): IndexHighlight[] {
  return j < n ? [{ index: j, role: "pointer", label: "j" }, ...extra] : extra;
}

export function* run(input: number[]): Generator<AlgorithmStep, void, unknown> {
  const { a, b } = parseInput(input);
  const na = a.length;
  const nb = b.length;
  let i = 0;
  let j = 0;
  const result: number[] = [];

  yield {
    kind: "dual-array",
    arrayA: a,
    arrayB: b,
    highlightsA: hlA(i, na),
    highlightsB: hlB(j, nb),
    labelA: "A",
    labelB: "B",
    result: [...result],
    highlights: [],
    codeLine: 3,
    explanation: `Đặt i = 0 (trên A), j = 0 (trên B). So sánh từng cặp để chọn phần tử nhỏ hơn.`,
    stats: { "Đã trộn": result.length },
  };

  while (i < na && j < nb) {
    yield {
      kind: "dual-array",
      arrayA: a,
      arrayB: b,
      highlightsA: hlA(i, na, [{ index: i, role: "comparing", label: "i" }]),
      highlightsB: hlB(j, nb, [{ index: j, role: "comparing", label: "j" }]),
      labelA: "A",
      labelB: "B",
      result: [...result],
      highlights: [],
      codeLine: 5,
      explanation: `So sánh A[i]=${a[i]} và B[j]=${b[j]}.`,
      stats: { "Đã trộn": result.length },
    };

    if (a[i] <= b[j]) {
      result.push(a[i]);
      yield {
        kind: "dual-array",
        arrayA: a,
        arrayB: b,
        highlightsA: [{ index: i, role: "sorted", label: "i" }],
        highlightsB: hlB(j, nb),
        labelA: "A",
        labelB: "B",
        result: [...result],
        highlights: [],
        codeLine: 6,
        explanation: `A[i]=${a[i]} ≤ B[j]=${b[j]} → lấy A[i], tăng i lên ${i + 1}.`,
        stats: { "Đã trộn": result.length },
      };
      i++;
    } else {
      result.push(b[j]);
      yield {
        kind: "dual-array",
        arrayA: a,
        arrayB: b,
        highlightsA: hlA(i, na),
        highlightsB: [{ index: j, role: "sorted", label: "j" }],
        labelA: "A",
        labelB: "B",
        result: [...result],
        highlights: [],
        codeLine: 7,
        explanation: `B[j]=${b[j]} < A[i]=${a[i]} → lấy B[j], tăng j lên ${j + 1}.`,
        stats: { "Đã trộn": result.length },
      };
      j++;
    }
  }

  while (i < na) {
    result.push(a[i]);
    i++;
    yield {
      kind: "dual-array",
      arrayA: a,
      arrayB: b,
      highlightsA: hlA(i, na, [{ index: i - 1, role: "sorted" }]),
      highlightsB: [],
      labelA: "A",
      labelB: "B",
      result: [...result],
      highlights: [],
      codeLine: 8,
      explanation: `B đã hết — lấy nốt phần còn dư của A.`,
      stats: { "Đã trộn": result.length },
    };
  }
  while (j < nb) {
    result.push(b[j]);
    j++;
    yield {
      kind: "dual-array",
      arrayA: a,
      arrayB: b,
      highlightsA: [],
      highlightsB: hlB(j, nb, [{ index: j - 1, role: "sorted" }]),
      labelA: "A",
      labelB: "B",
      result: [...result],
      highlights: [],
      codeLine: 9,
      explanation: `A đã hết — lấy nốt phần còn dư của B.`,
      stats: { "Đã trộn": result.length },
    };
  }

  yield {
    kind: "dual-array",
    arrayA: a,
    arrayB: b,
    highlightsA: [],
    highlightsB: [],
    labelA: "A",
    labelB: "B",
    result: [...result],
    resultLabel: "Kết quả (đã trộn)",
    highlights: [],
    codeLine: 10,
    explanation: `Hoàn tất — mảng kết quả đã trộn và vẫn được sắp xếp: [${result.join(", ")}].`,
    stats: { "Đã trộn": result.length },
  };
}

export const twoPointersTwoArrays: AlgorithmModule = {
  meta: {
    slug: "two-pointers-two-arrays",
    name: "2 mảng",
    group: "Two Pointers",
    level: "Cấp 2 - Cấp 3",
    renderMode: "2.5d",
    summary:
      "Hai con trỏ chạy trên hai mảng khác nhau cùng lúc: trộn hai mảng đã sắp xếp thành một mảng kết quả trong O(n + m).",
  },
  code,
  run,
};
