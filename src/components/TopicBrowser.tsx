"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { catalogue, levels, type CatalogueEntry } from "@/algorithms/catalogue";
import { MiniPreview } from "@/components/MiniPreview";

export function TopicBrowser() {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<CatalogueEntry["level"] | "Tất cả">("Tất cả");

  const filtered = useMemo(() => {
    return catalogue.filter((c) => {
      const matchesQuery = c.name.toLowerCase().includes(query.trim().toLowerCase());
      const matchesLevel = level === "Tất cả" || c.level === level;
      return matchesQuery && matchesLevel;
    });
  }, [query, level]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm thuật toán… (VD: sort, search, graph)"
          className="w-full sm:w-80 bg-[var(--color-panel-raised)] border border-[var(--color-hairline)] rounded px-3 py-2 text-sm font-mono-tech focus:outline-none focus:border-[var(--color-signal-amber)]"
        />
        <div className="flex gap-1.5 flex-wrap">
          {(["Tất cả", ...levels] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={clsx(
                "control-btn",
                level === l && "!border-[var(--color-signal-amber)] !text-[var(--color-signal-amber)]"
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((c) => {
          const card = (
            <div
              className={clsx(
                "blueprint-frame rounded-md p-4 h-full flex flex-col gap-2 transition-colors",
                c.ready ? "hover:border-[var(--color-signal-amber)] cursor-pointer" : "opacity-60"
              )}
            >
              <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-[var(--color-muted)] font-mono-tech">
                <span>{c.group}</span>
                <span className="text-[var(--color-signal-amber)]">{c.renderMode}</span>
              </div>
              <h3 className="font-display text-lg">{c.name}</h3>
              {c.ready ? (
                <div className="rounded-sm overflow-hidden border border-[var(--color-hairline)]">
                  <MiniPreview slug={c.slug} />
                </div>
              ) : (
                <div className="h-24 rounded-sm border border-dashed border-[var(--color-hairline)]/60 grid place-items-center text-[10px] text-[var(--color-muted)] font-mono-tech uppercase tracking-widest">
                  chưa có mô phỏng
                </div>
              )}
              <div className="mt-auto flex items-center justify-between text-xs">
                <span className="text-[var(--color-muted)]">{c.level}</span>
                {!c.ready && (
                  <span className="text-[var(--color-signal-amber)] font-mono-tech">sắp ra mắt</span>
                )}
              </div>
            </div>
          );
          return c.ready ? (
            <Link key={c.slug} href={`/algorithms/${c.slug}`}>
              {card}
            </Link>
          ) : (
            <div key={c.slug}>{card}</div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-[var(--color-muted)] col-span-full">
            Không tìm thấy thuật toán phù hợp.
          </p>
        )}
      </div>
    </div>
  );
}
