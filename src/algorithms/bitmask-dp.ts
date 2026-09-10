import type { AlgorithmModule, AlgorithmStep, GridCellRole } from "./types";

export const code = `// dp[i][mask] = chi phí nhỏ nhất khi đã gán i thợ đầu tiên
// cho tập việc "mask" (mask dùng đúng i việc)
int dp[N + 1][1 << N];
memset(dp, INF, sizeof(dp));
dp[0][0] = 0;

for (int i = 0; i < n; i++) {
    for (int mask = 0; mask < (1 << n); mask++) {
        if (dp[i][mask] == INF) continue;
        for (int j = 0; j < n; j++) {
            if (mask & (1 << j)) continue;        // việc j đã dùng
            int nMask = mask | (1 << j);
            dp[i + 1][nMask] = min(dp[i + 1][nMask],
                                    dp[i][mask] + cost[i][j]);
        }
    }
}
// đáp án: dp[n][(1 << n) - 1]`;

const INF = Infinity;

/** Input packing: [n, cost row-major n×n] — worker i, job j cost at cost[i*n+j]. */
function parseInput(input: number[]): { n: number; cost: number[][] } {
  const n = Math.max(1, Math.round(input[0] ?? 1));
  const flat = input.slice(1);
  const cost: number[][] = [];
  for (let i = 0; i < n; i++) {
    const row: number[] = [];
    for (let j = 0; j < n; j++) row.push(flat[i * n + j] ?? 0);
    cost.push(row);
  }
  return { n, cost };
}

const bitStr = (mask: number, n: number) => mask.toString(2).padStart(n, "0");

function snap(
  dp: number[][],
  explanation: string,
  codeLine: number,
  cellStates: Record<string, GridCellRole> = {}
): AlgorithmStep {
  return {
    kind: "grid",
    // GridScene scales bar height off the grid's own values, so unreached
    // (still-INF) cells display as 0/idle instead of breaking the max().
    grid: dp.map((row) => row.map((v) => (v === INF ? 0 : v))),
    cellStates,
    highlights: [],
    codeLine,
    explanation,
  };
}

export function* run(input: number[]): Generator<AlgorithmStep, void, unknown> {
  const { n, cost } = parseInput(input);
  const size = 1 << n;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(size).fill(INF));
  dp[0][0] = 0;
  const key = (r: number, c: number) => `${r}-${c}`;

  yield snap(
    dp,
    `Ma trận chi phí ${n}×${n}: gán mỗi thợ 0..${n - 1} cho đúng 1 việc. dp[i][mask] = chi phí nhỏ nhất gán i thợ đầu cho tập việc mask (${n} bit). Cột 0 (mask=00...0) của hàng 0 khởi tạo = 0.`,
    5,
    { [key(0, 0)]: "filled" }
  );

  for (let i = 0; i < n; i++) {
    for (let mask = 0; mask < size; mask++) {
      if (dp[i][mask] === INF) continue;
      for (let j = 0; j < n; j++) {
        if (mask & (1 << j)) continue;
        const nMask = mask | (1 << j);
        const candidate = dp[i][mask] + cost[i][j];

        yield snap(
          dp,
          `Thợ ${i} → việc ${j}: dp[${i + 1}][${bitStr(nMask, n)}] ứng viên = dp[${i}][${bitStr(mask, n)}] (${dp[i][mask]}) + cost[${i}][${j}] (${cost[i][j]}) = ${candidate}.`,
          12,
          { [key(i, mask)]: "source", [key(i + 1, nMask)]: "computing" }
        );

        if (candidate < dp[i + 1][nMask]) {
          dp[i + 1][nMask] = candidate;
          yield snap(dp, `Cập nhật dp[${i + 1}][${bitStr(nMask, n)}] = ${candidate} (nhỏ hơn giá trị cũ).`, 13, {
            [key(i + 1, nMask)]: "filled",
          });
        }
      }
    }
  }

  const fullMask = size - 1;
  yield snap(dp, `Hoàn tất — chi phí phân công nhỏ nhất = dp[${n}][${bitStr(fullMask, n)}] = ${dp[n][fullMask]}.`, 18, {
    [key(n, fullMask)]: "filled",
  });
}

export const bitmaskDp: AlgorithmModule = {
  meta: {
    slug: "bitmask-dp",
    name: "Bitmask DP (Bài toán phân công)",
    group: "DP",
    level: "Olympiad",
    renderMode: "3d",
    summary:
      "Quy hoạch động trên bitmask: trạng thái là một tập con (biểu diễn bằng bit) thay vì một chỉ số đơn. Minh họa bằng Bài toán phân công (Assignment Problem) — gán n thợ cho n việc với tổng chi phí nhỏ nhất, dp[i][mask].",
  },
  code,
  run,
};
