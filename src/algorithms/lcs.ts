import type { AlgorithmModule, AlgorithmStep, GridCellRole } from "./types";

export const code = `// dp[i][j] = độ dài LCS của A[0..i-1] và B[0..j-1]
int dp[N + 1][M + 1] = {};

for (int i = 1; i <= n; i++) {
    for (int j = 1; j <= m; j++) {
        if (A[i - 1] == B[j - 1])
            dp[i][j] = dp[i - 1][j - 1] + 1;
        else
            dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);
    }
}
// đáp án: dp[n][m]`;

/** Input packing: [n1, A..., B...] — same convention as two-pointers-two-arrays. */
function parseInput(input: number[]): { A: number[]; B: number[] } {
  const [n1, ...rest] = input;
  return { A: rest.slice(0, n1), B: rest.slice(n1) };
}

function snap(
  grid: number[][],
  explanation: string,
  codeLine: number,
  cellStates: Record<string, GridCellRole> = {}
): AlgorithmStep {
  return {
    kind: "grid",
    grid: grid.map((row) => [...row]),
    cellStates,
    highlights: [],
    codeLine,
    explanation,
  };
}

export function* run(input: number[]): Generator<AlgorithmStep, void, unknown> {
  const { A, B } = parseInput(input);
  const n = A.length;
  const m = B.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  const key = (r: number, c: number) => `${r}-${c}`;

  yield snap(dp, `Bảng DP: dãy A dài ${n}, dãy B dài ${m}. Hàng 0 và cột 0 khởi tạo bằng 0.`, 2);

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const match = A[i - 1] === B[j - 1];
      const cs: Record<string, GridCellRole> = { [key(i, j)]: "computing" };
      if (match) cs[key(i - 1, j - 1)] = "source";
      else {
        cs[key(i - 1, j)] = "source";
        cs[key(i, j - 1)] = "source";
      }

      yield snap(
        dp,
        `dp[${i}][${j}]: A[${i - 1}]=${A[i - 1]} ${match ? "==" : "!="} B[${j - 1}]=${B[j - 1]}.`,
        match ? 6 : 8,
        cs
      );

      dp[i][j] = match ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);

      yield snap(
        dp,
        match
          ? `Trùng nhau → dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${dp[i][j]}.`
          : `Khác nhau → dp[${i}][${j}] = max(dp[${i - 1}][${j}], dp[${i}][${j - 1}]) = ${dp[i][j]}.`,
        match ? 6 : 8,
        { [key(i, j)]: "filled" }
      );
    }
  }

  yield snap(dp, `Hoàn tất — độ dài LCS = ${dp[n][m]} (ô góc dưới-phải).`, 11, { [key(n, m)]: "filled" });
}

export const lcs: AlgorithmModule = {
  meta: {
    slug: "lcs",
    name: "LCS — Dãy con chung dài nhất",
    group: "DP",
    level: "Olympiad",
    renderMode: "3d",
    summary:
      "Tìm dãy con (không cần liên tục) dài nhất xuất hiện trong cả hai dãy A và B, theo đúng thứ tự. Giải bằng quy hoạch động trên bảng 2 chiều dp[i][j].",
  },
  code,
  run,
};
