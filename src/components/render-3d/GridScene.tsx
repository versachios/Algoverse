"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import type { GridCellRole, GridStep } from "@/algorithms/types";

const ROLE_COLOR: Record<GridCellRole, string> = {
  idle: "#2b2723",
  computing: "#d97a4d",
  source: "#c9b892",
  filled: "#a54a3a",
};

function Cell({
  value,
  max,
  x,
  z,
  role,
}: {
  value: number;
  max: number;
  x: number;
  z: number;
  role: GridCellRole;
}) {
  const height = Math.max(0.12, (value / max) * 2.4);
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[0.65, height, 0.65]} />
        <meshStandardMaterial
          color={ROLE_COLOR[role]}
          emissive={ROLE_COLOR[role]}
          emissiveIntensity={role === "idle" ? 0.1 : 0.5}
          roughness={0.35}
          metalness={0.15}
        />
      </mesh>
      <Text position={[0, height + 0.28, 0]} fontSize={0.22} color="#ece7dc" anchorX="center" anchorY="middle">
        {String(value)}
      </Text>
    </group>
  );
}

function Floor() {
  return <gridHelper args={[20, 20, "#2b2723", "#211e1a"]} position={[0, 0, 0]} />;
}

export function GridScene({ step, interactive = true }: { step: GridStep; interactive?: boolean }) {
  const { grid, cellStates } = step;
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const spacing = 0.85;
  const max = Math.max(1, ...grid.flat());

  const offsetX = ((cols - 1) * spacing) / 2;
  const offsetZ = ((rows - 1) * spacing) / 2;

  const cells = useMemo(() => {
    const list: { row: number; col: number; value: number; role: GridCellRole }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        list.push({ row: r, col: c, value: grid[r][c], role: cellStates[`${r}-${c}`] ?? "idle" });
      }
    }
    return list;
  }, [grid, cellStates, rows, cols]);

  return (
    <Canvas shadows camera={{ position: [0, 5, 6.5], fov: 45 }} dpr={[1, 1.5]}>
      <color attach="background" args={["#0d0c0a"]} />
      <fog attach="fog" args={["#0d0c0a", 8, 18]} />
      <ambientLight intensity={0.6} color="#f2e9dc" />
      <directionalLight position={[4, 6, 3]} intensity={1} color="#e0a67c" castShadow />
      <Floor />
      {cells.map((cell) => (
        <Cell
          key={`${cell.row}-${cell.col}`}
          value={cell.value}
          max={max}
          x={cell.col * spacing - offsetX}
          z={cell.row * spacing - offsetZ}
          role={cell.role}
        />
      ))}
      <OrbitControls
        enabled={interactive}
        enablePan={false}
        minDistance={5}
        maxDistance={15}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI / 2.1}
      />
    </Canvas>
  );
}
