import type { AlgorithmModule, AlgorithmStep, GridCellRole } from "./types";

export const code = `// dp[i][w] = giá trị lớn nhất đạt được dùng i món đầu tiên, sức chứa w
int dp[N + 1][W + 1] = {};

for (int i = 1; i <= n; i++) {
    for (int w = 0; w <= W; w++) {
        int skip = dp[i - 1][w];
        int take = (weight[i] <= w)
            ? dp[i - 1][w - weight[i]] + value[i]
            : -1;
        dp[i][w] = max(skip, take);
    }
}
// đáp án: dp[n][W]`;

/** Input packing: [capacity, w1, v1, w2, v2, ...] — keeps the AlgorithmModule.run(number[])
 *  contract shared with array algorithms without needing a separate input shape. */
function parseInput(input: number[]): { capacity: number; items: { name: string; weight: number; value: number }[] } {
  const [capacity, ...rest] = input;
  const items: { name: string; weight: number; value: number }[] = [];
  for (let i = 0; i + 1 < rest.length; i += 2) {
    items.push({ name: `Món ${items.length + 1}`, weight: rest[i], value: rest[i + 1] });
  }
  return { capacity, items };
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
  const { capacity, items } = parseInput(input);
  const n = items.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));
  const key = (r: number, c: number) => `${r}-${c}`;

  yield snap(dp, `Bảng DP: ${n} món đồ x sức chứa ${capacity}. Hàng 0 và cột 0 khởi tạo bằng 0.`, 2);

  for (let i = 1; i <= n; i++) {
    const item = items[i - 1];
    for (let w = 0; w <= capacity; w++) {
      const skip = dp[i - 1][w];
      let take = -1;
      const cs: Record<string, GridCellRole> = { [key(i, w)]: "computing", [key(i - 1, w)]: "source" };

      if (item.weight <= w) {
        take = dp[i - 1][w - item.weight] + item.value;
        cs[key(i - 1, w - item.weight)] = "source";
      }

      yield snap(
        dp,
        `dp[${i}][${w}]: "${item.name}" (w=${item.weight}, v=${item.value}) — không lấy = ${skip}${take >= 0 ? `, lấy = ${take}` : ""}.`,
        7,
        cs
      );

      dp[i][w] = Math.max(skip, take);

      yield snap(dp, `dp[${i}][${w}] = max(${skip}, ${take >= 0 ? take : "—"}) = ${dp[i][w]}.`, 9, {
        [key(i, w)]: "filled",
      });
    }
  }

  yield snap(dp, `Hoàn tất — giá trị tối ưu = ${dp[n][capacity]} (ô góc dưới-phải).`, 11, {
    [key(n, capacity)]: "filled",
  });
}

export const knapsack: AlgorithmModule = {
  meta: {
    slug: "knapsack",
    name: "0/1 Knapsack",
    group: "DP",
    level: "Olympiad",
    renderMode: "3d",
    summary:
      "Bài toán cái túi 0/1: chọn tập con các món đồ sao cho tổng trọng lượng không vượt quá sức chứa và tổng giá trị lớn nhất. Giải bằng quy hoạch động trên bảng 2 chiều dp[i][w].",
  },
  code,
  run,
};
