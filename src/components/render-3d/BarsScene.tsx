"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Text3D } from "@/components/render-3d/Text3D";
import * as THREE from "three";
import type { ArrayStep, IndexRole } from "@/algorithms/types";

const ROLE_COLOR: Record<IndexRole, string> = {
  default: "#2b2723",
  comparing: "#d97a4d",
  swapping: "#a54a3a",
  sorted: "#c9b892",
  pointer: "#d97a4d",
  eliminated: "#211e1a",
};

function Bar({
  value,
  max,
  x,
  role,
  label,
  compact,
}: {
  value: number;
  max: number;
  x: number;
  role: IndexRole;
  label?: string;
  compact?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetHeight = Math.max(0.15, (value / max) * 3.4);
  const targetColor = useMemo(() => new THREE.Color(ROLE_COLOR[role]), [role]);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    // ease height + color toward target for a smooth "bar grows/shrinks" feel
    mesh.scale.y = THREE.MathUtils.damp(mesh.scale.y, targetHeight, 8, delta);
    mesh.position.y = mesh.scale.y / 2;
    const mat = mesh.material as THREE.MeshStandardMaterial;
    mat.color.lerp(targetColor, Math.min(1, delta * 8));
    mat.emissive.lerp(targetColor, Math.min(1, delta * 4) * 0.15);
  });

  return (
    <group position={[x, 0, 0]}>
      <mesh ref={meshRef} position={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[0.7, 1, 0.7]} />
        <meshStandardMaterial color={ROLE_COLOR.default} roughness={0.35} metalness={0.15} />
      </mesh>
      <Text3D
        position={[0, -0.35, 0]}
        fontSize={0.28}
        color="#8f897d"
        anchorX="center"
        anchorY="middle"
        pixelScale={compact ? 0.45 : 1}
      >
        {String(value)}
      </Text3D>
      {label && (
        <Text3D
          position={[0, -0.7, 0]}
          fontSize={0.24}
          color="#d97a4d"
          anchorX="center"
          anchorY="middle"
          pixelScale={compact ? 0.45 : 1}
        >
          {label}
        </Text3D>
      )}
    </group>
  );
}

function Floor() {
  return (
    <gridHelper args={[20, 20, "#2b2723", "#211e1a"]} position={[0, 0, 0]} />
  );
}

export function BarsScene({ step, interactive = true, compact = false }: { step: ArrayStep; interactive?: boolean; compact?: boolean }) {
  const { array, highlights } = step;
  const max = Math.max(...array, 1);
  const spacing = 1.0;
  const offset = ((array.length - 1) * spacing) / 2;

  const roleByIndex = useMemo(() => {
    const m = new Map<number, { role: IndexRole; label?: string }>();
    for (const h of highlights) m.set(h.index, { role: h.role, label: h.label });
    return m;
  }, [highlights]);

  return (
    <Canvas
      shadows
      camera={{ position: [0, 3.4, 7.5], fov: 42 }}
      dpr={[1, 1.5]}
    >
      <color attach="background" args={["#0d0c0a"]} />
      <fog attach="fog" args={["#0d0c0a", 8, 16]} />
      <ambientLight intensity={0.6} color="#f2e9dc" />
      <directionalLight position={[4, 6, 3]} intensity={1} color="#e0a67c" castShadow />
      <Floor />
      {array.map((v, i) => (
        <Bar
          key={i}
          value={v}
          max={max}
          x={i * spacing - offset}
          role={roleByIndex.get(i)?.role ?? "default"}
          label={roleByIndex.get(i)?.label}
          compact={compact}
        />
      ))}
      <OrbitControls
        enabled={interactive}
        enablePan={false}
        minDistance={5}
        maxDistance={14}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI / 2.1}
      />
    </Canvas>
  );
}
