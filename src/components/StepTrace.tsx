"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";
import { usePlaybackStore } from "@/store/playback-store";

const TICK_COLOR: Record<string, string> = {
  comparing: "var(--color-signal-amber)",
  swapping: "var(--color-signal-rose)",
  default: "var(--color-hairline)",
};

function tickColorFor(step: { highlights: { role: string }[] }) {
  if (step.highlights.some((h) => h.role === "swapping")) return TICK_COLOR.swapping;
  if (step.highlights.some((h) => h.role === "comparing")) return TICK_COLOR.comparing;
  return TICK_COLOR.default;
}

export function StepTrace() {
  const { steps, cursor, playing, speedMs, toggle, next, prev, reset, seek, setSpeed } =
    usePlaybackStore();
  const step = steps[cursor];
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        usePlaybackStore.getState().next();
      }, speedMs);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, speedMs]);

  if (!step) return null;

  return (
    <div className="blueprint-frame rounded-md p-3 flex flex-col gap-3">
      {/* the trace: every yielded step as a tick you can scrub */}
      <div className="relative h-10 flex items-end gap-[2px] overflow-x-auto pb-1">
        {steps.map((s, i) => (
          <button
            key={i}
            aria-label={`Bước ${i + 1}`}
            onClick={() => seek(i)}
            className="shrink-0 w-[3px] rounded-t-sm transition-[height,opacity] duration-150"
            style={{
              height: i === cursor ? "100%" : "55%",
              background: i === cursor ? "var(--color-signal-amber)" : tickColorFor(s),
              opacity: i <= cursor ? 1 : 0.35,
            }}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex items-center gap-1.5">
          <button onClick={reset} className="control-btn" aria-label="Về đầu">
            ⏮
          </button>
          <button onClick={prev} className="control-btn" aria-label="Lùi 1 bước">
            ‹
          </button>
          <button
            onClick={toggle}
            className="control-btn w-16 !text-[var(--color-signal-amber)]"
            aria-label={playing ? "Tạm dừng" : "Phát"}
          >
            {playing ? "⏸ Dừng" : "▶ Chạy"}
          </button>
          <button onClick={next} className="control-btn" aria-label="Tiến 1 bước">
            ›
          </button>
        </div>

        <div className="flex items-center gap-2 font-mono-tech text-xs text-[var(--color-muted)]">
          <span>
            BƯỚC {String(cursor + 1).padStart(2, "0")}/{String(steps.length).padStart(2, "0")}
          </span>
          {step.stats &&
            Object.entries(step.stats).map(([k, v]) => (
              <span key={k} className={clsx("px-1.5 py-0.5 rounded bg-[var(--color-panel-raised)]")}>
                {k}: {v}
              </span>
            ))}
          <label className="flex items-center gap-1.5 pl-2">
            Tốc độ
            <input
              type="range"
              min={120}
              max={1200}
              step={20}
              value={1320 - speedMs}
              onChange={(e) => setSpeed(1320 - Number(e.target.value))}
              className="accent-[color:var(--color-signal-amber)]"
            />
          </label>
        </div>
      </div>

      <p className="text-sm text-[var(--color-text)] font-sans">{step.explanation}</p>
    </div>
  );
}
