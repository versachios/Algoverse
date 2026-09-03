import type { AlgorithmModule, AlgorithmStep, RbtNodeRole } from "./types";
import { Rbt } from "./rbt-core";

export const code = `#include <map>
map<int, int> m;                 // cây đỏ-đen, khóa có thứ tự
m[10] = 5;                       // insert or update (O(log n))
m.insert({25, 2});
auto it = m.find(35);            // O(log n)
m.erase(12);                     // O(log n)`;

/**
 * Input packing: [numOps, op, key, val, ...] with:
 *   op = 1 → insert(key, val); 2 → erase(key); 3 → find(key).
 */
interface RbOp {
  type: 1 | 2 | 3;
  key: number;
  val: number;
}

function parseOps(input: number[]): { ops: RbOp[] } {
  const [numOps, ...rest] = input;
  const ops: RbOp[] = [];
  for (let i = 0; i + 2 < rest.length && ops.length < numOps; i += 3) {
    ops.push({ type: rest[i] === 2 ? 2 : rest[i] === 3 ? 3 : 1, key: rest[i + 1], val: rest[i + 2] });
  }
  return { ops };
}

function snap(
  rbt: Rbt,
  nodeStates: Record<string, RbtNodeRole>,
  codeLine: number,
  explanation: string,
  stats: Record<string, number>,
  edgeHighlight?: [string, string]
): AlgorithmStep {
  return {
    kind: "rbt",
    nodes: rbt.nodes,
    rootId: rbt.rootId,
    nodeStates,
    edgeHighlight,
    highlights: [],
    codeLine,
    explanation,
    stats,
  };
}

export function* run(input: number[]): Generator<AlgorithmStep, void, unknown> {
  const { ops } = parseOps(input);
  const rbt = new Rbt();
  const empty: Record<string, RbtNodeRole> = {};

  yield snap(rbt, empty, 2, `Khởi tạo cây đỏ-đen rỗng. mỗi nút có khóa và màu (đỏ/đen).`, { "Nút": 0 });

  for (const op of ops) {
    if (op.type === 1) {
      const states: Record<string, RbtNodeRole> = {};
      const id = rbt.find(op.key);
      if (id) {
        states[id] = "found";
        yield snap(rbt, states, 3, `Khóa ${op.key} đã tồn tại → cập nhật giá trị thành ${op.val}.`, { "Nút": Object.keys(rbt.nodes).length });
        rbt.nodes[id].value = op.val;
      } else {
        rbt.insert(op.key, op.val, () => {});
        // highlight the inserted chain — mark the node inserted
        const insStates: Record<string, RbtNodeRole> = { [rbt.find(op.key)!]: "inserted" };
        yield snap(rbt, insStates, 4, `Chèn khóa ${op.key} vào cây đỏ-đen và cân bằng lại (đổi màu / xoay) để giữ đỏ-đen.`, { "Nút": Object.keys(rbt.nodes).length });
      }
    } else if (op.type === 2) {
      const id = rbt.find(op.key);
      if (id) {
        rbt.remove(op.key, () => {});
        yield snap(rbt, empty, 7, `Xóa khóa ${op.key} rồi tái cân bằng cây đỏ-đen.`, { "Nút": Object.keys(rbt.nodes).length });
      } else {
        yield snap(rbt, empty, 7, `Khóa ${op.key} không tồn tại — không thể xóa.`, { "Nút": Object.keys(rbt.nodes).length });
      }
    } else {
      const id = rbt.find(op.key);
      const states: Record<string, RbtNodeRole> = id ? { [id]: "found" } : {};
      yield snap(rbt, states, 5, `find(${op.key}) → ${id ? `tìm thấy tại nút ${id}, giá trị ${rbt.nodes[id].value}` : `không tồn tại (đi qua nhánh trái/phải theo khóa)`}.`, { "Nút": Object.keys(rbt.nodes).length });
    }
  }

  yield snap(rbt, empty, 4, `Hoàn tất — cây đỏ-đen luôn cân bằng (đường đi từ gốc tới lá có cùng số nút đen).`, { "Nút": Object.keys(rbt.nodes).length });
}

export const treeMap: AlgorithmModule = {
  meta: {
    slug: "tree-map",
    name: "Tree Map (std::map)",
    group: "Data Structures",
    level: "Cấp 2 - Cấp 3",
    renderMode: "3d",
    summary:
      "std::map: cây đỏ-đen lưu các cặp khóa→giá trị có thứ tự, insert/find/erase đều O(log n).",
  },
  code,
  run,
};
