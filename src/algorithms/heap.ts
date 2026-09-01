// algorithms/heap.ts
// Min-Heap: stored as an array (standard heap representation) but rendered as a tree
// by deriving parent/child ids from array indices — reuses TreeScene.

import type { NodeState, TreeNode, TreeSnapshot } from "./bst";
import { computeLayout } from "./bst";

export class MinHeap {
  values: number[] = [];
}

const parentIdx = (i: number) => Math.floor((i - 1) / 2);
const leftIdx = (i: number) => 2 * i + 1;
const rightIdx = (i: number) => 2 * i + 2;

/** Rebuilds a TreeSnapshot-compatible node map from the flat heap array every yield. */
function snapshotFromArray(
  arr: number[],
  states: Record<number, NodeState>,
  edgeHighlight: [number, number] | null,
  message: string,
  done = false
): TreeSnapshot {
  const nodes: Record<string, TreeNode> = {};
  arr.forEach((val, i) => {
    nodes[String(i)] = {
      id: String(i),
      value: val,
      left: leftIdx(i) < arr.length ? String(leftIdx(i)) : null,
      right: rightIdx(i) < arr.length ? String(rightIdx(i)) : null,
      x: 0,
      y: 0,
      z: 0,
    };
  });
  const fakeTree = { nodes, rootId: arr.length ? "0" : null } as any;
  computeLayout(fakeTree);

  const nodeStates: Record<string, NodeState> = {};
  arr.forEach((_, i) => (nodeStates[String(i)] = states[i] ?? "idle"));

  return {
    nodes: fakeTree.nodes,
    rootId: fakeTree.rootId,
    states: nodeStates,
    edgeHighlight: edgeHighlight ? [String(edgeHighlight[0]), String(edgeHighlight[1])] : null,
    message,
    done,
  };
}

/** INSERT — push to end, sift up, yielding one snapshot per swap comparison. */
export function* insertGenerator(heap: MinHeap, value: number): Generator<TreeSnapshot> {
  heap.values.push(value);
  let i = heap.values.length - 1;
  yield snapshotFromArray(heap.values, { [i]: "inserted" }, null, `Thêm ${value} vào cuối mảng (lá cuối cùng của cây).`);

  while (i > 0) {
    const p = parentIdx(i);
    const cmp = snapshotFromArray(
      heap.values,
      { [i]: "comparing", [p]: "comparing" },
      [p, i],
      `So sánh ${heap.values[i]} với cha ${heap.values[p]}.`
    );
    yield cmp;

    if (heap.values[i] < heap.values[p]) {
      [heap.values[i], heap.values[p]] = [heap.values[p], heap.values[i]];
      yield snapshotFromArray(
        heap.values,
        { [i]: "path", [p]: "successor" },
        [p, i],
        `${heap.values[p]} < cha — đổi chỗ (sift up).`
      );
      i = p;
    } else {
      break;
    }
  }

  const final = snapshotFromArray(heap.values, {}, null, `Hoàn tất chèn ${value}.`);
  final.done = true;
  yield final;
}

/** EXTRACT-MIN — swap root with last, pop, sift down. */
export function* extractMinGenerator(heap: MinHeap): Generator<TreeSnapshot> {
  if (heap.values.length === 0) {
    const empty = snapshotFromArray([], {}, null, `Heap rỗng.`);
    empty.done = true;
    yield empty;
    return;
  }

  const min = heap.values[0];
  yield snapshotFromArray(heap.values, { 0: "found" }, null, `Gốc ${min} là giá trị nhỏ nhất — sẽ lấy ra.`);

  const last = heap.values.pop()!;
  if (heap.values.length > 0) {
    heap.values[0] = last;
  }
  yield snapshotFromArray(heap.values, { 0: "comparing" }, null, `Đưa phần tử cuối (${last}) lên gốc, chuẩn bị sift down.`);

  let i = 0;
  while (true) {
    const l = leftIdx(i);
    const r = rightIdx(i);
    let smallest = i;
    if (l < heap.values.length && heap.values[l] < heap.values[smallest]) smallest = l;
    if (r < heap.values.length && heap.values[r] < heap.values[smallest]) smallest = r;

    if (smallest === i) break;

    const cmp = snapshotFromArray(
      heap.values,
      { [i]: "comparing", [smallest]: "comparing" },
      [i, smallest],
      `Con nhỏ hơn (${heap.values[smallest]}) < ${heap.values[i]} — đổi chỗ (sift down).`
    );
    yield cmp;

    [heap.values[i], heap.values[smallest]] = [heap.values[smallest], heap.values[i]];
    i = smallest;
  }

  const final = snapshotFromArray(heap.values, {}, null, `Đã lấy ra ${min}, heap được sắp xếp lại.`);
  final.done = true;
  yield final;
}

export const heapTheory = {
  title: "Min-Heap",
  bigO: { insert: "O(log n)", extractMin: "O(log n)", peek: "O(1)" },
  renderMode: "3d" as const,
  note: "Dùng chung TreeScene với BST/AVL, nhưng cấu trúc dữ liệu thật là mảng — cây chỉ là cách hình dung.",
};
