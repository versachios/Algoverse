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
          position={[0, 0.75, 0]}
          fontSize={0.24}
          color="#d97a4d"
          anchorX="center"
          anchorY="middle"
          pixelScale={compact ? 0.45 : 1}
          maxWidth={0.92}
        >
          {label}
        </Text3D>
      )}
    </group>
  );
}

// Half-extents of the worst-case cell content (box + a pointer label sitting
// above it), in world units — used to build the scene's bounding box below.
// Assumed present above EVERY cell (not just whichever cell the current step
// happens to label) so zoom doesn't jump around as highlights change step to
// step; it only recomputes when the array itself changes length.
const CELL_X_HALF = 0.46; // matches the label's maxWidth={0.92}
const CELL_Z_HALF = 0.25; // half of boxGeometry depth (0.5)
const CELL_Y_BOTTOM = -0.45; // bottom of the box + a little shadow margin

/**
 * The previous version only fit zoom to canvas WIDTH, assuming that was the
 * tight axis. It isn't: the mini-preview cards are wide and very short
 * (~326x96px), so with this isometric camera angle the vertical axis is
 * actually the one that runs out of room first (the pointer label sits
 * above the cell, and the camera's elevation means moving up in world-Y
 * shows up as a large vertical screen offset). Fitting only the width let
 * the label clip vertically regardless of how far it zoomed out horizontally.
 *
 * Fix: project the actual bounding box of the whole scene (every cell, plus
 * a label-height allowance above each) through the camera's real view
 * matrix, measure both resulting screen-space axes, and zoom to whichever
 * axis is more constrained. This works for any camera angle/canvas aspect
 * ratio instead of assuming which axis is tight.
 */
function FitCamera({ arrayLength, spacing, compact }: { arrayLength: number; spacing: number; compact: boolean }) {
  const { size } = useThree();
  const camera = useThree((s) => s.camera) as THREE.OrthographicCamera;

  useEffect(() => {
    camera.updateMatrixWorld(true);
    const viewMatrix = new THREE.Matrix4().copy(camera.matrixWorld).invert();

    const offset = ((arrayLength - 1) * spacing) / 2;
    const labelHalfHeight = (0.24 / (compact ? 0.45 : 1)) / 2;
    const yTop = 0.75 + labelHalfHeight + 0.05;
    const xMin = -offset - CELL_X_HALF;
    const xMax = offset + CELL_X_HALF;

    let halfW = 0;
    let halfH = 0;
    for (const x of [xMin, xMax]) {
      for (const y of [CELL_Y_BOTTOM, yTop]) {
        for (const z of [-CELL_Z_HALF, CELL_Z_HALF]) {
          const p = new THREE.Vector3(x, y, z).applyMatrix4(viewMatrix);
          halfW = Math.max(halfW, Math.abs(p.x));
          halfH = Math.max(halfH, Math.abs(p.y));
        }
      }
    }

    const margin = compact ? 1.18 : 1.12; // extra breathing room beyond the exact fit
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
