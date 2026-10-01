import type { AlgorithmModule, AlgorithmStep, GridCellRole } from "./types";

export const code = `// N-Queens: đặt n quân hậu, mỗi hàng đúng một quân, không quân nào ăn nhau
bool safe(int r, int c) {
    for (int i = 0; i < r; i++) {
        int j = col[i];
        if (j == c || abs(j - c) == r - i) return false;
    }
    return true;
}

bool solve(int r) {
    if (r == n) return true;               // đã đặt đủ n quân
    for (int c = 0; c < n; c++) {
        if (!safe(r, c)) continue;
        col[r] = c;                        // thử đặt
        if (solve(r + 1)) return true;
        // quay lui: bỏ quân vừa đặt, thử cột kế tiếp
    }
    return false;
}`;

/** Input packing: [n] — kích thước bàn cờ, giới hạn 4..6 để mô phỏng không quá dài. */
export function* run(input: number[]): Generator<AlgorithmStep, void, unknown> {
  const n = Math.max(4, Math.min(6, Math.round(input[0] ?? 5)));
  const col: number[] = Array(n).fill(-1);
  const key = (r: number, c: number) => `${r}-${c}`;
  let tries = 0;
  let backtracks = 0;

  function board(): number[][] {
    const g = Array.from({ length: n }, () => Array(n).fill(0));
    for (let r = 0; r < n; r++) if (col[r] >= 0) g[r][col[r]] = 1;
    return g;
  }
  function placedStates(upTo: number): Record<string, GridCellRole> {
    const cs: Record<string, GridCellRole> = {};
    for (let r = 0; r < upTo; r++) if (col[r] >= 0) cs[key(r, col[r])] = "filled";
    return cs;
  }
  function snap(
    cs: Record<string, GridCellRole>,
    codeLine: number,
    explanation: string
  ): AlgorithmStep {
    return {
      kind: "grid",
      grid: board(),
      cellStates: cs,
      highlights: [],
      codeLine,
      explanation,
      stats: { "lần thử": tries, "quay lui": backtracks },
    };
  }

  function* solve(r: number): Generator<AlgorithmStep, boolean, unknown> {
    if (r === n) {
      yield snap(placedStates(n), 11, `Đã đặt đủ ${n} quân hậu — tìm được một nghiệm hợp lệ!`);
      return true;
    }
    for (let c = 0; c < n; c++) {
      tries++;
      // Look for the first earlier queen that attacks (r, c).
      let attacker = -1;
      for (let i = 0; i < r; i++) {
        const j = col[i];
        if (j === c || Math.abs(j - c) === r - i) {
          attacker = i;
          break;
        }
      }
      const base = placedStates(r);
      if (attacker >= 0) {
        yield snap(
          { ...base, [key(r, c)]: "computing", [key(attacker, col[attacker])]: "source" },
          5,
          `Thử ô (hàng ${r}, cột ${c}): bị quân ở hàng ${attacker}, cột ${col[attacker]} ăn (cùng cột hoặc cùng đường chéo) → bỏ qua.`
        );
        continue;
      }
      yield snap({ ...base, [key(r, c)]: "computing" }, 13, `Thử ô (hàng ${r}, cột ${c}): an toàn với mọi quân đã đặt.`);
      col[r] = c;
      yield snap(placedStates(r + 1), 14, `Đặt hậu tại (hàng ${r}, cột ${c}) rồi đệ quy xuống hàng ${r + 1}.`);
      if (yield* solve(r + 1)) return true;
      col[r] = -1;
      backtracks++;
      yield snap(
        placedStates(r),
        16,
        `Hàng ${r + 1} không còn ô hợp lệ → quay lui: nhấc quân ở (hàng ${r}, cột ${c}) ra và thử cột kế tiếp.`
      );
    }
    return false;
  }

  yield snap({}, 10, `Bàn cờ ${n}×${n}. Đặt lần lượt từng hàng; ô nào hợp lệ thì đi tiếp, bí đường thì quay lui.`);
  const found = yield* solve(0);
  if (!found) {
    yield snap({}, 18, `Không có nghiệm cho n = ${n}.`);
  }
}

export const recursionBacktracking: AlgorithmModule = {
  meta: {
    slug: "recursion-backtracking",
    name: "Recursion & Backtracking",
    group: "Sorting",
    level: "Cấp 2 - Cấp 3",
    renderMode: "3d",
    summary:
      "Đệ quy quay lui qua bài N-Queens: đặt từng quân, gặp ngõ cụt thì rút lại và thử hướng khác.",
  },
  code,
  run,
};
