import type { AlgorithmModule, AlgorithmStep, IndexHighlight } from "./types";

export const code = `void merge(vector<int>& a, int lo, int mid, int hi) {
    vector<int> tmp;
    int i = lo, j = mid + 1;
    while (i <= mid && j <= hi) {
        if (a[i] <= a[j]) tmp.push_back(a[i++]);
        else tmp.push_back(a[j++]);
    }
    while (i <= mid) tmp.push_back(a[i++]);
    while (j <= hi) tmp.push_back(a[j++]);
    for (int k = 0; k < (int)tmp.size(); k++) a[lo + k] = tmp[k];
}

void mergeSort(vector<int>& a, int lo, int hi) {
    if (lo >= hi) return;
    int mid = (lo + hi) / 2;
    mergeSort(a, lo, mid);
    mergeSort(a, mid + 1, hi);
    merge(a, lo, mid, hi);
}`;

export function* run(input: number[]): Generator<AlgorithmStep, void, unknown> {
  const a = [...input];
  const n = a.length;
  let comparisons = 0;
  let writes = 0;

  yield {
    array: [...a],
    highlights: [],
    codeLine: 13,
    explanation: `Bắt đầu Merge Sort trên ${n} phần tử — chia đôi liên tục rồi trộn (merge) hai nửa đã sắp xếp.`,
    stats: { comparisons, writes },
  };

  function rangeHighlight(lo: number, hi: number, role: IndexHighlight["role"]): IndexHighlight[] {
    const h: IndexHighlight[] = [];
    for (let k = lo; k <= hi; k++) h.push({ index: k, role });
    return h;
  }

  function* merge(lo: number, mid: number, hi: number): Generator<AlgorithmStep, void, unknown> {
    yield {
      array: [...a],
      highlights: [...rangeHighlight(lo, mid, "pointer"), ...rangeHighlight(mid + 1, hi, "comparing")],
      codeLine: 15,
      explanation: `Trộn hai đoạn con đã sắp xếp: [${lo}, ${mid}] và [${mid + 1}, ${hi}].`,
      stats: { comparisons, writes },
    };

    const tmp: number[] = [];
    let i = lo;
    let j = mid + 1;

    while (i <= mid && j <= hi) {
      comparisons++;
      yield {
        array: [...a],
        highlights: [
          { index: i, role: "pointer", label: "i" },
          { index: j, role: "comparing", label: "j" },
        ],
        codeLine: 4,
        explanation: `So sánh a[${i}] = ${a[i]} và a[${j}] = ${a[j]}.`,
        stats: { comparisons, writes },
      };
      if (a[i] <= a[j]) tmp.push(a[i++]);
      else tmp.push(a[j++]);
    }
    while (i <= mid) tmp.push(a[i++]);
    while (j <= hi) tmp.push(a[j++]);

    for (let k = 0; k < tmp.length; k++) {
      a[lo + k] = tmp[k];
      writes++;
      yield {
        array: [...a],
        highlights: [...rangeHighlight(lo, lo + k, "sorted"), { index: lo + k, role: "swapping" }],
        codeLine: 9,
        explanation: `Ghi ${tmp[k]} vào vị trí ${lo + k} của mảng gốc.`,
        stats: { comparisons, writes },
      };
    }
  }

  function* mergeSort(lo: number, hi: number): Generator<AlgorithmStep, void, unknown> {
    if (lo >= hi) return;
    const mid = Math.floor((lo + hi) / 2);
    yield {
      array: [...a],
      highlights: [...rangeHighlight(lo, mid, "pointer"), ...rangeHighlight(mid + 1, hi, "comparing")],
      codeLine: 17,
      explanation: `Chia đoạn [${lo}, ${hi}] thành [${lo}, ${mid}] và [${mid + 1}, ${hi}].`,
      stats: { comparisons, writes },
    };
    yield* mergeSort(lo, mid);
    yield* mergeSort(mid + 1, hi);
    yield* merge(lo, mid, hi);
  }

  yield* mergeSort(0, n - 1);

  yield {
    array: [...a],
    highlights: rangeHighlight(0, n - 1, "sorted"),
    codeLine: 20,
    explanation: "Hoàn tất! Toàn bộ mảng đã được trộn thành một dãy tăng dần duy nhất.",
    stats: { comparisons, writes },
  };
}

export const mergeSort: AlgorithmModule = {
  meta: {
    slug: "merge-sort",
    name: "Merge Sort",
    group: "Sorting",
    level: "Cấp 2 - Cấp 3",
    renderMode: "3d",
    summary:
      "Chia để trị ổn định: chia mảng làm đôi đệ quy đến khi còn 1 phần tử, rồi trộn (merge) từng cặp đoạn đã sắp xếp lại với nhau. Luôn O(n log n), cần thêm O(n) bộ nhớ phụ.",
  },
  code,
  run,
};
