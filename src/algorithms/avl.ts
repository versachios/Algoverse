// algorithms/avl.ts
// AVL = BST + self-balancing via rotations. Reuses TreeNode/TreeSnapshot shape from bst.ts
// so it can share the same TreeScene renderer.

import type { NodeState, TreeNode, TreeSnapshot } from "./bst";
import { computeLayout } from "./bst";

export interface AVLTreeNode extends TreeNode {
  height: number;
}

export class AVLTree {
  nodes: Record<string, AVLTreeNode> = {};
  rootId: string | null = null;
}

let _id = 0;
const freshId = () => `a${_id++}`;

const height = (tree: AVLTree, id: string | null) => (id ? tree.nodes[id].height : 0);
const balanceFactor = (tree: AVLTree, id: string) =>
  height(tree, tree.nodes[id].left) - height(tree, tree.nodes[id].right);

function updateHeight(tree: AVLTree, id: string) {
  const n = tree.nodes[id];
  n.height = 1 + Math.max(height(tree, n.left), height(tree, n.right));
}

function baseSnapshot(tree: AVLTree, message: string): TreeSnapshot {
  const states: Record<string, NodeState> = {};
  for (const id in tree.nodes) states[id] = "idle";
  return {
    nodes: structuredClone(tree.nodes),
    rootId: tree.rootId,
    states,
    edgeHighlight: null,
    message,
    done: false,
  };
}

// Standard rotations, returning the id of the subtree's new root.
function rotateRight(tree: AVLTree, yId: string): string {
  const y = tree.nodes[yId];
  const xId = y.left!;
  const x = tree.nodes[xId];
  y.left = x.right;
  x.right = yId;
  updateHeight(tree, yId);
  updateHeight(tree, xId);
  return xId;
}

function rotateLeft(tree: AVLTree, xId: string): string {
  const x = tree.nodes[xId];
  const yId = x.right!;
  const y = tree.nodes[yId];
  x.right = y.left;
  y.left = xId;
  updateHeight(tree, xId);
  updateHeight(tree, yId);
  return yId;
}

/** INSERT — yields comparison steps, then one snapshot per rotation performed (if any). */
export function* insertGenerator(tree: AVLTree, value: number): Generator<TreeSnapshot> {
  const path: string[] = [];

  function* insertRec(id: string | null): Generator<TreeSnapshot, string> {
    if (!id) {
      const newId = freshId();
      tree.nodes[newId] = { id: newId, value, left: null, right: null, height: 1, x: 0, y: 0, z: 0 };
      computeLayout(tree as any);
      const snap = baseSnapshot(tree, `Chèn ${value} vào vị trí trống.`);
      snap.states[newId] = "inserted";
      yield snap;
      return newId;
    }

    const node = tree.nodes[id];
    const cmp = baseSnapshot(tree, `So sánh ${value} với ${node.value}.`);
    cmp.states[id] = "comparing";
    yield cmp;

    if (value < node.value) {
      node.left = yield* insertRec(node.left);
    } else if (value > node.value) {
      node.right = yield* insertRec(node.right);
    } else {
      const dup = baseSnapshot(tree, `${value} đã tồn tại — bỏ qua.`);
      dup.states[id] = "found";
      dup.done = true;
      yield dup;
      return id;
    }

    updateHeight(tree, id);
    const bf = balanceFactor(tree, id);

    if (Math.abs(bf) > 1) {
      const balSnap = baseSnapshot(tree, `Mất cân bằng tại ${node.value} (balance factor = ${bf}).`);
      balSnap.states[id] = "deleted"; // repurpose "deleted" color (rust) to flag imbalance
      yield balSnap;

      let newRoot = id;
      if (bf > 1 && value < tree.nodes[node.left!].value) {
        newRoot = rotateRight(tree, id); // Left-Left
        computeLayout(tree as any);
        const s = baseSnapshot(tree, `Xoay phải tại ${node.value} (trường hợp Left-Left).`);
        s.states[newRoot] = "successor";
        yield s;
      } else if (bf < -1 && value > tree.nodes[node.right!].value) {
        newRoot = rotateLeft(tree, id); // Right-Right
        computeLayout(tree as any);
        const s = baseSnapshot(tree, `Xoay trái tại ${node.value} (trường hợp Right-Right).`);
        s.states[newRoot] = "successor";
        yield s;
      } else if (bf > 1) {
        node.left = rotateLeft(tree, node.left!); // Left-Right
        newRoot = rotateRight(tree, id);
        computeLayout(tree as any);
        const s = baseSnapshot(tree, `Xoay trái-phải tại ${node.value} (trường hợp Left-Right).`);
        s.states[newRoot] = "successor";
        yield s;
      } else {
        node.right = rotateRight(tree, node.right!); // Right-Left
        newRoot = rotateLeft(tree, id);
        computeLayout(tree as any);
        const s = baseSnapshot(tree, `Xoay phải-trái tại ${node.value} (trường hợp Right-Left).`);
        s.states[newRoot] = "successor";
        yield s;
      }
      return newRoot;
    }

    return id;
  }

  tree.rootId = yield* insertRec(tree.rootId);
  computeLayout(tree as any);
  const finalSnap = baseSnapshot(tree, `Hoàn tất chèn ${value}, cây đã cân bằng.`);
  finalSnap.done = true;
  yield finalSnap;
}

export const avlTheory = {
  title: "AVL Tree",
  bigO: { search: "O(log n)", insert: "O(log n)", delete: "O(log n)" },
  renderMode: "3d" as const,
  prerequisite: "bst",
};
