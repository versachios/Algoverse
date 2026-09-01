import type { AlgorithmModule, AlgorithmStep, TreeNodeData, TreeNodeRole } from "./types";

export const code = `vector<int> heap;

void siftUp(int i) {
    while (i > 0) {
        int p = (i - 1) / 2;
        if (heap[i] >= heap[p]) break;
        swap(heap[i], heap[p]);
        i = p;
    }
}

void insertHeap(int value) {
    heap.push_back(value);
    siftUp(heap.size() - 1);
}`;

const parentIdx = (i: number) => Math.floor((i - 1) / 2);
const leftIdx = (i: number) => 2 * i + 1;
const rightIdx = (i: number) => 2 * i + 2;

function snapFromArray(
  arr: number[],
  nodeStates: Record<number, TreeNodeRole>,
  edgeHighlight: [number, number] | null,
  explanation: string,
  codeLine: number
): AlgorithmStep {
  const nodes: Record<string, TreeNodeData> = {};
  arr.forEach((val, i) => {
    nodes[String(i)] = {
      id: String(i),
      value: val,
      left: leftIdx(i) < arr.length ? String(leftIdx(i)) : null,
      right: rightIdx(i) < arr.length ? String(rightIdx(i)) : null,
    };
  });
  const states: Record<string, TreeNodeRole> = {};
  for (const k in nodeStates) states[String(k)] = nodeStates[Number(k)];

  return {
    kind: "tree",
    nodes,
    rootId: arr.length ? "0" : null,
    nodeStates: states,
    edgeHighlight: edgeHighlight ? [String(edgeHighlight[0]), String(edgeHighlight[1])] : null,
    highlights: [],
    codeLine,
    explanation,
  };
}

export function* run(input: number[]): Generator<AlgorithmStep, void, unknown> {
  const heap: number[] = [];

  yield snapFromArray(heap, {}, null, `Heap rỗng, sẽ chèn ${input.length} giá trị lần lượt.`, 12);

  for (const value of input) {
    heap.push(value);
    let i = heap.length - 1;
    yield snapFromArray(heap, { [i]: "inserted" }, null, `Thêm ${value} vào cuối mảng (lá cuối cùng của cây).`, 13);

    while (i > 0) {
      const p = parentIdx(i);
      yield snapFromArray(
        heap,
        { [i]: "comparing", [p]: "comparing" },
        [p, i],
        `So sánh ${heap[i]} với cha ${heap[p]}.`,
        5
      );

      if (heap[i] < heap[p]) {
        [heap[i], heap[p]] = [heap[p], heap[i]];
        yield snapFromArray(
          heap,
          { [i]: "path", [p]: "highlight" },
          [p, i],
          `${heap[p]} < cha cũ — đổi chỗ (sift up).`,
          6
        );
        i = p;
      } else {
        break;
      }
    }
  }

  yield snapFromArray(heap, {}, null, `Hoàn tất chèn ${input.length} giá trị — gốc luôn là phần tử nhỏ nhất.`, 14);
}

export const minHeap: AlgorithmModule = {
  meta: {
    slug: "min-heap",
    name: "Min-Heap",
    group: "Tree",
    level: "Olympiad",
    renderMode: "3d",
    summary:
      "Cây nhị phân gần-hoàn-chỉnh lưu trên mảng phẳng: mỗi node luôn nhỏ hơn hoặc bằng 2 con của nó, nên gốc luôn là giá trị nhỏ nhất. Cây ở đây chỉ là cách hình dung — dữ liệu thật là một mảng.",
  },
  code,
  run,
};
