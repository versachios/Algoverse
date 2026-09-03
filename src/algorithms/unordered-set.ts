import type { AlgorithmModule, AlgorithmStep, HashCellRole } from "./types";
import { hashFn, hashStep } from "./hash-common";

export const code = `#include <unordered_set>
unordered_set<int> s;      // bảng băm chỉ lưu khóa
s.insert(12);
s.erase(12);
auto it = s.find(12);      // O(1) trung bình`;

interface Op {
  type: 1 | 2 | 3;
  key: number;
}

function parseOps(input: number[]): { numBuckets: number; ops: Op[] } {
  const [numBuckets, numOps, ...rest] = input;
  const ops: Op[] = [];
  for (let i = 0; i + 2 < rest.length && ops.length < numOps; i += 3) {
    ops.push({ type: rest[i] === 2 ? 2 : rest[i] === 3 ? 3 : 1, key: rest[i + 1] });
  }
  return { numBuckets, ops };
}

export function* run(input: number[]): Generator<AlgorithmStep, void, unknown> {
  const { numBuckets, ops } = parseOps(input);
  const buckets: { key: number }[][] = Array.from({ length: numBuckets }, () => []);

  yield hashStep(numBuckets, buckets, {}, 2, `Khởi tạo bảng băm ${numBuckets} bucket cho xét tập. Hàm băm: key % ${numBuckets}.`, { "Phần tử": 0 });

  for (const op of ops) {
    const b = hashFn(op.key, numBuckets);
    if (op.type === 1) {
      const idx = buckets[b].findIndex((it) => it.key === op.key);
      if (idx >= 0) {
        yield hashStep(numBuckets, buckets, { [`${b}:${idx}`]: "found" } as Record<string, HashCellRole>, 2, `Khóa ${op.key} đã có trong set — không chèn trùng.`, { "Phần tử": buckets.flat().length });
      } else {
        const newIdx = buckets[b].length;
        buckets[b].push({ key: op.key });
        const cs: Record<string, HashCellRole> = {};
        for (let k = 0; k < buckets[b].length; k++) cs[`${b}:${k}`] = "idle";
        cs[`${b}:${newIdx}`] = "inserted";
        yield hashStep(numBuckets, buckets, cs, 2, `hash(${op.key}) = ${op.key} % ${numBuckets} = ${b} → chèn ${op.key} vào bucket ${b}.`, { "Phần tử": buckets.flat().length });
      }
    } else if (op.type === 2) {
      const idx = buckets[b].findIndex((it) => it.key === op.key);
      if (idx >= 0) {
        const cs: Record<string, HashCellRole> = {};
        for (let k = 0; k < buckets[b].length; k++) cs[`${b}:${k}`] = "idle";
        cs[`${b}:${idx}`] = "deleted";
        yield hashStep(numBuckets, buckets, cs, 4, `hash(${op.key}) = ${b} → xóa ${op.key}.`, { "Phần tử": buckets.flat().length });
        buckets[b].splice(idx, 1);
      } else {
        yield hashStep(numBuckets, buckets, {}, 4, `erase(${op.key}): không tồn tại.`, { "Phần tử": buckets.flat().length });
      }
    } else {
      const idx = buckets[b].findIndex((it) => it.key === op.key);
      const cs: Record<string, HashCellRole> = {};
      for (let k = 0; k < buckets[b].length; k++) cs[`${b}:${k}`] = "idle";
      if (idx >= 0) cs[`${b}:${idx}`] = "found";
      yield hashStep(numBuckets, buckets, cs, 5, `hash(${op.key}) = ${b} → ${idx >= 0 ? "tìm thấy" : "không thấy"}.`, { "Phần tử": buckets.flat().length });
    }
  }

  yield hashStep(numBuckets, buckets, {}, 5, `Hoàn tất — set đang có ${buckets.flat().length} phần tử duy nhất.`, { "Phần tử": buckets.flat().length });
}

export const unorderedSet: AlgorithmModule = {
  meta: {
    slug: "unordered-set",
    name: "Hash Set (unordered_set)",
    group: "Data Structures",
    level: "Cấp 2 - Cấp 3",
    renderMode: "3d",
    summary:
      "unordered_set: bảng băm lưu tập các khóa duy nhất, insert/erase/find trung bình O(1).",
  },
  code,
  run,
};
