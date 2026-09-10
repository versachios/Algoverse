import type { AlgorithmModule, AlgorithmStep, TreeNodeData, TreeNodeRole } from "./types";

export const code = `// dp0[v]: MIS lớn nhất trong cây con gốc v, KHÔNG chọn v
// dp1[v]: MIS lớn nhất trong cây con gốc v, CÓ chọn v
int dp0[N], dp1[N];
vector<int> child[N]; // con trái, con phải (nếu có) của v

void solve(int v) {                    // gọi theo thứ tự hậu duyệt (con trước cha)
    dp1[v] = w[v];
    dp0[v] = 0;
    for (int c : child[v]) {
        dp1[v] += dp0[c];              // chọn v -> con phải bị loại
        dp0[v] += max(dp0[c], dp1[c]); // không chọn v -> con tự do
    }
}
// đáp án: max(dp0[root], dp1[root])`;

const leftIdx = (i: number) => 2 * i + 1;
const rightIdx = (i: number) => 2 * i + 2;

function snap(
  values: number[],
  n: number,
  nodeStates: Record<number, TreeNodeRole>,
  edgeHighlight: [number, number] | null,
  explanation: string,
  codeLine: number
): AlgorithmStep {
  const nodes: Record<string, TreeNodeData> = {};
  for (let i = 0; i < n; i++) {
    nodes[String(i)] = {
      id: String(i),
      value: values[i],
      left: leftIdx(i) < n ? String(leftIdx(i)) : null,
      right: rightIdx(i) < n ? String(rightIdx(i)) : null,
    };
  }
  const states: Record<string, TreeNodeRole> = {};
  for (const k in nodeStates) states[String(k)] = nodeStates[Number(k)];

  return {
    kind: "tree",
    nodes,
    rootId: n ? "0" : null,
    nodeStates: states,
    edgeHighlight: edgeHighlight ? [String(edgeHighlight[0]), String(edgeHighlight[1])] : null,
    highlights: [],
    codeLine,
    explanation,
  };
}

export function* run(input: number[]): Generator<AlgorithmStep, void, unknown> {
  const weight = input;
  const n = weight.length;
  const dp0 = new Array<number>(n).fill(0);
  const dp1 = new Array<number>(n).fill(0);
  // What TreeScene displays per node: the raw weight until solved, then dp[v].
  const shown = [...weight];
  const done = new Array<boolean>(n).fill(false);

  yield snap(
    shown,
    n,
    {},
    null,
    `Cây nhị phân gần-hoàn-chỉnh với ${n} nút, mỗi nút mang 1 trọng số. Tìm tập nút không có 2 nút kề nhau (cha-con) với tổng trọng số lớn nhất — xử lý con trước, cha sau (hậu duyệt).`,
    6
  );

  // codeLine map: 6 = "void solve(int v) {", 7 = "dp1[v] = w[v];",
  // 11 = the dp0[v] += max(...) update line, 13 = closing "}" of solve().

  // Array-index children always have a larger index than their parent, so a
  // simple reverse scan is already valid post-order — no explicit recursion needed.
  for (let v = n - 1; v >= 0; v--) {
    const children = [leftIdx(v), rightIdx(v)].filter((c) => c < n);
    const childList = children.map((c) => `nút ${c} (dp=${shown[c]})`).join(", ") || "không có con (lá)";
    yield snap(shown, n, { [v]: "comparing" }, null, `Đang xét nút ${v} (trọng số ${weight[v]}) — các con: ${childList}.`, 7);

    dp1[v] = weight[v];
    dp0[v] = 0;
    for (const c of children) {
      dp1[v] += dp0[c];
      dp0[v] += Math.max(dp0[c], dp1[c]);
      yield snap(
        shown,
        n,
        { [v]: "comparing", [c]: "path" },
        [v, c],
        `dp1[${v}] += dp0[${c}] = ${dp0[c]} → dp1[${v}]=${dp1[v]}; dp0[${v}] += max(dp0[${c}], dp1[${c}]) = max(${dp0[c]}, ${dp1[c]}) → dp0[${v}]=${dp0[v]}.`,
        11
      );
    }

    shown[v] = Math.max(dp0[v], dp1[v]);
    done[v] = true;
    yield snap(shown, n, { [v]: "inserted" }, null, `dp[${v}] = max(dp0=${dp0[v]}, dp1=${dp1[v]}) = ${shown[v]} — nút ${v} hoàn tất.`, 13);
  }

  // Reconstruct the chosen set top-down: a node is taken only when doing so
  // beats (or ties) leaving it out, and taking it forces both children out.
  const selected = new Array<boolean>(n).fill(false);
  const stack: { v: number; forcedSkip: boolean }[] = n ? [{ v: 0, forcedSkip: false }] : [];
  while (stack.length) {
    const { v, forcedSkip } = stack.pop()!;
    const take = !forcedSkip && dp1[v] >= dp0[v];
    selected[v] = take;
    for (const c of [leftIdx(v), rightIdx(v)]) {
      if (c < n) stack.push({ v: c, forcedSkip: take });
    }
  }

  const finalStates: Record<number, TreeNodeRole> = {};
  for (let i = 0; i < n; i++) finalStates[i] = selected[i] ? "flagged" : "idle";
  const total = selected.reduce((s, sel, i) => s + (sel ? weight[i] : 0), 0);
  const chosen = selected.map((sel, i) => (sel ? i : null)).filter((i) => i !== null).join(", ") || "—";
  yield snap(
    weight,
    n,
    finalStates,
    null,
    `Hoàn tất — tập độc lập trọng số lớn nhất gồm các nút {${chosen}}, tổng = ${total} (= dp[gốc]).`,
    14
  );
}

export const treeDp: AlgorithmModule = {
  meta: {
    slug: "tree-dp",
    name: "DP trên cây (Max Weight Independent Set)",
    group: "DP",
    level: "Olympiad",
    renderMode: "3d",
    summary:
      "Quy hoạch động trên cây: mỗi nút giữ 2 trạng thái — có chọn hay không chọn — và ghép kết quả từ con lên cha theo thứ tự hậu duyệt. Minh họa bằng bài Tập độc lập trọng số lớn nhất trên cây nhị phân.",
  },
  code,
  run,
};
