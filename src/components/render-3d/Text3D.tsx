"use client";

import { Html, Text as DreiText } from "@react-three/drei";
import type { TextProps as DreiTextProps } from "@react-three/drei";

let instancingSupported: boolean | null = null;

function supportsInstancing(): boolean {
  if (instancingSupported !== null) return instancingSupported;
  instancingSupported = false;
  try {
    const canvas = document.createElement("canvas");
    const gl2 = canvas.getContext("webgl2");
    if (gl2) {
      instancingSupported = true;
      return true;
    }
    const gl =
      canvas.getContext("webgl") ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    if (gl && (gl.getExtension("ANGLE_instanced_arrays") || gl.getExtension("OES_vertex_array_object"))) {
      instancingSupported = true;
    }
  } catch {
    instancingSupported = false;
  }
  return instancingSupported;
}

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

function HtmlText(props: Text3DProps) {
  const {
    position,
    color,
    fontSize = 0.2,
    anchorX,
    anchorY,
    outlineColor,
    children,
    ...rest
  } = props;

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

/**
 * Drop-in replacement for @react-three/drei <Text>. Renders troika three-text
 * on GPUs that support instanced rendering, and transparently falls back to a
 * DOM overlay (<Html>) when ANGLE_instanced_arrays / WebGL2 instancing is not
 * available — avoiding the "ANGLE_instanced_arrays not supported" runtime error.
 */
export function Text3D(props: Text3DProps) {
  if (supportsInstancing()) {
    return <DreiText {...props} />;
  }
  return <HtmlText {...props} />;
}

export { supportsInstancing };
