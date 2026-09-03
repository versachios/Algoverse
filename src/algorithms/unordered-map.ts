import type { AlgorithmModule, AlgorithmStep, HashCellRole } from "./types";
import { hashFn, hashStep } from "./hash-common";

export const code = `#include <unordered_map>
unordered_map<int, int> m;   // bảng băm: O(1) trung bình
m[12] = 5;                   // insert/update (băm rồi chèn vào bucket)
m.erase(12);                 // O(1) trung bình
auto it = m.find(35);        // O(1) trung bình`;

/**
 * Input packing: [numBuckets, numOps, op, key, val, ...]
 *   op = 1 → insert(key, val); 2 → erase(key); 3 → find(key).
 */
interface Op {
  type: 1 | 2 | 3;
  key: number;
  val: number;
}

function parseOps(input: number[]): { numBuckets: number; ops: Op[] } {
  const [numBuckets, numOps, ...rest] = input;
  const ops: Op[] = [];
  for (let i = 0; i + 2 < rest.length && ops.length < numOps; i += 3) {
    ops.push({ type: rest[i] === 2 ? 2 : rest[i] === 3 ? 3 : 1, key: rest[i + 1], val: rest[i + 2] });
  }
  return { numBuckets, ops };
}

export function* run(input: number[]): Generator<AlgorithmStep, void, unknown> {
  const { numBuckets, ops } = parseOps(input);
  const buckets: { key: number; value?: number }[][] = Array.from({ length: numBuckets }, () => []);

  yield hashStep(numBuckets, buckets, {}, 2, `Khởi tạo bảng băm với ${numBuckets} bucket (chaining). Hàm băm: key % ${numBuckets}.`, { "Phần tử": 0 });

  for (const op of ops) {
    const b = hashFn(op.key, numBuckets);
    if (op.type === 1) {
      const existing = buckets[b].findIndex((it) => it.key === op.key);
      if (existing >= 0) {
        const idx = existing;
        buckets[b][idx].value = op.val;
        yield hashStep(numBuckets, buckets, { [`${b}:${idx}`]: "inserted" } as Record<string, HashCellRole>, 2, `Khóa ${op.key} đã ở bucket ${b} → cập nhật giá trị thành ${op.val}.`, { "Phần tử": buckets.flat().length });
      } else {
        const idx = buckets[b].length;
        buckets[b].push({ key: op.key, value: op.val });
        const cs: Record<string, HashCellRole> = {};
        for (let k = 0; k < buckets[b].length; k++) cs[`${b}:${k}`] = "idle";
        cs[`${b}:${idx}`] = "inserted";
        yield hashStep(numBuckets, buckets, cs, 2, `hash(${op.key}) = ${op.key} % ${numBuckets} = ${b} → chèn (${op.key}: ${op.val}) vào bucket ${b}` + (idx > 0 ? ` (xung đột: đã có ${idx} phần tử, nối chuỗi).` : "."), { "Phần tử": buckets.flat().length });
      }
    } else if (op.type === 2) {
      const idx = buckets[b].findIndex((it) => it.key === op.key);
      if (idx >= 0) {
        const cs: Record<string, HashCellRole> = {};
        for (let k = 0; k < buckets[b].length; k++) cs[`${b}:${k}`] = "idle";
        cs[`${b}:${idx}`] = "deleted";
        yield hashStep(numBuckets, buckets, cs, 4, `hash(${op.key}) = ${b} → tìm thấy tại bucket ${b} vị trí ${idx}, xóa khỏi chuỗi.`, { "Phần tử": buckets.flat().length });
        buckets[b].splice(idx, 1);
      } else {
        yield hashStep(numBuckets, buckets, {}, 4, `erase(${op.key}): không tồn tại (bucket ${b} trống/không có khóa).`, { "Phần tử": buckets.flat().length });
      }
    } else {
      const idx = buckets[b].findIndex((it) => it.key === op.key);
      const cs: Record<string, HashCellRole> = {};
      for (let k = 0; k < buckets[b].length; k++) cs[`${b}:${k}`] = "idle";
      if (idx >= 0) cs[`${b}:${idx}`] = "found";
      yield hashStep(numBuckets, buckets, cs, 5, `hash(${op.key}) = ${b} → tìm ${idx >= 0 ? `thấy giá trị ${buckets[b][idx].value} tại bucket ${b}` : `không thấy (xét bucket ${b})`}.`, { "Phần tử": buckets.flat().length });
    }
  }

  yield hashStep(numBuckets, buckets, {}, 5, `Hoàn tất — bảng băm đang chứa ${buckets.flat().length} phần tử.`, { "Phần tử": buckets.flat().length });
}

export const unorderedMap: AlgorithmModule = {
  meta: {
    slug: "unordered-map",
    name: "Hash Map (unordered_map)",
    group: "Data Structures",
    level: "Cấp 2 - Cấp 3",
    renderMode: "3d",
    summary:
      "unordered_map: bảng băm với chaining (chuỗi bucket), insert/find/erase trung bình O(1).",
  },
  code,
  run,
};
