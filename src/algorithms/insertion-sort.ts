import type { AlgorithmModule, AlgorithmStep, IndexHighlight } from "./types";

export const code = `void insertionSort(vector<int>& a) {
    int n = a.size();
    for (int i = 1; i < n; i++) {
        int key = a[i];
        int j = i - 1;
        while (j >= 0 && a[j] > key) {
            a[j + 1] = a[j];
            j--;
        }
        a[j + 1] = key;
    }
}`;

function sortedPrefix(from: number): IndexHighlight[] {
  const out: IndexHighlight[] = [];
  for (let k = 0; k < from; k++) out.push({ index: k, role: "sorted" });
  return out;
}

export function* run(input: number[]): Generator<AlgorithmStep, void, unknown> {
  const a = [...input];
  const n = a.length;
  let comparisons = 0;
  let shifts = 0;

  yield {
    array: [...a],
    highlights: sortedPrefix(1),
    codeLine: 2,
    explanation: "Insertion Sort xây dần một vùng đã sắp xếp ở đầu mảng, chèn từng phần tử mới vào đúng vị trí.",
    stats: { comparisons, shifts },
  };

  for (let i = 1; i < n; i++) {
    const key = a[i];
    let j = i - 1;

    yield {
      array: [...a],
      highlights: [...sortedPrefix(i), { index: i, role: "pointer", label: "key" }],
      codeLine: 4,
      explanation: `Lấy key = a[${i}] = ${key}, cần chèn vào đúng vị trí trong vùng đã sắp xếp [0..${i - 1}].`,
      stats: { comparisons, shifts },
    };

    while (j >= 0 && a[j] > key) {
      comparisons++;
      yield {
        array: [...a],
        highlights: [...sortedPrefix(i), { index: j, role: "comparing", label: "j" }],
        codeLine: 6,
        explanation: `a[${j}] = ${a[j]} > key (${key}) → cần đẩy a[${j}] sang phải.`,
        stats: { comparisons, shifts },
      };
      a[j + 1] = a[j];
      shifts++;
      j--;
      yield {
        array: [...a],
        highlights: [...sortedPrefix(i), { index: j + 1, role: "swapping" }],
        codeLine: 7,
        explanation: `Đẩy giá trị sang phải một ô, giải phóng chỗ trống để chèn key.`,
        stats: { comparisons, shifts },
      };
    }

    a[j + 1] = key;
    yield {
      array: [...a],
      highlights: sortedPrefix(i + 1),
      codeLine: 9,
      explanation: `Chèn key = ${key} vào vị trí ${j + 1}. Vùng [0..${i}] đã sắp xếp xong.`,
      stats: { comparisons, shifts },
    };
  }

  yield {
    array: [...a],
    highlights: sortedPrefix(n),
    codeLine: 1,
    explanation: "Hoàn tất! Mảng đã sắp xếp tăng dần.",
    stats: { comparisons, shifts },
  };
}

export const insertionSort: AlgorithmModule = {
  meta: {
    slug: "insertion-sort",
    name: "Insertion Sort",
    group: "Sorting",
    level: "Cơ bản",
    renderMode: "3d",
    summary:
      "Xây dần một vùng đã sắp xếp ở đầu mảng, mỗi bước lấy phần tử tiếp theo và chèn vào đúng vị trí — hiệu quả với mảng nhỏ hoặc gần như đã sắp xếp.",
  },
  code,
  run,
};
