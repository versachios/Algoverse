import type { AlgorithmModule, AlgorithmStep, IndexHighlight } from "./types";

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
  // Bounds of the subarray behind `cur` (the "window" currently being summed)
  // and of the best subarray found so far. Tracking these — instead of only
  // ever highlighting the single index i — is what lets the visualization
  // show a growing/shrinking window instead of one cell flashing color and
  // reverting every step.
  let curStart = 0;
  let bestStart = 0;
  let bestEnd = -1; // -1 == no best window closed yet

  // best-so-far window first (khaki "sorted"), current window drawn after so
  // it wins on any overlapping index (Map in ArrayRow2D keeps the last write
  // per index), cursor pointer drawn last so `i` always shows its "i" label.
  // `curEnd` is exclusive — pass i-1 while a[i] hasn't joined the window yet,
  // or i once it has.
  function windowHighlights(curEnd: number, cursor: number): IndexHighlight[] {
    const hs: IndexHighlight[] = [];
    for (let k = bestStart; k <= bestEnd; k++) hs.push({ index: k, role: "sorted" });
    for (let k = curStart; k <= curEnd; k++) hs.push({ index: k, role: "comparing" });
    hs.push({ index: cursor, role: "pointer", label: "i" });
    return hs;
  }

  yield {
    array: [...a],
    highlights: [],
    codeLine: 2,
    explanation: `Kadane: cur = tổng tốt nhất của dãy con kết thúc tại vị trí hiện tại (khung màu cam), best = tổng lớn nhất đã tìm được (khung màu be). Khởi tạo cur = 0, best = -∞.`,
    stats: { cur, best: -999999 },
  };

  for (let i = 0; i < a.length; i++) {
    const x = a[i];
    const prevCur = cur;
    const extended = prevCur + x;
    yield {
      array: [...a],
      // a[i] hasn't joined the window yet — show the window as it stood
      // *before* this element (curStart..i-1), with i just as the cursor.
      highlights: windowHighlights(i - 1, i),
      codeLine: 3,
      explanation: `Xét a[${i}] = ${x}: bắt đầu dãy mới (${x}) hay nối tiếp khung hiện tại (cur + x = ${extended})?`,
      stats: { cur, best },
    };

    if (x > extended) {
      // Continuing loses to starting fresh at i — close the old window here.
      curStart = i;
    }
    cur = Math.max(x, extended);
    if (cur > best) {
      best = cur;
      bestStart = curStart;
      bestEnd = i;
    }

    yield {
      array: [...a],
      highlights: windowHighlights(i, i),
      codeLine: 4,
      explanation: `cur = max(${x}, ${prevCur} + ${x}) → cur = ${cur} (khung [${curStart}, ${i}]), best = ${best} (khung [${bestStart}, ${bestEnd}]).`,
      stats: { cur, best },
    };
  }

  yield {
    array: [...a],
    highlights: Array.from({ length: bestEnd - bestStart + 1 }, (_, k) => ({
      index: bestStart + k,
      role: "sorted" as const,
    })),
    codeLine: 5,
    explanation: `Hoàn tất — tổng dãy con liên tiếp lớn nhất là ${best}, tại khung [${bestStart}, ${bestEnd}].`,
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
