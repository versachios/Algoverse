"use client";

import { useEffect, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, OrthographicCamera } from "@react-three/drei";
import * as THREE from "three";
import type { ArrayStep, IndexRole } from "@/algorithms/types";
import { Text3D } from "@/components/render-3d/Text3D";

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

// Pointer-label placement/size — pulled in tighter for compact mini-previews
// so the required camera headroom above each cell stays small.
const LABEL_Y = { compact: 0.68, full: 0.75 };
const LABEL_PIXEL_SCALE = { compact: 0.62, full: 1 };

function Cell({
  value,
  x,
  role,
  label,
  compact,
}: {
  value: number;
  x: number;
  role: IndexRole;
  label?: string;
  compact?: boolean;
}) {
  const labelY = compact ? LABEL_Y.compact : LABEL_Y.full;
  const labelPixelScale = compact ? LABEL_PIXEL_SCALE.compact : LABEL_PIXEL_SCALE.full;
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
      <Text3D position={[0, 0, 0.27]} fontSize={0.28} color="#ece7dc" anchorX="center" anchorY="middle" pixelScale={compact ? 0.45 : 1}>
        {String(value)}
      </Text3D>
      {label && (
        <Text3D
          position={[0, labelY, 0]}
          fontSize={0.24}
          color="#d97a4d"
          anchorX="center"
          anchorY="middle"
          pixelScale={labelPixelScale}
          maxWidth={0.92}
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
const LABEL_HALF_WIDTH = 0.48; // matches the label's maxWidth={0.92}

/**
 * Fits the isometric camera's zoom to whatever is actually being shown,
 * instead of a fixed constant that only looked right for a handful of
 * cells. Two things this has to get right that earlier attempts missed:
 *
 * 1. Which axis is tight. The mini-preview cards are wide and very short
 *    (~326x96px) — for THIS camera angle the vertical axis runs out of
 *    room first (the pointer label sits above the cell, and the camera's
 *    elevation turns upward world movement into a large vertical screen
 *    offset), not the horizontal one. So both axes are measured and
 *    whichever is more constrained wins.
 *
 * 2. The label is a camera-facing billboard (via Text3D/sprite), not a
 *    rigid mesh. Its true on-screen extent has to be added around its
 *    projected center in VIEW space (i.e. camera.matrixWorldInverse),
 *    not by faking a point offset along world-Y and projecting that —
 *    those two only agree when the camera looks straight down, which
 *    this isometric camera doesn't. Getting this backwards is why the
 *    label kept clipping even though the fit "looked" correct on paper.
 */
function FitCamera({ arrayLength, spacing, compact }: { arrayLength: number; spacing: number; compact: boolean }) {
  const { size } = useThree();
  const camera = useThree((s) => s.camera) as THREE.OrthographicCamera;

  useEffect(() => {
    camera.updateMatrixWorld(true);
    const viewMatrix = new THREE.Matrix4().copy(camera.matrixWorld).invert();

    const offset = ((arrayLength - 1) * spacing) / 2;
    const labelY = compact ? LABEL_Y.compact : LABEL_Y.full;
    const labelPixelScale = compact ? LABEL_PIXEL_SCALE.compact : LABEL_PIXEL_SCALE.full;
    const labelHalfHeight = (0.24 / labelPixelScale) / 2;

    let halfW = 0;
    let halfH = 0;

    for (let i = 0; i < arrayLength; i++) {
      const x = i * spacing - offset;

      // cube corners are real mesh geometry — a plain world-space projection is correct here
      for (const cx of [x - CELL_X_HALF, x + CELL_X_HALF]) {
        for (const cy of [CELL_Y_BOTTOM, CELL_Y_TOP]) {
          for (const cz of [-CELL_Z_HALF, CELL_Z_HALF]) {
            const p = new THREE.Vector3(cx, cy, cz).applyMatrix4(viewMatrix);
            halfW = Math.max(halfW, Math.abs(p.x));
            halfH = Math.max(halfH, Math.abs(p.y));
          }
        }
      }

      // label: billboard extent added in view space around its projected center
      const centerView = new THREE.Vector3(x, labelY, 0).applyMatrix4(viewMatrix);
      halfW = Math.max(halfW, Math.abs(centerView.x) + LABEL_HALF_WIDTH);
      halfH = Math.max(halfH, Math.abs(centerView.y) + labelHalfHeight);
    }

    const margin = compact ? 1.35 : 1.15; // generous — better a bit small than clipped
    const zoomForWidth = size.width / (2 * halfW * margin);
    const zoomForHeight = size.height / (2 * halfH * margin);
    const zoom = Math.min(zoomForWidth, zoomForHeight);

    camera.zoom = THREE.MathUtils.clamp(zoom, 5, 200);
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height, arrayLength, spacing, compact]);

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

  return (
    <Canvas shadows dpr={[1, 1.5]}>
      <color attach="background" args={["#0d0c0a"]} />
      <ambientLight intensity={0.7} color="#f2e9dc" />
      <directionalLight position={[3, 5, 4]} intensity={0.9} color="#e0a67c" castShadow />
      {/* fixed isometric orthographic camera — no vertical rotation for a flat 1D structure */}
      <OrthographicCamera makeDefault position={[4, 4.2, 6]} near={0.1} far={50} />
      <FitCamera arrayLength={array.length} spacing={spacing} compact={compact} />
      {array.map((v, i) => (
        <Cell
          key={i}
          value={v}
          x={i * spacing - offset}
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
        maxZoom={200}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}
