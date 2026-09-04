"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import { Text3D } from "@/components/render-3d/Text3D";
import type { HashCellRole, HashStep } from "@/algorithms/types";

const ROLE_COLOR: Record<HashCellRole, string> = {
  idle: "#2b2723",
  current: "#d97a4d",
  inserted: "#c9b892",
  found: "#a54a3a",
  deleted: "#211e1a",
};

const ROLE_EMISSIVE: Record<HashCellRole, number> = {
  idle: 0.12,
  current: 0.65,
  inserted: 0.4,
  found: 0.55,
  deleted: 0.05,
};

const RAIL_Y = 1.15; // the horizontal "array of bucket slots" rail
const PEG_Y = 0.9; // where each bucket's chain starts hanging from
const CHAIN_SPACING = 0.92;
const NODE_RADIUS = 0.3;

function BucketPeg({ x, active, label }: { x: number; active: boolean; label: string }) {
  return (
    <group position={[x, 0, 0]}>
      <Line points={[[x, RAIL_Y - 0.02, 0], [x, PEG_Y, 0]]} color={active ? "#d97a4d" : "#3a332c"} lineWidth={active ? 2.5 : 1.5} />
      <Text3D position={[x, RAIL_Y + 0.3, 0.1]} fontSize={0.19} color="#8f897d" anchorX="center" anchorY="middle">
        {label}
      </Text3D>
    </group>
  );
}

function ChainNode({
  x,
  y,
  role,
  label,
}: {
  x: number;
  y: number;
  role: HashCellRole;
  label: string;
}) {
  const color = ROLE_COLOR[role];
  return (
    <group position={[x, y, 0]}>
      <mesh castShadow>
        <sphereGeometry args={[NODE_RADIUS, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={ROLE_EMISSIVE[role]}
          roughness={0.35}
          metalness={0.15}
          transparent
          opacity={role === "deleted" ? 0.32 : 1}
        />
      </mesh>
      <Text3D
        position={[0, 0, NODE_RADIUS + 0.08]}
        fontSize={0.19}
        color={role === "deleted" ? "#6b665c" : "#ece7dc"}
        outlineColor="#0d0c0a"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text3D>
    </group>
  );
}

export function HashTableScene({
  step,
  interactive = true,
}: {
  step: HashStep;
  interactive?: boolean;
  compact?: boolean;
}) {
  const { numBuckets, buckets, cellStates } = step;

  const maxChain = useMemo(() => Math.max(0, ...buckets.map((b) => b.length)), [buckets]);
  const spacingX = numBuckets > 6 ? 1.05 : 1.3;
  const slotX = (b: number) => b * spacingX - ((numBuckets - 1) * spacingX) / 2;
  const railHalfWidth = ((numBuckets - 1) * spacingX) / 2 + 0.5;
  const camDist = Math.max(6.5, railHalfWidth * 1.15, (maxChain + 1) * 0.85);

  return (
    <Canvas shadows camera={{ position: [0, 0.3, camDist], fov: 42 }} dpr={[1, 1.5]}>
      <color attach="background" args={["#0d0c0a"]} />
      <fog attach="fog" args={["#0d0c0a", camDist + 3, camDist + 14]} />
      <ambientLight intensity={0.6} color="#f2e9dc" />
      <directionalLight position={[4, 6, 3]} intensity={1} color="#e0a67c" castShadow />
      <gridHelper args={[24, 24, "#2b2723", "#171512"]} position={[0, -(maxChain * CHAIN_SPACING) - 0.9, 0]} />

      {/* the bucket array itself — one continuous rail with a peg per index */}
      <Line points={[[-railHalfWidth, RAIL_Y, 0], [railHalfWidth, RAIL_Y, 0]]} color="#3a332c" lineWidth={2} />

      {Array.from({ length: numBuckets }, (_, b) => {
        const activeBucket = buckets[b].some((_, idx) => (cellStates[`${b}:${idx}`] ?? "idle") !== "idle");
        return <BucketPeg key={`peg-${b}`} x={slotX(b)} active={activeBucket} label={String(b)} />;
      })}

      {buckets.map((chain, b) =>
        chain.map((item, idx) => {
          const role = cellStates[`${b}:${idx}`] ?? "idle";
          const y = PEG_Y - (idx + 1) * CHAIN_SPACING;
          const prevY = idx === 0 ? PEG_Y : PEG_Y - idx * CHAIN_SPACING;
          const label = `${item.key}${item.value !== undefined ? `:${item.value}` : ""}`;
          return (
            <group key={`${b}-${idx}`}>
              <Line
                points={[
                  [slotX(b), prevY - (idx === 0 ? 0 : NODE_RADIUS), 0],
                  [slotX(b), y + NODE_RADIUS, 0],
                ]}
                color={role === "idle" ? "#3a332c" : "#8a5a3f"}
                lineWidth={1.5}
              />
              <ChainNode x={slotX(b)} y={y} role={role} label={label} />
            </group>
          );
        }),
      )}

      <OrbitControls
        enabled={interactive}
        enablePan={false}
        minDistance={4}
        maxDistance={camDist + 8}
        minPolarAngle={0.45}
        maxPolarAngle={Math.PI / 1.9}
      />
    </Canvas>
  );
}
