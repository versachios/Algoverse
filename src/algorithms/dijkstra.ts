import type {
  AlgorithmModule,
  AlgorithmStep,
  GraphNodeRole,
} from "./types";

export const code = `#include <queue>
vector<int> dist(n, INF);
priority_queue<PII, vector<PII>, greater<PII>> pq;

dist[S] = 0;                       // khoảng cách từ đỉnh nguồn
pq.push({0, S});                   // thêm (khoảng cách, đỉnh)

while (!pq.empty()) {
    auto [d, u] = pq.top(); pq.pop();
    if (d != dist[u]) continue;    // mục cũ, bỏ qua
    for (auto [v, w] : adj[u]) {
        if (dist[u] + w < dist[v]) {
            dist[v] = dist[u] + w; // nới lỏng (relax) cạnh u->v
            pq.push({dist[v], v});
        }
    }
}
// đáp án: dist[x] = đường đi ngắn nhất từ S đến x`;

/**
 * Input packing: [source, numNodes, numEdges, u, v, w, ...] — keeps
 * AlgorithmModule.run(number[]) shared with array algorithms.
 */
interface ParsedGraph {
  source: number;
  numNodes: number;
  adj: { to: number; w: number }[][];
  edges: { from: number; to: number; w: number }[];
}

function parseInput(input: number[]): ParsedGraph {
  const [source, numNodes, , ...rest] = input;
  const adj: { to: number; w: number }[][] = Array.from({ length: numNodes }, () => []);
  const edges: { from: number; to: number; w: number }[] = [];
  for (let i = 0; i + 2 < rest.length; i += 3) {
    const u = rest[i];
    const v = rest[i + 1];
    const w = rest[i + 2];
    if (u >= numNodes || v >= numNodes || w < 0) continue;
    adj[u].push({ to: v, w });
    edges.push({ from: u, to: v, w });
  }
  return { source, numNodes, adj, edges };
}

function snap(
  graph: ParsedGraph,
  dist: Record<string, number>,
  nodeStates: Record<string, GraphNodeRole>,
  codeLine: number,
  explanation: string,
  stats: Record<string, number>,
  edgeHighlight?: [string, string] | null
): AlgorithmStep {
  const nodes: Record<string, { id: string; label: string }> = {};
  for (let i = 0; i < graph.numNodes; i++) nodes[String(i)] = { id: String(i), label: String(i) };
  return {
    kind: "graph",
    nodes,
    edges: graph.edges.map((e) => ({ from: String(e.from), to: String(e.to), weight: e.w })),
    dist: { ...dist },
    nodeStates: { ...nodeStates },
    edgeHighlight,
    highlights: [],
    codeLine,
    explanation,
    stats,
  };
}

export function* run(input: number[]): Generator<AlgorithmStep, void, unknown> {
  const graph = parseInput(input);
  const n = graph.numNodes;
  const s = graph.source;

  const dist: Record<string, number> = {};
  const nodeStates: Record<string, GraphNodeRole> = {};
  for (let i = 0; i < n; i++) {
    nodeStates[String(i)] = "idle";
  }

  dist[String(s)] = 0;

  // stats
  let extracted = 0;
  let relaxCount = 0;

  yield snap(
    graph,
    dist,
    { ...nodeStates, [String(s)]: "current" },
    5,
    `Khởi tạo: dist[${s}] = 0, các đỉnh còn lại là ∞. Nguồn = ${s}.`,
    { "Thăm": extracted, "Relax": relaxCount },
    null
  );

  // Min-heap emulated with a sorted array of {dist, node}.
  class MinHeap {
    data: { d: number; u: number }[] = [];
    push(d: number, u: number) {
      this.data.push({ d, u });
      this.data.sort((a, b) => a.d - b.d || a.u - b.u);
    }
    pop() {
      return this.data.shift();
    }
    get size() {
      return this.data.length;
    }
  }
  const pq = new MinHeap();
  pq.push(0, s);

  // track which node ids are currently "frontier" (in pq, finite dist, not settled)
  const frontier = new Set<string>();

  while (pq.size > 0) {
    const { d, u } = pq.pop()!;

    // stale entry
    if (d !== dist[String(u)]) continue;

    extracted++;
    const curStates: Record<string, GraphNodeRole> = { ...nodeStates, [String(u)]: "current" };
    frontier.delete(String(u));

    yield snap(
      graph,
      dist,
      curStates,
      9,
      `Lấy đỉnh ${u} có khoảng cách nhỏ nhất trong hàng đợi ưu tiên (dist[${u}] = ${d}). Đánh dấu đã cố định.`,
      { "Thăm": extracted, "Relax": relaxCount }
    );

    nodeStates[String(u)] = "settled";

    for (const { to: v, w } of graph.adj[u]) {
      const cs: Record<string, GraphNodeRole> = { ...nodeStates, [String(u)]: "settled", [String(v)]: "frontier" };

      yield snap(
        graph,
        dist,
        cs,
        11,
        `Xét cạnh ${u} → ${v} (trọng lượng ${w}). dist[${u}] + w = ${d} + ${w} = ${d + w}.`,
        { "Thăm": extracted, "Relax": relaxCount },
        [String(u), String(v)]
      );

      const curV = dist[String(v)];
      if (curV === undefined || d + w < curV) {
        relaxCount++;
        dist[String(v)] = d + w;
        frontier.add(String(v));
        pq.push(d + w, v);
        yield snap(
          graph,
          dist,
          { ...nodeStates, [String(u)]: "settled", [String(v)]: "frontier" },
          13,
          `${d + w} < ${curV === undefined ? "∞" : curV} → nới lỏng: dist[${v}] = ${d + w} và đẩy vào hàng đợi.`,
          { "Thăm": extracted, "Relax": relaxCount },
          [String(u), String(v)]
        );
      }
    }
  }

  // Final
  const reachable = Object.keys(dist).filter((k) => nodeStates[k] === "settled").length;
  yield snap(
    graph,
    dist,
    nodeStates,
    18,
    `Hoàn tất — đã xác định đường đi ngắn nhất từ ${s} đến ${reachable}/${n} đỉnh: ` +
      Object.entries(dist)
        .map(([k, v]) => `dist[${k}]=${v}`)
        .join(", "),
    { "Thăm": extracted, "Relax": relaxCount }
  );
}

export const dijkstra: AlgorithmModule = {
  meta: {
    slug: "dijkstra",
    name: "Dijkstra (Đường đi ngắn nhất)",
    group: "Graph",
    level: "Olympiad",
    renderMode: "3d",
    summary:
      "Thuật toán tìm đường đi ngắn nhất từ một đỉnh nguồn đến mọi đỉnh khác trên đồ thị có trọng số không âm, dùng hàng đợi ưu tiên (min-heap).",
  },
  code,
  run,
};
