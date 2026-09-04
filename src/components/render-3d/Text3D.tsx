"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

interface Text3DProps {
  position?: [number, number, number] | number[];
  color?: string | number;
  fontSize?: number;
  anchorX?: string;
  anchorY?: string;
  outlineColor?: string | number;
  outlineWidth?: number;
  pixelScale?: number;
  children?: React.ReactNode;
}

function toVec(position?: [number, number, number] | number[]) {
  if (!position) return [0, 0, 0] as [number, number, number];
  const p = Array.isArray(position) ? position : [position, 0, 0];
  return [p[0] ?? 0, p[1] ?? 0, p[2] ?? 0] as [number, number, number];
}

// Fixed working resolution for the offscreen canvas the glyph is rasterized
// at; the sprite is then scaled down to the caller's world-unit fontSize, so
// this only affects crispness, never on-screen size.
const RASTER_PX = 128;

function buildTextTexture(text: string, color: string, outlineColor?: string, outlineFrac = 0.14) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const font = `600 ${RASTER_PX}px var(--font-mono, ui-monospace, "SFMono-Regular", monospace)`;
  ctx.font = font;
  const measured = ctx.measureText(text || " ");
  const padX = RASTER_PX * 0.32;
  const padY = RASTER_PX * 0.4;
  canvas.width = Math.max(1, Math.ceil(measured.width + padX * 2));
  canvas.height = Math.ceil(RASTER_PX + padY * 2);

  // Resizing the canvas resets its context state, so font must be reapplied.
  ctx.font = font;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  if (outlineColor) {
    ctx.lineJoin = "round";
    ctx.miterLimit = 2;
    ctx.lineWidth = RASTER_PX * outlineFrac;
    ctx.strokeStyle = outlineColor;
    ctx.strokeText(text, cx, cy);
  } else {
    ctx.shadowColor = "rgba(0,0,0,0.85)";
    ctx.shadowBlur = RASTER_PX * 0.1;
  }
  ctx.fillStyle = color;
  ctx.fillText(text, cx, cy);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return { texture, aspect: canvas.width / canvas.height };
}

/**
 * Drop-in replacement for @react-three/drei <Text> (and for the earlier
 * <Html>-based Text3D). Renders the string to an offscreen 2D canvas once,
 * then displays that as a THREE.Sprite inside the actual WebGL scene.
 *
 * Why not drei's <Text> (troika-three-text): troika hard-depends on
 * ANGLE_instanced_arrays, which some browsers/GPUs block or spoof while still
 * reporting a working webgl2 context — an unhandled crash we can't
 * feature-detect around.
 *
 * Why not the DOM-overlay version that replaced it: an <Html> label is pinned
 * to a 2D screen point on top of everything, ignoring camera perspective and
 * depth — it never occludes correctly and looks pasted-on rather than part of
 * the scene.
 *
 * A canvas-texture sprite avoids both problems: it's a completely standard
 * 2D canvas + THREE.CanvasTexture (no troika, no instancing dependency), and
 * because it's a real THREE.Sprite positioned in world space it respects
 * depth/occlusion and scales with the camera like every other mesh, matching
 * how the original troika-rendered labels looked and behaved.
 *
 * Every call site in this repo uses anchorX="center" anchorY="middle", which
 * is exactly what a THREE.Sprite gives you by default (centered on its
 * position), so anchorX/anchorY are accepted for API compatibility but not
 * otherwise used.
 *
 * `pixelScale` is also accepted-but-unused: it was needed by the <Html>
 * version to shrink a fixed CSS-pixel size back down for tiny MiniPreview
 * canvases. A sprite is sized in world units, which already scales down
 * naturally with a smaller canvas/camera — the original troika-based scenes
 * (see 6846105) never had a compact multiplier and matched the same
 * fontSize in both contexts, which is the look this restores.
 */
export function Text3D(props: Text3DProps) {
  const { position, color = "#ece7dc", fontSize = 0.2, outlineColor, outlineWidth, children } = props;

  const text = typeof children === "string" || typeof children === "number" ? String(children) : "";
  const colorStr = typeof color === "number" ? `#${color.toString(16).padStart(6, "0")}` : color;
  const outlineStr =
    outlineColor === undefined
      ? undefined
      : typeof outlineColor === "number"
        ? `#${outlineColor.toString(16).padStart(6, "0")}`
        : outlineColor;
  // Troika expressed outlineWidth as a fraction of world-unit fontSize;
  // translate that into a fraction of our raster canvas the same way.
  const outlineFrac = outlineWidth !== undefined ? (outlineWidth / fontSize) * 1.0 : 0.14;

  const built = useMemo(
    () => buildTextTexture(text, colorStr, outlineStr, outlineFrac),
    [text, colorStr, outlineStr, outlineFrac],
  );

  // Dispose the *previous* texture only once React has committed the new one
  // (never during render, which useMemo runs inside) — and dispose whatever
  // is current on final unmount.
  const prevTextureRef = useRef<THREE.CanvasTexture | null>(null);
  useEffect(() => {
    const prev = prevTextureRef.current;
    if (prev && prev !== built?.texture) prev.dispose();
    prevTextureRef.current = built?.texture ?? null;
  }, [built]);
  useEffect(() => {
    return () => {
      prevTextureRef.current?.dispose();
      prevTextureRef.current = null;
    };
  }, []);

  if (!built) return null;

  const pos = toVec(position);
  const height = fontSize;
  const width = height * built.aspect;

  return (
    <sprite position={pos} scale={[width, height, 1]} renderOrder={10}>
      <spriteMaterial map={built.texture} transparent depthWrite={false} />
    </sprite>
  );
}
