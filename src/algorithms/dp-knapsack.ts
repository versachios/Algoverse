// algorithms/dp-knapsack.ts
// 0/1 Knapsack — classic intro DP. Renders as a grid (rows = items, cols = capacity 0..W),
// cell height = dp[i][w], matching the existing DP-table render rule (3D grid, not 2.5D).

export interface DPCell {
  row: number;
  col: number;
  value: number;
  state: "idle" | "computing" | "source" | "filled";
}

export interface DPSnapshot {
  grid: number[][]; // grid[i][w]
  rows: number;
  cols: number;
  cellStates: Record<string, DPCell["state"]>; // key = `${row}-${col}`
  message: string;
  done: boolean;
}

export interface Item {
  name: string;
  weight: number;
  value: number;
}

const key = (r: number, c: number) => `${r}-${c}`;

function baseSnapshot(grid: number[][], message: string): DPSnapshot {
  return {
    grid: grid.map((row) => [...row]),
    rows: grid.length,
    cols: grid[0]?.length ?? 0,
    cellStates: {},
    message,
    done: false,
  };
}

/** Bottom-up 0/1 knapsack, yielding a snapshot every time a cell is written. */
export function* knapsackGenerator(items: Item[], capacity: number): Generator<DPSnapshot> {
  const n = items.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));

  const introSnap = baseSnapshot(dp, `Bảng DP: ${n} món đồ x sức chứa ${capacity}. Hàng 0 và cột 0 khởi tạo = 0.`);
  yield introSnap;

  for (let i = 1; i <= n; i++) {
    const item = items[i - 1];
    for (let w = 0; w <= capacity; w++) {
      const skip = dp[i - 1][w];
      let take = -1;
      const sourceCells: [number, number][] = [[i - 1, w]];

      if (item.weight <= w) {
        take = dp[i - 1][w - item.weight] + item.value;
        sourceCells.push([i - 1, w - item.weight]);
      }

      const computing = baseSnapshot(dp, `dp[${i}][${w}]: món "${item.name}" (w=${item.weight}, v=${item.value}) — không lấy = ${skip}${take >= 0 ? `, lấy = ${take}` : ""}.`);
      computing.cellStates[key(i, w)] = "computing";
      for (const [r, c] of sourceCells) computing.cellStates[key(r, c)] = "source";
      yield computing;

      dp[i][w] = Math.max(skip, take);

      const filled = baseSnapshot(dp, `dp[${i}][${w}] = max(${skip}, ${take >= 0 ? take : "—"}) = ${dp[i][w]}.`);
      filled.cellStates[key(i, w)] = "filled";
      yield filled;
    }
  }

  const final = baseSnapshot(dp, `Hoàn tất — giá trị tối ưu = ${dp[n][capacity]} (ô góc dưới-phải).`);
  final.cellStates[key(n, capacity)] = "filled";
  final.done = true;
  yield final;
}

export const knapsackTheory = {
  title: "0/1 Knapsack (Quy hoạch động)",
  bigO: { time: "O(n × W)", space: "O(n × W), có thể tối ưu còn O(W)" },
  renderMode: "3d" as const, // grid of boxes, height = dp value — free-orbit per spec
  group: "Dynamic Programming",
};
