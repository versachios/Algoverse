"use client";

import { Html } from "@react-three/drei";
import type { TextProps as DreiTextProps } from "@react-three/drei";

type Text3DProps = DreiTextProps;
type TextAlign = "left" | "right" | "center" | "justify";

function toVec(position?: [number, number, number] | number[]) {
  if (!position) return [0, 0, 0] as [number, number, number];
  const p = Array.isArray(position) ? position : [position, 0, 0];
  return [p[0] ?? 0, p[1] ?? 0, p[2] ?? 0] as [number, number, number];
}

function anchorAlign(anchorX: string | undefined, anchorY: string | undefined) {
  const textAlign = (anchorX === "right" ? "right" : anchorX === "left" ? "left" : "center") as TextAlign;
  const justifyContent = textAlign === "center" ? "center" : textAlign === "right" ? "flex-end" : "flex-start";
  const alignItems = anchorY === "top" ? "flex-start" : anchorY === "bottom" ? "flex-end" : "center";
  return { textAlign, justifyContent, alignItems };
}

/**
 * Drop-in replacement for @react-three/drei <Text>. Always renders a DOM
 * overlay (<Html>) instead of troika three-text (see git history for why:
 * troika hard-depends on ANGLE_instanced_arrays, which some browsers like
 * Brave block/spoof even while reporting a working webgl2 context, causing
 * an unhandled crash we can't feature-detect around).
 *
 * Deliberately rendered in plain screen-space "billboard" mode (no `transform`
 * prop on <Html>): the label is pinned to the projected 2D point of its 3D
 * position, but sized in real CSS pixels — a fixed size regardless of camera
 * zoom. Because it's a *fixed* pixel size, the same fontSize value would look
 * fine in the big AlgorithmWorkbench canvas (~420px tall) but way oversized
 * in the tiny MiniPreview cards (~96px tall) — that's why `pixelScale` exists:
 * pass a smaller value (e.g. ~0.45) from compact contexts to shrink it back
 * down proportionally, without touching the world-unit `fontSize` each scene
 * already uses to express relative importance (values vs small labels).
 */
export function Text3D(props: Text3DProps & { pixelScale?: number }) {
  const { position, color, fontSize = 0.2, anchorX, anchorY, outlineColor, children, pixelScale = 1, ...rest } = props;

  const { textAlign, justifyContent, alignItems } = anchorAlign(anchorX as string, anchorY as string);
  const pos = toVec(position as [number, number, number]);
  // fontSize here is the old world-unit size (~0.16-0.34); map it to a
  // readable screen-pixel size instead of trying to scale to 3D, then apply
  // the caller's pixelScale for the container it's actually rendering into.
  const px = Math.max(8, Math.round(fontSize * 70 * pixelScale));

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Html position={pos} center style={{ pointerEvents: "none" }} {...(rest as any)}>
      <span
        style={{
          display: "inline-flex",
          alignItems,
          justifyContent,
          color: String(color),
          fontSize: `${px}px`,
          fontWeight: 600,
          fontFamily: "var(--font-mono, monospace)",
          lineHeight: 1.1,
          textAlign,
          whiteSpace: "nowrap",
          textShadow: outlineColor
            ? `0 0 3px ${String(outlineColor)}, 0 0 3px ${String(outlineColor)}`
            : "0 1px 3px rgba(0,0,0,0.85)",
        }}
      >
        {children}
      </span>
    </Html>
  );
}
