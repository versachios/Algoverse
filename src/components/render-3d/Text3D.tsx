"use client";

import { useEffect, useMemo, useRef } from "react";
import { useThree } from "@react-three/fiber";
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
  /** Cap the sprite's on-screen width (world units). Longer strings (e.g.
   * "high" vs "R") shrink proportionally instead of bleeding past it —
   * without this, multi-char labels can overflow into neighboring cells. */
  maxWidth?: number;
  /** @see renderOrder — distinct draw-order value for sprites that could
   * otherwise sort by camera distance and jitter (see full note below). */
  renderOrder?: number;
  /** Set false to make the text always render on top of nearby geometry.
   * In an isometric row of cells the box of the NEXT cell sits closer to the
   * camera than the current cell's number, so with the default (true) depth
   * testing the neighbor's face cuts off part of the digit. Text stickers
   * over cells generally want depthTest={false}; keep true for text that must
   * recede naturally behind real geometry (3D scenes). */
  depthTest?: boolean;
  children?: React.ReactNode;
}

function toVec(position?: [number, number, number] | number[]) {
  if (!position) return [0, 0, 0] as [number, number, number];
  const p = Array.isArray(position) ? position : [position, 0, 0];
  return [p[0] ?? 0, p[1] ?? 0, p[2] ?? 0] as [number, number, number];
}

// ctx.font (canvas 2D) is not CSS: it can't resolve var(--font-mono, ...),
// so that has to be spelled out as a real font stack (matches --font-mono in
// globals.css). Using the CSS var string here silently fails to a tiny
// system default font — which is why labels looked like blank specks.
const FONT_STACK = '"IBM Plex Mono", ui-monospace, "Cascadia Code", monospace';

// Fixed working resolution for the offscreen canvas the glyph is rasterized
// at; the sprite is then scaled down to the caller's world-unit fontSize, so
// this only affects crispness, never on-screen size.
const RASTER_PX = 192;

// How much of a raster em box a digit actually fills with ink. Measured on
// IBM Plex Mono 600 rendered headlessly: an "8" fills ~98 of 192 raster px of
// vertical ink. Together with the vertical canvas padding (0.4 em each side),
// this is the TRUE fraction of the sprite's total height that shows ink:
//   (0.51 * 192) / (192 + 192 * 0.4 * 2) = 0.2833...
// Fitting/dimension calculations must use THIS (a 0.556 "the whole em box"
// estimate over-reserved space and left digits far smaller than intended).
export const TEXT_GLYPH_FRAC =
  (RASTER_PX * 0.51) / (RASTER_PX + RASTER_PX * 0.4 * 2);

export function textGlyphHeight(fontSize: number, pixelScale: number) {
  return (fontSize / pixelScale) * TEXT_GLYPH_FRAC;
}

function buildTextTexture(
  text: string,
  color: string,
  outlineColor: string | undefined,
  outlineFrac: number,
  maxAnisotropy: number,
) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const font = `600 ${RASTER_PX}px ${FONT_STACK}`;
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
  // Mipmaps matter a lot here: MiniPreview cards render this same texture at
  // a fraction of its native size, and without mips a minified canvas
  // texture aliases — thin multi-character strings (e.g. "-3") collapse into
  // an unreadable blur while single bold digits happen to survive, which is
  // exactly the "some numbers show, some don't" pattern this was causing.
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  // Thin multi-char strings (e.g. "-3") sit on cube faces viewed at an
  // angle, so at minification the GPU samples them non-uniformly across x/y
  // — without anisotropic filtering that collapses the minus sign + digit
  // into an unreadable blur even with mipmaps on, while bold single digits
  // (which have more area to survive the same blur) look fine. Anisotropy
  // keeps the sharper axis sharp instead of blurring both axes equally.
  texture.anisotropy = maxAnisotropy;
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
 * `pixelScale` scales the sprite's on-screen size inversely (values < 1
 * make it BIGGER). MiniPreview canvases are ~96px tall vs. ~420px+ for the
 * full workbench — same world-unit fontSize means the compact version gets
 * roughly a quarter of the physical pixels to draw the same glyph into, and
 * anisotropic filtering / mipmaps can't conjure resolution that was never
 * there. Call sites already passed `pixelScale={compact ? 0.45 : 1}`
 * expecting this compensation; it just wasn't wired up here.
 */
export function Text3D(props: Text3DProps) {
  const { position, color = "#ece7dc", fontSize = 0.2, outlineColor, outlineWidth, pixelScale = 1, maxWidth, renderOrder = 10, depthTest = true, children } = props;

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

  const maxAnisotropy = useThree((s) => s.gl.capabilities.getMaxAnisotropy());
  const built = useMemo(
    () => buildTextTexture(text, colorStr, outlineStr, outlineFrac, maxAnisotropy),
    [text, colorStr, outlineStr, outlineFrac, maxAnisotropy],
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
  let height = fontSize / pixelScale;
  let width = height * built.aspect;
  if (maxWidth !== undefined && width > maxWidth) {
    const shrink = maxWidth / width;
    width *= shrink;
    height *= shrink;
  }

  return (
    <sprite position={pos} scale={[width, height, 1]} renderOrder={renderOrder}>
      <spriteMaterial map={built.texture} transparent depthWrite={false} depthTest={depthTest} />
    </sprite>
  );
}
