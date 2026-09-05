"use client";

import { useEffect, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, OrthographicCamera } from "@react-three/drei";
import * as THREE from "three";
import type { ArrayStep, IndexRole } from "@/algorithms/types";
import { Text3D, textGlyphHeight } from "@/components/render-3d/Text3D";

const ROLE_COLOR: Record<IndexRole, string> = {
  default: "#211e1a",
  comparing: "#d97a4d",
  swapping: "#a54a3a",
  sorted: "#c9b892",
  pointer: "#d97a4d",
  eliminated: "#151311",
};

const ROLE_OPACITY: Record<IndexRole, number> = {
  default: 1,
  comparing: 1,
  swapping: 1,
  sorted: 1,
  pointer: 1,
  eliminated: 0.28,
};

// Cell numbers are Text3D sprites. The sprite itself is fontSize/pixelScale
// tall but most of that is transparent raster padding — the INK (what the
// user sees) is textGlyphHeight() ≈ 0.283 x the sprite height. Those worlds
// units are what FitCamera has to reserve: sizing the zoom off the raw sprite
// over-reserves space and renders digits as small specks, exactly the look we
// are replacing.
//
// Sprite height is capped at the cell pitch (cells are 1.0 apart) so adjacent
// glyphs never collide; within that cap the ink is made as large as possible,
// landing digits at ~26px in the full workbench and ~10-20px in compact cards.
const VALUE_FONT_SIZE = 0.3;
const VALUE_PIXEL_SCALE = 0.325; // 0.3 / 0.325 = 0.923 sprite, ~0.26 world of ink
const VALUE_MAX_WIDTH = 0.6;
const VALUE_POS_Z = 0.27;

// Pointer labels ("low", "high", "mid", "j+1"...) read as ~2/3 the size of
// the digits, also ink-fit.
const LABEL_FONT_SIZE = 0.23;
const LABEL_PIXEL_SCALE = 0.41; // 0.23 / 0.41 = 0.561 sprite, ~0.159 ink
const LABEL_MAX_WIDTH = 0.85;

// Pointer labels can land on neighboring cells (e.g. "L" next to "R", or
// "mid" next to "high" once a range narrows). At this isometric angle adjacent
// cells sit close enough on screen that same-height labels collide even though
// they belong to different indices — staggering by index parity guarantees
// neighbors never share a height, independent of camera zoom.
const LABEL_Y_BASE = { compact: 0.62, full: 0.7 };
const LABEL_Y_TIER_GAP = { compact: 0.38, full: 0.44 };

function labelY(index: number, compact: boolean) {
  const base = compact ? LABEL_Y_BASE.compact : LABEL_Y_BASE.full;
  const gap = compact ? LABEL_Y_TIER_GAP.compact : LABEL_Y_TIER_GAP.full;
  return base + (index % 2 === 0 ? 0 : gap);
}

function Cell({
  value,
  x,
  index,
  role,
  label,
  compact,
}: {
  value: number;
  x: number;
  index: number;
  role: IndexRole;
  label?: string;
  compact?: boolean;
}) {
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.82, 0.82, 0.5]} />
        <meshStandardMaterial
          color={ROLE_COLOR[role]}
          roughness={0.4}
          metalness={0.1}
          transparent
          opacity={ROLE_OPACITY[role]}
        />
      </mesh>
      <Text3D
        position={[0, 0, VALUE_POS_Z]}
        fontSize={VALUE_FONT_SIZE}
        color="#ece7dc"
        pixelScale={VALUE_PIXEL_SCALE}
        maxWidth={VALUE_MAX_WIDTH}
        renderOrder={100 + index}
        depthTest={false}
      >
        {String(value)}
      </Text3D>
      {label && (
        <Text3D
          position={[0, labelY(index, !!compact), 0]}
          fontSize={LABEL_FONT_SIZE}
          color="#d97a4d"
          pixelScale={LABEL_PIXEL_SCALE}
          maxWidth={LABEL_MAX_WIDTH}
          renderOrder={200 + index}
          depthTest={false}
        >
          {label}
        </Text3D>
      )}
    </group>
  );
}

const CELL_X_HALF = 0.41; // half of boxGeometry width (0.82)
const CELL_Z_HALF = 0.25; // half of boxGeometry depth (0.5)
const CELL_Y_TOP = 0.41;
const CELL_Y_BOTTOM = -0.45; // a little shadow margin below the box

// Ink (visible) extents used by the fit — sprites are billboards, so these
// are exact on-screen sizes in world units.
const VALUE_HALF_HEIGHT = textGlyphHeight(VALUE_FONT_SIZE, VALUE_PIXEL_SCALE) / 2;
const VALUE_HALF_WIDTH = 0.21; // widest plausible value glyph ("-12") half
const LABEL_HALF_HEIGHT = textGlyphHeight(LABEL_FONT_SIZE, LABEL_PIXEL_SCALE) / 2;
const LABEL_HALF_WIDTH = LABEL_MAX_WIDTH / 2;

