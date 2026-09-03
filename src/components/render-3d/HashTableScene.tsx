"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei";
import { Text3D } from "@/components/render-3d/Text3D";
import type { HashCellRole, HashStep } from "@/algorithms/types";

const ROLE_COLOR: Record<HashCellRole, string> = {
  idle: "#211e1a",
  current: "#d97a4d",
  inserted: "#c9b892",
  found: "#a54a3a",
  deleted: "#151311",
};

export function HashTableScene({ step }: { step: HashStep }) {
  const { numBuckets, buckets, cellStates } = step;

  const maxChain = useMemo(() => Math.max(1, ...buckets.map((b) => b.length)), [buckets]);
  const slotX = (b: number) => b * 1.05 - ((numBuckets - 1) * 1.05) / 2;

  return (
    <Canvas shadows dpr={[1, 1.5]}>
      <color attach="background" args={["#0d0c0a"]} />
      <ambientLight intensity={0.7} color="#f2e9dc" />
      <directionalLight position={[3, 5, 4]} intensity={0.9} color="#e0a67c" castShadow />
      <OrthographicCamera
        makeDefault
        position={[0, 3, 6]}
        zoom={numBuckets > 6 ? 30 : 55}
        near={0.1}
        far={50}
        onUpdate={(c) => c.lookAt(0, 0, 0)}
      />

      {Array.from({ length: numBuckets }, (_, b) => (
        <Text3D key={`lbl-${b}`} position={[slotX(b), 1.1, 0.1]} fontSize={0.2} color="#8f897d" anchorX="center" anchorY="middle">
          {b}
        </Text3D>
      ))}

      {buckets.map((chain, b) => (
        <group key={`bucket-${b}`}>
          {chain.length === 0 && (
            <mesh position={[slotX(b), 0, 0]}>
              <boxGeometry args={[0.85, 0.16, 0.4]} />
              <meshStandardMaterial color="#191613" roughness={0.4} metalness={0.1} transparent opacity={0.7} />
            </mesh>
          )}
          {chain.map((item, idx) => {
            const role = cellStates[`${b}:${idx}`] ?? "idle";
            const y = -idx * 0.78;
            return (
              <group key={`${b}-${idx}`} position={[slotX(b), y, 0]}>
                <mesh castShadow>
                  <boxGeometry args={[0.85, 0.62, 0.4]} />
                  <meshStandardMaterial
                    color={ROLE_COLOR[role]}
                    roughness={0.4}
                    metalness={0.1}
                    transparent
                    opacity={role === "deleted" ? 0.3 : 1}
                  />
                </mesh>
                <Text3D position={[0, 0, 0.22]} fontSize={0.24} color="#ece7dc" anchorX="center" anchorY="middle">
                  {`${item.key}${item.value !== undefined ? `: ${item.value}` : ""}`}
                </Text3D>
              </group>
            );
          })}
        </group>
      ))}

      <mesh position={[0, -(maxChain + 0.35), 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[numBuckets * 1.05 + 1, 2]} />
        <meshStandardMaterial color="#151311" />
      </mesh>
    </Canvas>
  );
}
