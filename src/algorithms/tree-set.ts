import type { AlgorithmModule, AlgorithmStep, RbtNodeRole } from "./types";
import { Rbt } from "./rbt-core";

export const code = `#include <set>
set<int> s;                    // cây đỏ-đen, chỉ lưu khóa (không trùng)
s.insert(10);
s.insert(25);
auto it = s.find(35);          // O(log n)
s.erase(12);                   // O(log n)`;

interface RbOp {
  type: 1 | 2 | 3;
  key: number;
}

function parseOps(input: number[]): { ops: RbOp[] } {
  const [numOps, ...rest] = input;
  const ops: RbOp[] = [];
  for (let i = 0; i + 2 < rest.length && ops.length < numOps; i += 3) {
    ops.push({ type: rest[i] === 2 ? 2 : rest[i] === 3 ? 3 : 1, key: rest[i + 1] });
  }
  return { ops };
}

function snap(
  rbt: Rbt,
  nodeStates: Record<string, RbtNodeRole>,
  codeLine: number,
  explanation: string,
  stats: Record<string, number>
): AlgorithmStep {
  return {
    kind: "rbt",
    nodes: rbt.nodes,
    rootId: rbt.rootId,
    nodeStates,
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

  yield snap(rbt, empty, 2, `Khởi tạo set đỏ-đen rỗng — chỉ lưu khóa duy nhất, có thứ tự.`, { "Nút": 0 });

  for (const op of ops) {
    if (op.type === 1) {
      const id = rbt.find(op.key);
      if (id) {
        yield snap(rbt, { [id]: "found" }, 3, `Khóa ${op.key} đã có trong set — không chèn trùng.`, { "Nút": Object.keys(rbt.nodes).length });
      } else {
        rbt.insert(op.key, undefined, () => {});
        yield snap(rbt, { [rbt.find(op.key)!]: "inserted" }, 3, `Chèn ${op.key} và cân bằng cây đỏ-đen (đổi màu/xoay).`, { "Nút": Object.keys(rbt.nodes).length });
      }
    } else if (op.type === 2) {
      if (rbt.find(op.key)) {
        rbt.remove(op.key, () => {});
        yield snap(rbt, empty, 6, `Xóa ${op.key} rồi tái cân bằng cây đỏ-đen.`, { "Nút": Object.keys(rbt.nodes).length });
      } else {
        yield snap(rbt, empty, 6, `Khóa ${op.key} không tồn tại — không thể xóa.`, { "Nút": Object.keys(rbt.nodes).length });
      }
    } else {
      const id = rbt.find(op.key);
      yield snap(rbt, id ? { [id]: "found" } : empty, 4, `find(${op.key}) → ${id ? "tìm thấy" : "không tồn tại"}.`, { "Nút": Object.keys(rbt.nodes).length });
    }
  }

  yield snap(rbt, empty, 4, `Hoàn tất — set luôn giữ các khóa duy nhất, có thứ tự, cân bằng.`, { "Nút": Object.keys(rbt.nodes).length });
}

export const treeSet: AlgorithmModule = {
  meta: {
    slug: "tree-set",
    name: "Tree Set (std::set)",
    group: "Data Structures",
    level: "Cấp 2 - Cấp 3",
    renderMode: "3d",
    summary:
      "std::set: cây đỏ-đen lưu các khóa duy nhất, có thứ tự; insert/erase/find đều O(log n).",
  },
  code,
  run,
};
