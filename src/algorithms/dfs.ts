import type { AlgorithmModule, AlgorithmStep, GraphNodeRole } from "./types";
import { parseGraph, graphSnapData, type ParsedGraph } from "./graph-common";

export const code = `vector<int> dist(n, -1);
int timer = 0;

void dfs(int u) {
    dist[u] = timer++;             // gán thứ tự duyệt khi đi vào u
    for (int v : adj[u]) {
        if (dist[v] == -1) dfs(v); // v chưa thăm → đệ quy sâu xuống
    }
}
dfs(S);`;

function snap(
  graph: ParsedGraph,
  order: Record<string, number>,
  nodeStates: Record<string, GraphNodeRole>,
  activePath: string[],
  codeLine: number,
  explanation: string,
  stats: Record<string, number>
): AlgorithmStep {
  const states: Record<string, GraphNodeRole> = { ...nodeStates };
  // activePath holds nodes currently on the recursion stack (current = most recent)
  for (const id of activePath) if (states[id] !== "settled") states[id] = "frontier";
  const edgeHighlight =
    activePath.length >= 2
      ? ([activePath[activePath.length - 2], activePath[activePath.length - 1]] as [string, string])
      : undefined;
  return {
    kind: "graph",
    ...graphSnapData(graph),
    dist: { ...order },
    nodeStates: states,
    showWeights: false,
    edgeHighlight,
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

  let timer = 0;

  yield snap(
    graph,
    order,
    nodeStates,
    [String(s)],
    7,
    `Bắt đầu DFS từ nguồn ${s}: đi sâu xuống trước, quay lui sau.`,
    { "Đã thăm": 0 }
  );

  const stack: number[] = [s];
  order[String(s)] = timer++;
  nodeStates[String(s)] = "settled";

  while (stack.length > 0) {
    const u = stack[stack.length - 1];
    const path = stack.map(String);

    // find an unvisited neighbor
    let next: number | null = null;
    for (const v of graph.adj[u]) {
      if (order[String(v)] === undefined) {
        next = v;
        break;
      }
    }

    if (next === null) {
      yield snap(graph, order, nodeStates, path, 6, `Đỉnh ${u} hết đỉnh kề chưa thăm → quay lui.`, { "Đã thăm": timer });
      stack.pop();
      continue;
    }

    order[String(next)] = timer++;
    nodeStates[String(next)] = "settled";
    stack.push(next);
    const npath = stack.map(String);
    yield snap(
      graph,
      order,
      { ...nodeStates, [String(u)]: "current", [String(next)]: "current" },
      npath,
      4,
      `Từ ${u} đi sâu xuống ${next}: gán thứ tự duyệt ${order[String(next)]}.`,
      { "Đã thăm": timer }
    );
  }

  yield snap(graph, order, nodeStates, [], 8, `Ngăn xếp rỗng — DFS kết thúc. Đã duyệt ${timer} đỉnh theo chiều sâu.`, { "Đã thăm": timer });
}

export const dfs: AlgorithmModule = {
  meta: {
    slug: "dfs",
    name: "DFS — Duyệt theo chiều sâu",
    group: "Graph",
    level: "Olympiad",
    renderMode: "3d",
    summary:
      "Depth-First Search: duyệt đồ thị đi sâu xuống càng xa càng tốt rồi quay lui, dùng cho bài toán liên thông, chu trình, thành phần liên thông mạnh, topo.",
  },
  code,
  run,
};
