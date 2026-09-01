import type { AlgorithmModule, AlgorithmStep, TreeNodeData, TreeNodeRole } from "./types";

export const code = `struct Node {
    int value, height;
    Node *left, *right;
};

int height(Node* n) { return n ? n->height : 0; }
int balance(Node* n) { return height(n->left) - height(n->right); }

Node* rotateRight(Node* y) {
    Node* x = y->left;
    y->left = x->right; x->right = y;
    y->height = 1 + max(height(y->left), height(y->right));
    x->height = 1 + max(height(x->left), height(x->right));
    return x;
}
Node* rotateLeft(Node* x) {
    Node* y = x->right;
    x->right = y->left; y->left = x;
    x->height = 1 + max(height(x->left), height(x->right));
    y->height = 1 + max(height(y->left), height(y->right));
    return y;
}

Node* insert(Node* node, int value) {
    if (!node) return new Node{value, 1, nullptr, nullptr};
    if (value < node->value) node->left = insert(node->left, value);
    else if (value > node->value) node->right = insert(node->right, value);
    else return node;

    node->height = 1 + max(height(node->left), height(node->right));
    int bf = balance(node);

    if (bf > 1 && value < node->left->value) return rotateRight(node);          // Left-Left
    if (bf < -1 && value > node->right->value) return rotateLeft(node);         // Right-Right
    if (bf > 1) { node->left = rotateLeft(node->left); return rotateRight(node); }   // Left-Right
    if (bf < -1) { node->right = rotateRight(node->right); return rotateLeft(node); } // Right-Left
    return node;
}`;

interface AVLNode extends TreeNodeData {
  height: number;
}

let _id = 0;
const freshId = () => `v${_id++}`;

interface BuildState {
  nodes: Record<string, AVLNode>;
  rootId: string | null;
}

const h = (state: BuildState, id: string | null) => (id ? state.nodes[id].height : 0);
const bf = (state: BuildState, id: string) => h(state, state.nodes[id].left) - h(state, state.nodes[id].right);
const updH = (state: BuildState, id: string) => {
  state.nodes[id].height = 1 + Math.max(h(state, state.nodes[id].left), h(state, state.nodes[id].right));
};

function rotateRight(state: BuildState, yId: string): string {
  const y = state.nodes[yId];
  const xId = y.left!;
  const x = state.nodes[xId];
  y.left = x.right;
  x.right = yId;
  updH(state, yId);
  updH(state, xId);
  return xId;
}
function rotateLeft(state: BuildState, xId: string): string {
  const x = state.nodes[xId];
  const yId = x.right!;
  const y = state.nodes[yId];
  x.right = y.left;
  y.left = xId;
  updH(state, xId);
  updH(state, yId);
  return yId;
}

function snap(
  state: BuildState,
  explanation: string,
  codeLine: number,
  nodeStates: Record<string, TreeNodeRole> = {}
): AlgorithmStep {
  return {
    kind: "tree",
    nodes: structuredClone(state.nodes),
    rootId: state.rootId,
    nodeStates,
    edgeHighlight: null,
    highlights: [],
    codeLine,
    explanation,
  };
}

export function* run(input: number[]): Generator<AlgorithmStep, void, unknown> {
  const state: BuildState = { nodes: {}, rootId: null };

  yield snap(state, `Bắt đầu với cây AVL rỗng, sẽ chèn ${input.length} giá trị và tự cân bằng sau mỗi lần chèn.`, 24);

  for (const value of input) {
    function* insertRec(id: string | null): Generator<AlgorithmStep, string, unknown> {
      if (!id) {
        const nid = freshId();
        state.nodes[nid] = { id: nid, value, left: null, right: null, height: 1 };
        yield snap(state, `Chèn ${value} vào vị trí trống.`, 25, { [nid]: "inserted" });
        return nid;
      }
      const node = state.nodes[id];
      yield snap(state, `So sánh ${value} với ${node.value}.`, 26, { [id]: "comparing" });

      if (value < node.value) node.left = yield* insertRec(node.left);
      else if (value > node.value) node.right = yield* insertRec(node.right);
      else {
        yield snap(state, `${value} đã tồn tại — bỏ qua.`, 29, { [id]: "found" });
        return id;
      }

      updH(state, id);
      const balance = bf(state, id);

      if (Math.abs(balance) > 1) {
        yield snap(state, `Mất cân bằng tại ${node.value} (balance factor = ${balance}).`, 32, { [id]: "flagged" });

        let newRoot = id;
        if (balance > 1 && value < state.nodes[node.left!].value) {
          newRoot = rotateRight(state, id);
          yield snap(state, `Xoay phải tại ${node.value} — trường hợp Left-Left.`, 36, { [newRoot]: "highlight" });
        } else if (balance < -1 && value > state.nodes[node.right!].value) {
          newRoot = rotateLeft(state, id);
          yield snap(state, `Xoay trái tại ${node.value} — trường hợp Right-Right.`, 37, { [newRoot]: "highlight" });
        } else if (balance > 1) {
          node.left = rotateLeft(state, node.left!);
          newRoot = rotateRight(state, id);
          yield snap(state, `Xoay trái-phải tại ${node.value} — trường hợp Left-Right.`, 38, { [newRoot]: "highlight" });
        } else {
          node.right = rotateRight(state, node.right!);
          newRoot = rotateLeft(state, id);
          yield snap(state, `Xoay phải-trái tại ${node.value} — trường hợp Right-Left.`, 39, { [newRoot]: "highlight" });
        }
        return newRoot;
      }
      return id;
    }

    state.rootId = yield* insertRec(state.rootId);
    yield snap(state, `Hoàn tất chèn ${value}, cây vẫn cân bằng.`, 40);
  }

  yield snap(state, `Hoàn tất chèn ${input.length} giá trị — cây AVL luôn cân bằng sau mỗi bước.`, 40);
}

export const avlTree: AlgorithmModule = {
  meta: {
    slug: "avl-tree",
    name: "AVL Tree",
    group: "Tree",
    level: "Olympiad",
    renderMode: "3d",
    summary:
      "BST tự cân bằng: sau mỗi lần chèn, nếu chênh lệch chiều cao giữa 2 cây con (balance factor) vượt quá 1, thực hiện xoay (rotation) để đưa cây về trạng thái cân bằng, đảm bảo O(log n) trong mọi trường hợp.",
  },
  code,
  run,
};
