"use client";

import { useEffect, useMemo, useState } from "react";
import { BarsScene } from "@/components/render-3d/BarsScene";
import { bubbleSort } from "@/algorithms/bubble-sort";
import type { ArrayStep } from "@/algorithms/types";

function shuffled() {
  const base = [5, 8, 2, 9, 3, 6, 1];
  return [...base].sort(() => Math.random() - 0.5);
}

export function HeroLoop() {
  const [steps, setSteps] = useState<ArrayStep[]>(() => [...bubbleSort.run(shuffled())] as ArrayStep[]);
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCursor((c) => {
        if (c + 1 >= steps.length) {
          setSteps([...bubbleSort.run(shuffled())] as ArrayStep[]);
          return 0;
        }
        return c + 1;
      });
    }, 550);
    return () => clearInterval(id);
  }, [steps.length]);

  const step = useMemo(() => steps[cursor], [steps, cursor]);
  if (!step) return null;

  return (
    <div className="relative h-full w-full">
      <BarsScene step={step} />
      <div className="pointer-events-none absolute bottom-3 left-3 font-mono-tech text-[11px] text-[var(--color-muted)] uppercase tracking-widest">
        đang chạy trực tiếp: bubble sort
      </div>
    </div>
  );
}
