import type { AlgorithmModule, AlgorithmStep, GridCellRole } from "./types";

export const code = `// dp[i] = độ dài LIS kết thúc TẠI đúng phần tử i
vector<int> dp(n, 1);

for (int i = 0; i < n; i++) {
    for (int j = 0; j < i; j++) {
        if (a[j] < a[i])
            dp[i] = max(dp[i], dp[j] + 1);
    }
}
// đáp án: max(dp[0..n-1])  — O(n²), có thể tối ưu O(n log n) bằng binary search`;

function snap(
  row: number[],
  explanation: string,
  codeLine: number,
  cellStates: Record<string, GridCellRole> = {}
): AlgorithmStep {
  return {
    kind: "grid",
    grid: [[...row]],
    cellStates,
    highlights: [],
    codeLine,
    explanation,
  };
}

export function* run(input: number[]): Generator<AlgorithmStep, void, unknown> {
  const a = [...input];
  const n = a.length;
  const dp = Array(n).fill(1);
  const key = (c: number) => `0-${c}`;

  yield snap(dp, `Dãy A gồm ${n} phần tử. dp[i] khởi tạo = 1 (mỗi phần tử tự nó là một dãy con tăng độ dài 1).`, 2);

  for (let i = 0; i < n; i++) {
    yield snap(dp, `Xét a[${i}] = ${a[i]} — tìm mọi j < ${i} sao cho a[j] < a[${i}].`, 4, { [key(i)]: "computing" });

    for (let j = 0; j < i; j++) {
      const better = a[j] < a[i];
      yield snap(
        dp,
        `So sánh a[${j}]=${a[j]} với a[${i}]=${a[i]}${better ? ` → thoả điều kiện, ứng viên dp[${j}]+1 = ${dp[j] + 1}` : " → không thoả"}.`,
        5,
        { [key(i)]: "computing", [key(j)]: better ? "source" : "idle" }
      );
      if (better) dp[i] = Math.max(dp[i], dp[j] + 1);
    }

    yield snap(dp, `dp[${i}] = ${dp[i]}.`, 6, { [key(i)]: "filled" });
  }

  const best = Math.max(0, ...dp);
  const bestIdx = dp.indexOf(best);
  yield snap(dp, `Hoàn tất — LIS dài nhất = max(dp) = ${best} (kết thúc tại a[${bestIdx}] = ${a[bestIdx]}).`, 9, {
    [key(bestIdx)]: "filled",
  });
}

export const lis: AlgorithmModule = {
  meta: {
    slug: "lis",
    name: "LIS — Dãy con tăng dài nhất",
    group: "DP",
    level: "Olympiad",
    renderMode: "3d",
    summary:
      "Tìm dãy con tăng dần (không cần liên tục) dài nhất trong một dãy số. dp[i] = độ dài LIS kết thúc tại i, xét mọi j < i thoả a[j] < a[i]. O(n²), tối ưu được O(n log n).",
  },
  code,
  run,
};
