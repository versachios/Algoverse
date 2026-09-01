// components/render-3d/DPGridScene.tsx
"use client";

import { useMemo } from "react";
import { Html } from "@react-three/drei";
import type { DPSnapshot } from "@/algorithms/dp-knapsack";

const COLORS: Record<string, string> = {
  idle: "#4a4038",
  computing: "#d97a4d",
  source: "#c9b892",
  filled: "#d97a4d",
};

export default function DPGridScene({ snapshot, spacing = 0.9 }: { snapshot: DPSnapshot; spacing?: number }) {
  const cells = useMemo(() => {
    const list: { row: number; col: number; value: number; state: string }[] = [];
    for (let r = 0; r < snapshot.rows; r++) {
      for (let c = 0; c < snapshot.cols; c++) {
        list.push({
          row: r,
          col: c,
          value: snapshot.grid[r][c],
          state: snapshot.cellStates[`${r}-${c}`] ?? "idle",
        });
      }
    }
    return list;
  }, [snapshot]);

  const maxVal = Math.max(1, ...snapshot.grid.flat());

  return (
    <group>
      {cells.map((cell) => {
        const h = 0.15 + (cell.value / maxVal) * 1.8;
        const color = COLORS[cell.state];
        const x = (cell.col - snapshot.cols / 2) * spacing;
        const z = (cell.row - snapshot.rows / 2) * spacing;
        return (
          <group key={`${cell.row}-${cell.col}`} position={[x, h / 2 - 1, z]}>
            <mesh>
              <boxGeometry args={[0.7, h, 0.7]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={cell.state === "idle" ? 0.05 : 0.55}
                roughness={0.5}
              />
            </mesh>
            <Html center distanceFactor={9} position={[0, h / 2 + 0.25, 0]} style={{ pointerEvents: "none" }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: "#f5f1e8", textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
                {cell.value}
              </div>
            </Html>
          </group>
        );
      })}
      {/* row 0 / col 0 axis labels */}
      <Html position={[-((snapshot.cols / 2) * spacing) - 0.8, -1, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: "#8a7f72" }}>items →</div>
      </Html>
    </group>
  );
}

// Usage — same free-orbit Player as TreeScene (DP grids follow the 3D rule per spec):
// <Canvas camera={{ position: [0, 4, 8], fov: 50 }}>
//   <ambientLight intensity={0.5} />
//   <pointLight position={[5, 6, 6]} intensity={0.9} />
//   <OrbitControls />
//   <DPGridScene snapshot={currentSnapshot} />
// </Canvas>
