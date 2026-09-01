import type { AlgorithmModule, AlgorithmStep, TreeNodeData, TreeNodeRole } from "./types";

export const code = `struct Node {
    int value;
    Node *left, *right;
};

Node* insert(Node* root, int value) {
    if (!root) return new Node{value, nullptr, nullptr};
    if (value < root->value) root->left = insert(root->left, value);
    else if (value > root->value) root->right = insert(root->right, value);
    return root; // bỏ qua nếu trùng giá trị
}`;

let _id = 0;
const freshId = () => `n${_id++}`;

interface BuildState {
  nodes: Record<string, TreeNodeData>;
  rootId: string | null;
}

function snap(
  state: BuildState,
  explanation: string,
  codeLine: number,
  nodeStates: Record<string, TreeNodeRole> = {},
  edgeHighlight: [string, string] | null = null
): AlgorithmStep {
  return {
    kind: "tree",
    nodes: structuredClone(state.nodes),
    rootId: state.rootId,
    nodeStates,
    edgeHighlight,
    highlights: [],
    codeLine,
    explanation,
  };
}

export function* run(input: number[]): Generator<AlgorithmStep, void, unknown> {
  const state: BuildState = { nodes: {}, rootId: null };

  yield snap(state, `Bắt đầu với cây rỗng, sẽ chèn lần lượt ${input.length} giá trị.`, 6, {});

  for (const value of input) {
    if (!state.rootId) {
      const id = freshId();
      state.nodes[id] = { id, value, left: null, right: null };
      state.rootId = id;
      yield snap(state, `Cây rỗng — ${value} trở thành gốc.`, 7, { [id]: "inserted" });
      continue;
    }

    let currentId: string | null = state.rootId;
    let parentId: string | null = null;

    while (currentId) {
      const node: TreeNodeData = state.nodes[currentId];
      yield snap(
        state,
        `So sánh ${value} với ${node.value}.`,
        8,
        { [currentId]: "comparing" },
        parentId ? [parentId, currentId] : null
      );

      if (value === node.value) {
        yield snap(state, `${value} đã tồn tại trong cây — bỏ qua, không chèn trùng.`, 8, { [currentId]: "found" });
        currentId = null;
        parentId = "__dup__"; // sentinel to skip the insert-below block
        break;
      }
      parentId = currentId;
      currentId = value < node.value ? node.left : node.right;
    }

    if (parentId === "__dup__") continue;

    const id = freshId();
    state.nodes[id] = { id, value, left: null, right: null };
    const parent = state.nodes[parentId!];
    if (value < parent.value) parent.left = id;
    else parent.right = id;

    yield snap(
      state,
      `Chèn ${value} làm con của ${parent.value}.`,
      value < parent.value ? 7 : 8,
      { [id]: "inserted" },
      [parentId!, id]
    );
  }

  yield snap(state, `Hoàn tất chèn ${input.length} giá trị.`, 10, {});
}

export const bst: AlgorithmModule = {
  meta: {
    slug: "bst",
    name: "Binary Search Tree",
    group: "Tree",
    level: "Olympiad",
    renderMode: "3d",
    summary:
      "Cây nhị phân tìm kiếm: mỗi node có tối đa 2 con, con trái luôn nhỏ hơn, con phải luôn lớn hơn — cho phép tìm kiếm, chèn, xoá trong O(log n) trung bình.",
  },
  code,
  run,
};
