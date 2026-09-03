import type { AlgorithmModule, AlgorithmStep, GraphNodeRole } from "./types";
import { parseGraph, graphSnapData, type ParsedGraph } from "./graph-common";

export const code = `#include <queue>
vector<int> dist(n, -1);   // -1 = chưa tới, bằng 0 ở nguồn
queue<int> q;
dist[S] = 0; q.push(S);

while (!q.empty()) {
    int u = q.front(); q.pop();            // u đi ra khỏi hàng đợi
    for (int v : adj[u]) {
        if (dist[v] == -1) {               // v chưa từng được thăm
            dist[v] = dist[u] + 1;         // đánh dấu và lưu khoảng cách
            q.push(v);                     // đẩy v vào cuối hàng đợi
        }
    }
}
// bfs duyệt theo tầng: hàng đợi FIFO`;

function snap(
  graph: ParsedGraph,
  order: Record<string, number>,
  nodeStates: Record<string, GraphNodeRole>,
  codeLine: number,
  explanation: string,
  stats: Record<string, number>
): AlgorithmStep {
  return {
    kind: "graph",
    ...graphSnapData(graph),
    dist: { ...order },
    nodeStates: { ...nodeStates },
    showWeights: false,
    highlights: [],
    codeLine,
    explanation,
    stats,
  };
}

export function* run(input: number[]): Generator<AlgorithmStep, void, unknown> {
  const graph = parseGraph(input);
  const n = graph.numNodes;
  const s = graph.source;

  const order: Record<string, number> = {};
  const nodeStates: Record<string, GraphNodeRole> = {};
  for (let i = 0; i < n; i++) nodeStates[String(i)] = "idle";

  let step = 0;

  yield snap(graph, order, { ...nodeStates, [String(s)]: "frontier" }, 4, `Bắt đầu BFS từ nguồn ${s}: đẩy vào hàng đợi (FIFO).`, { "Đã thăm": 0 });

  const queue: number[] = [s];
  order[String(s)] = 0;

  while (queue.length > 0) {
    const u = queue.shift()!;
    nodeStates[String(u)] = "settled";
    step++;
    yield snap(graph, order, { ...nodeStates, [String(u)]: "current" }, 9, `Lấy ${u} ra khỏi đầu hàng đợi, đánh dấu đã duyệt (bậc ${order[String(u)]}).`, { "Đã thăm": step });

    for (const v of graph.adj[u]) {
      const vs: Record<string, GraphNodeRole> = { ...nodeStates, [String(u)]: "current", [String(v)]: "frontier" };
      if (order[String(v)] === undefined) {
        order[String(v)] = order[String(u)] + 1;
        queue.push(v);
        yield snap(graph, order, vs, 12, `${v} chưa được thăm → gán khoảng cách ${order[String(v)]} và đẩy vào cuối hàng đợi.`, { "Đã thăm": step + 1 });
      } else {
        yield snap(graph, order, vs, 11, `${v} đã thăm (khoảng cách ${order[String(v)]}) → bỏ qua.`, { "Đã thăm": step });
      }
    }
  }

  yield snap(graph, order, nodeStates, 16, `Hàng đợi rỗng — BFS kết thúc. Đã duyệt ${step} đỉnh theo thứ tự bậc (level-order).`, { "Đã thăm": step });
}

export const bfs: AlgorithmModule = {
  meta: {
    slug: "bfs",
    name: "BFS — Duyệt theo bề rộng",
    group: "Graph",
    level: "Olympiad",
    renderMode: "3d",
    summary:
      "Breadth-First Search: duyệt đồ thị theo từng tầng bằng hàng đợi FIFO, dùng để tìm đường đi ngắn nhất (tính số cạnh) và kiểm tra tính liên thông.",
  },
  code,
  run,
};