/**
 * Fits the isometric camera's zoom to whatever is ACTUALLY on screen this
 * step, by projecting the real bounding box through the camera view matrix:
 *
 * 1. Every cell's cube corners (exact mesh geometry).
 * 2. Every cell's value glyph ink (all cells carry a number; leaving it out
 *    of the fit lets the edge numbers clip against the canvas, which reads as
 *    "cut-off, incomplete digits").
 * 3. A label allowance ONLY for cells currently carrying one.
 *
 * Labels are camera-facing billboards, so their true on-screen extent is
 * added around their projected center in VIEW space
 * (camera.matrixWorldInverse) — not by offsetting a point along world-Y,
 * which would only agree if the camera looked straight down.
 */
function applyFit(
  camera: THREE.OrthographicCamera,
  size: { width: number; height: number },
  arrayLength: number,
  spacing: number,
  compact: boolean,
  labeledKey: string,
): void {
  camera.updateMatrixWorld(true);
  const viewMatrix = new THREE.Matrix4().copy(camera.matrixWorld).invert();

  const offset = ((arrayLength - 1) * spacing) / 2;
  const labeledSet = new Set(labeledKey.length ? labeledKey.split(",").map(Number) : []);

  let halfW = 0;
  let halfH = 0;

  for (let i = 0; i < arrayLength; i++) {
    const x = i * spacing - offset;

    // cube corners are real mesh geometry — plain world-space projection
    for (const cx of [x - CELL_X_HALF, x + CELL_X_HALF]) {
      for (const cy of [CELL_Y_BOTTOM, CELL_Y_TOP]) {
        for (const cz of [-CELL_Z_HALF, CELL_Z_HALF]) {
          const p = new THREE.Vector3(cx, cy, cz).applyMatrix4(viewMatrix);
          halfW = Math.max(halfW, Math.abs(p.x));
          halfH = Math.max(halfH, Math.abs(p.y));
        }
      }
    }

    // value digits: ink extent around the projected sprite center
    const valueCenter = new THREE.Vector3(x, 0, VALUE_POS_Z).applyMatrix4(viewMatrix);
    halfW = Math.max(halfW, Math.abs(valueCenter.x) + VALUE_HALF_WIDTH);
    halfH = Math.max(halfH, Math.abs(valueCenter.y) + VALUE_HALF_HEIGHT);

    // label: only counted for cells that actually carry one this step
    if (labeledSet.has(i)) {
      const centerView = new THREE.Vector3(x, labelY(i, compact), 0).applyMatrix4(viewMatrix);
      halfW = Math.max(halfW, Math.abs(centerView.x) + LABEL_HALF_WIDTH);
      halfH = Math.max(halfH, Math.abs(centerView.y) + LABEL_HALF_HEIGHT);
    }
  }

  const margin = compact ? 1.2 : 1.12;
  const zoomForWidth = size.width / (2 * halfW * margin);
  const zoomForHeight = size.height / (2 * halfH * margin);
  const zoom = Math.min(zoomForWidth, zoomForHeight);

  camera.zoom = THREE.MathUtils.clamp(zoom, 5, 260);
  camera.updateProjectionMatrix();
}

function FitCamera({
  arrayLength,
  spacing,
  compact,
  labeledIndices,
}: {
  arrayLength: number;
  spacing: number;
  compact: boolean;
  labeledIndices: number[];
}) {
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);
  const camera = useThree((s) => s.camera) as THREE.OrthographicCamera;
  const labeledKey = labeledIndices.join(",");

  useEffect(() => {
    applyFit(camera, { width, height }, arrayLength, spacing, compact, labeledKey);
  }, [camera, width, height, arrayLength, spacing, compact, labeledKey]);

  return null;
}

export function ArrayRow2D({ step, interactive = true, compact = false }: { step: ArrayStep; interactive?: boolean; compact?: boolean }) {
  const { array, highlights } = step;
  const spacing = 1.0;
  const offset = ((array.length - 1) * spacing) / 2;

  const roleByIndex = useMemo(() => {
    const m = new Map<number, { role: IndexRole; label?: string }>();
    for (const h of highlights) m.set(h.index, { role: h.role, label: h.label });
    return m;
  }, [highlights]);

  const labeledIndices = useMemo(
    () => highlights.filter((h) => h.label).map((h) => h.index),
    [highlights],
  );

  return (
    <Canvas shadows dpr={[1, 1.5]}>
      <color attach="background" args={["#0d0c0a"]} />
      <ambientLight intensity={0.7} color="#f2e9dc" />
      <directionalLight position={[3, 5, 4]} intensity={0.9} color="#e0a67c" castShadow />
      {/* fixed isometric orthographic camera — no vertical rotation for a flat 1D structure */}
      <OrthographicCamera makeDefault position={[4, 4.2, 6]} near={0.1} far={50} />
      <FitCamera arrayLength={array.length} spacing={spacing} compact={compact} labeledIndices={labeledIndices} />
      {array.map((v, i) => (
        <Cell
          key={i}
          value={v}
          x={i * spacing - offset}
          index={i}
          role={roleByIndex.get(i)?.role ?? "default"}
          label={roleByIndex.get(i)?.label}
          compact={compact}
        />
      ))}
      <OrbitControls
        makeDefault
        enabled={interactive}
        enableRotate={false}
        minZoom={5}
        maxZoom={260}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}