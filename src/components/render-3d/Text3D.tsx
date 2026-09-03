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
  const alignItems = anchorY === "top" ? "flex-start" : anchorY === "bottom" ? "flex-end" : "center";
  return { textAlign, alignItems };
}

/**
 * Drop-in replacement for @react-three/drei <Text>. Always renders a DOM
 * overlay (<Html>) instead of troika three-text.
 *
 * troika-three-text generates its glyph atlas via a hidden WebGL context and
 * hard-depends on the ANGLE_instanced_arrays extension. Feature-detecting
 * that extension is NOT reliable: some browsers (e.g. Brave with Shields'
 * anti-fingerprinting WebGL restrictions) report a working webgl2 context
 * yet still throw "ANGLE_instanced_arrays not supported" deep inside
 * troika's own fallback path, as an unhandled promise rejection we can't
 * catch from the outside. So rather than feature-detect, we just never use
 * troika at all — the DOM overlay works identically on every GPU/browser.
 */
export function Text3D(props: Text3DProps) {
  const { position, color, fontSize = 0.2, anchorX, anchorY, outlineColor, children, ...rest } = props;

  const { textAlign, alignItems } = anchorAlign(anchorX as string, anchorY as string);
  const pos = toVec(position as [number, number, number]);

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Html position={pos} transform center scale={fontSize} style={{ pointerEvents: "none" }} {...(rest as any)}>
      <span
        style={{
          display: "inline-flex",
          alignItems,
          justifyContent: textAlign === "center" ? "center" : textAlign === "right" ? "flex-end" : "flex-start",
          color: String(color),
          fontSize: "12px",
          lineHeight: 1.1,
          textAlign,
          whiteSpace: "nowrap",
          textShadow: outlineColor ? `0 0 2px ${String(outlineColor)}, 0 0 2px ${String(outlineColor)}` : undefined,
        }}
      >
        {children}
      </span>
    </Html>
  );
}
