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

/**
 * The isometric camera's zoom used to be a fixed constant that only looked
 * right for ~4-5 cell arrays. Longer arrays (binary search, kadane's, ...)
 * push the outer cells — and their pointer labels, which are wider than a
 * cell and anchored above it — past the visible frame, clipping text like
 * "high" into "higl". This recomputes zoom from the actual canvas size and
 * the array's world-space span, so everything (including label overhang)
 * always fits with margin, regardless of array length or card size.
 */
function FitCamera({ span, compact }: { span: number; compact: boolean }) {
  const { size } = useThree();
  const camera = useThree((s) => s.camera) as THREE.OrthographicCamera;

  useEffect(() => {
    const targetZoom = (size.width / span) * (compact ? 0.62 : 0.78);
    const [min, max] = compact ? [20, 90] : [30, 120];
    camera.zoom = THREE.MathUtils.clamp(targetZoom, min, max);
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height, span, compact]);

  return null;
}

export function ArrayRow2D({ step, interactive = true, compact = false }: { step: ArrayStep; interactive?: boolean; compact?: boolean }) {
  const { array, highlights } = step;
  const spacing = 1.0;
  const offset = ((array.length - 1) * spacing) / 2;
  // Full world-space width the scene needs: the row itself + half a cell on
  // each end + headroom for a pointer label wider than one cell (e.g. "high").
  const span = array.length * spacing + 2.4;

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
      <FitCamera span={span} compact={compact} />
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
        minZoom={20}
        maxZoom={120}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}
