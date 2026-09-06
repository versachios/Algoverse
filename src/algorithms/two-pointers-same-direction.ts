import type { AlgorithmModule, AlgorithmStep, IndexHighlight } from "./types";

export const code = `// xoá phần tử trùng khỏi mảng đã sắp xếp, giữ lại đúng 1 bản mỗi giá trị
int removeDuplicates(vector<int>& a) {
    int slow = 0;                      // vị trí ghi (mảng kết quả)
    for (int fast = 1; fast < a.size(); fast++) {
        if (a[fast] != a[slow]) {      // gặp giá trị mới
            slow++;
            a[slow] = a[fast];          // ghi đè vào vị trí slow
        }
    }
    return slow + 1;                    // độ dài mảng sau khi xoá trùng
}`;

function hl(slow: number, fast: number, n: number, extra: IndexHighlight[] = []): IndexHighlight[] {
  const list: IndexHighlight[] = [];
  for (let i = 0; i <= slow; i++) list.push({ index: i, role: "sorted" });
  list.push({ index: slow, role: "pointer", label: "slow" });
  if (fast < n) list.push({ index: fast, role: "pointer", label: "fast" });
  return [...list, ...extra];
}

export function* run(input: number[]): Generator<AlgorithmStep, void, unknown> {
  const a = [...input];
  const n = a.length;

  if (n === 0) {
    yield { array: [], highlights: [], codeLine: 1, explanation: "Mảng rỗng — không có gì để xử lý." };
    return;
  }

  let slow = 0;
  yield {
    array: [...a],
    highlights: hl(slow, 1, n),
    codeLine: 2,
    explanation: `slow = 0 (đầu vùng kết quả). Bắt đầu quét fast từ chỉ số 1.`,
    stats: { "Độ dài mới": slow + 1 },
  };

  for (let fast = 1; fast < n; fast++) {
    yield {
      array: [...a],
      highlights: hl(slow, fast, n, [{ index: fast, role: "comparing", label: "fast" }]),
      codeLine: 4,
      explanation: `So sánh a[fast]=${a[fast]} với a[slow]=${a[slow]}.`,
      stats: { "Độ dài mới": slow + 1 },
    };

    if (a[fast] !== a[slow]) {
      slow++;
      a[slow] = a[fast];
      yield {
        array: [...a],
        highlights: hl(slow, fast, n, [{ index: slow, role: "swapping", label: "slow" }]),
        codeLine: 6,
        explanation: `Giá trị mới ${a[fast]} — tăng slow lên ${slow} và ghi a[${slow}] = ${a[fast]}.`,
        stats: { "Độ dài mới": slow + 1 },
      };
    } else {
      yield {
        array: [...a],
        highlights: hl(slow, fast, n, [{ index: fast, role: "eliminated", label: "fast" }]),
        codeLine: 5,
        explanation: `Trùng với a[slow] — bỏ qua, chỉ fast tiến lên (slow đứng yên).`,
        stats: { "Độ dài mới": slow + 1 },
      };
    }
  }

  yield {
    array: a.slice(0, slow + 1),
    highlights: Array.from({ length: slow + 1 }, (_, i) => ({ index: i, role: "sorted" }) as IndexHighlight),
    codeLine: 8,
    explanation: `Hoàn tất — mảng còn lại ${slow + 1} phần tử không trùng: [${a.slice(0, slow + 1).join(", ")}].`,
    stats: { "Độ dài mới": slow + 1 },
  };
}

export const twoPointersSameDirection: AlgorithmModule = {
  meta: {
    slug: "two-pointers-same-direction",
    name: "1 mảng, cùng chiều",
    group: "Two Pointers",
    level: "Cấp 2 - Cấp 3",
    renderMode: "2.5d",
    summary:
      "Hai con trỏ cùng đi một hướng trên một mảng, tốc độ/vai trò khác nhau (slow ghi, fast đọc) — xoá phần tử trùng trong O(n).",
  },
  code,
  run,
};
