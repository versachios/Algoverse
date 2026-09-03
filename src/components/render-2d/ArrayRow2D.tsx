"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, OrthographicCamera } from "@react-three/drei";
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
}: {
  value: number;
  x: number;
  role: IndexRole;
  label?: string;
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
      <Text3D position={[0, 0, 0.27]} fontSize={0.28} color="#ece7dc" anchorX="center" anchorY="middle">
        {String(value)}
      </Text3D>
      {label && (
        <Text3D position={[0, 0.75, 0]} fontSize={0.24} color="#d97a4d" anchorX="center" anchorY="middle">
          {label}
        </Text3D>
      )}
    </group>
  );
}

export function ArrayRow2D({ step, interactive = true }: { step: ArrayStep; interactive?: boolean }) {
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
      <OrthographicCamera makeDefault position={[4, 4.2, 6]} zoom={70} near={0.1} far={50} />
      {array.map((v, i) => (
        <Cell
          key={i}
          value={v}
          x={i * spacing - offset}
          role={roleByIndex.get(i)?.role ?? "default"}
          label={roleByIndex.get(i)?.label}
        />
      ))}
      <OrbitControls
        makeDefault
        enabled={interactive}
        enableRotate={false}
        minZoom={40}
        maxZoom={120}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}


