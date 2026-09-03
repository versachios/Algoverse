import type { AlgorithmModule, AlgorithmStep, GraphNodeRole } from "./types";

export const code = `int parent[n], sz[n];
for (int i = 0; i < n; i++) { parent[i] = i; sz[i] = 1; }

int find(int x) {
    while (parent[x] != x) {
        parent[x] = parent[parent[x]];   // nén đường đi (path compression)
        x = parent[x];
    }
    return x;
}

void unite(int a, int b) {
    a = find(a); b = find(b);
    if (a == b) return;                  // đã cùng một tập
    if (sz[a] < sz[b]) swap(a, b);       // union by size
    parent[b] = a; sz[a] += sz[b];       // ghim b vào a
}`;

/**
 * Input packing: [numNodes, numOps, op1, ...] where each op is (type, a, b):
 *   type = 1 → union(a, b);  type = 0 → find(a) (query, b unused).
 * Keeps AlgorithmModule.run(number[]).
 */
interface DsuOp {
  type: 0 | 1;
  a: number;
  b: number;
}

function parseInput(input: number[]): { n: number; ops: DsuOp[] } {
  const [n, numOps, ...rest] = input;
  const ops: DsuOp[] = [];
  for (let i = 0; i + 2 < rest.length && ops.length < numOps; i += 3) {
    ops.push({ type: rest[i] === 0 ? 0 : 1, a: rest[i + 1], b: rest[i + 2] });
  }
  return { n, ops };
}

function forestStep(
  n: number,
  parent: number[],
  size: number[],
  nodeStates: Record<string, GraphNodeRole>,
  settled: number[],
  codeLine: number,
  explanation: string,
  stats: Record<string, number>,
  edgeHighlight?: [string, string]
): AlgorithmStep {
  const r = (i: number) => String(i);
  const nodes: Record<string, { id: string; label: string }> = {};
  for (let i = 0; i < n; i++) nodes[r(i)] = { id: r(i), label: r(i) };
  const edges: { from: string; to: string; weight: number }[] = [];
  for (let i = 0; i < n; i++) {
    if (parent[i] !== i) edges.push({ from: r(i), to: r(parent[i]), weight: 0 });
  }
  const states: Record<string, GraphNodeRole> = {};
  for (let i = 0; i < n; i++) states[r(i)] = settled.includes(i) ? "settled" : nodeStates[r(i)] ?? "idle";
  return {
    kind: "graph",
    nodes,
    edges,
    dist: {},
    nodeStates: states,
    edgeHighlight,
    showDist: false,
    showWeights: false,
    highlights: [],
    codeLine,
    explanation,
    stats,
  };
}

export function* run(input: number[]): Generator<AlgorithmStep, void, unknown> {
  const { n, ops } = parseInput(input);
  const parent = Array.from({ length: n }, (_, i) => i);
  const size = Array(n).fill(1);
  const r = (i: number) => String(i);

  let opCount = 0;

  yield forestStep(n, parent, size, {}, [], 1, `Khởi tạo: mỗi đỉnh là một tập riêng (parent[i] = i, sz[i] = 1).`, { "Bước": 0 });

  const findRoot = (x: number) => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };

  for (const op of ops) {
    opCount++;
    const a = op.a;
    const b = op.b;

    if (op.type === 1) {
      yield forestStep(n, parent, size, { [r(a)]: "current", [r(b)]: "current" }, [], 10, `Bước ${opCount}: unite(${a}, ${b}) — tìm gốc hai đỉnh trước.`, { "Bước": opCount });

      let ra = findRoot(a);
      let rb = findRoot(b);
      yield forestStep(n, parent, size, { [r(ra)]: "current", [r(rb)]: "current" }, [], 11, `Gốc của ${a} là ${ra}, gốc của ${b} là ${rb}.`, { "Bước": opCount });

      if (ra === rb) {
        yield forestStep(n, parent, size, { [r(ra)]: "current" }, [], 12, `${a} và ${b} đã cùng tập — không làm gì thêm.`, { "Bước": opCount });
        continue;
      }

      if (size[ra] < size[rb]) [ra, rb] = [rb, ra];
      parent[rb] = ra;
      size[ra] += size[rb];
      const settled = Array.from({ length: n }, (_, i) => (findRoot(i) === ra ? i : -1)).filter((x) => x !== -1);
      yield forestStep(n, parent, size, { [r(ra)]: "current" }, settled, 13, `Nối ${rb} vào ${ra} (union by size): parent[${rb}] = ${ra}, tập mới có ${size[ra]} phần tử.`, { "Bước": opCount });
    } else {
      // find query — trace the path rootward for path compression
      const path: number[] = [a];
      let cur = a;
      while (parent[cur] !== cur) {
        cur = parent[cur];
        path.push(cur);
      }
      const ra = findRoot(a);
      const settled = Array.from({ length: n }, (_, i) => (findRoot(i) === ra ? i : -1)).filter((x) => x !== -1);

      yield forestStep(n, parent, size, { [r(a)]: "current" }, [], 5, `Bước ${opCount}: find(${a}) — nén đường đi ${path.join(" → ")}.`, { "Bước": opCount });
      yield forestStep(n, parent, size, { [r(ra)]: "current" }, settled, 9, `find(${a}) = ${ra}${path.length > 1 ? " (đã nén đường đi)" : ""}.`, { "Bước": opCount });
    }
  }

  const roots = new Set<number>();
  for (let i = 0; i < n; i++) roots.add(findRoot(i));
  yield forestStep(n, parent, size, {}, Array.from({ length: n }, (_, i) => i), 14, `Hoàn tất — đồ thị được chia thành ${roots.size} tập (thành phần liên thông).`, { "Bước": opCount });
}

export const unionFind: AlgorithmModule = {
  meta: {
    slug: "union-find",
    name: "Union-Find / DSU",
    group: "Graph",
    level: "Olympiad",
    renderMode: "3d",
    summary:
      "Disjoint Set Union: lưu các tập rời nhau dưới dạng rừng cây, hỗ trợ nhanh phép gộp (union) và truy vấn cùng tập (find) với nén đường đi.",
  },
  code,
  run,
};
