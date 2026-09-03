/** Shared parsing for graph inputs in the format [source, numNodes, numEdges, u, v, w, ...].
 *  BFS/DFS ignore edge weights; Dijkstra keeps them. */
export interface ParsedGraph {
  source: number;
  numNodes: number;
  adj: number[][];
  edges: { from: number; to: number }[];
}

export function parseGraph(input: number[]): ParsedGraph {
  const [source, numNodes, , ...rest] = input;
  const adj: number[][] = Array.from({ length: numNodes }, () => []);
  const edges: { from: number; to: number }[] = [];
  for (let i = 0; i + 2 < rest.length; i += 3) {
    const u = rest[i];
    const v = rest[i + 1];
    const w = rest[i + 2];
    if (u >= numNodes || v >= numNodes || w < 0) continue;
    adj[u].push(v);
    adj[v].push(u);
    edges.push({ from: u, to: v });
  }
  return { source, numNodes, adj, edges };
}

/** Build node/edge maps for GraphScene. */
export function graphSnapData(graph: ParsedGraph) {
  const nodes: Record<string, { id: string; label: string }> = {};
  for (let i = 0; i < graph.numNodes; i++) nodes[String(i)] = { id: String(i), label: String(i) };
  return {
    nodes,
    edges: graph.edges.map((e) => ({ from: String(e.from), to: String(e.to), weight: 0 })),
  };
}
