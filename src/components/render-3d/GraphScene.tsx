"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import { Text3D } from "@/components/render-3d/Text3D";
import type { GraphNodeRole, GraphStep } from "@/algorithms/types";

const ROLE_COLOR: Record<GraphNodeRole, string> = {
  idle: "#2b2723",
  source: "#d97a4d",
  frontier: "#c9b892",
  current: "#d97a4d",
  settled: "#a54a3a",
};

const ROLE_EMISSIVE: Record<GraphNodeRole, number> = {
  idle: 0.12,
  source: 0.55,
  frontier: 0.4,
  current: 0.7,
  settled: 0.5,
};

/** Circular layout so any graph renders without crossing-aware geometry. */
function circlePos(id: string, count: number) {
  const idx = Number(id);
  if (count <= 1) return { x: 0, y: 0 };
  const angle = (idx / count) * Math.PI * 2 - Math.PI / 2;
  return { x: Math.cos(angle) * 2.4, y: Math.sin(angle) * 1.7 };
}

function NodeSphere({
  label,
  role,
  dist,
  showDist,
  pos,
  compact,
}: {
  label: string;
  role: GraphNodeRole;
  dist?: number;
  showDist: boolean;
  pos: { x: number; y: number };
  compact?: boolean;
}) {
  const distText = dist === undefined ? "∞" : String(dist);
  return (
    <group position={[pos.x, pos.y, 0]}>
      <mesh>
        <sphereGeometry args={[0.34, 24, 24]} />
        <meshStandardMaterial
          color={ROLE_COLOR[role]}
          emissive={ROLE_COLOR[role]}
          emissiveIntensity={ROLE_EMISSIVE[role]}
          roughness={0.35}
          metalness={0.15}
        />
      </mesh>
      <Text3D position={[0, 0, 0.4]} fontSize={0.26} color="#ece7dc" outlineColor="#0d0c0a" anchorX="center" anchorY="middle" pixelScale={compact ? 0.45 : 1}>
        {label}
      </Text3D>
      {showDist && (
        <Text3D
          position={[0, -0.55, 0.2]}
          fontSize={0.2}
          color={role === "idle" ? "#8f897d" : "#ece7dc"}
          anchorX="center"
          anchorY="middle"
          pixelScale={compact ? 0.45 : 1}
        >
          {distText}
        </Text3D>
      )}
    </group>
  );
}

export function GraphScene({ step, interactive = true, compact = false }: { step: GraphStep; interactive?: boolean; compact?: boolean }) {
  const { nodes, edges, dist, nodeStates, edgeHighlight } = step;
  const showDist = step.showDist !== false;
  const showWeights = step.showWeights !== false;
  const count = Object.keys(nodes).length;

  const pos = useMemo(() => {
    const map: Record<string, { x: number; y: number }> = {};
    for (const id of Object.keys(nodes)) map[id] = circlePos(id, count);
    return map;
  }, [nodes, count]);

  return (
    <Canvas shadows camera={{ position: [0, 0.4, 7.5], fov: 45 }} dpr={[1, 1.5]}>
      <color attach="background" args={["#0d0c0a"]} />
      <fog attach="fog" args={["#0d0c0a", 8, 18]} />
      <ambientLight intensity={0.6} color="#f2e9dc" />
      <directionalLight position={[4, 6, 3]} intensity={1} color="#e0a67c" castShadow />
      <gridHelper args={[20, 20, "#2b2723", "#211e1a"]} position={[0, -1.9, 0]} />

      {/* edges */}
      {edges.map((e) => {
        const from = pos[e.from];
        const to = pos[e.to];
        if (!from || !to) return null;
        const active =
          !!edgeHighlight &&
          ((edgeHighlight[0] === e.from && edgeHighlight[1] === e.to) ||
            (edgeHighlight[0] === e.to && edgeHighlight[1] === e.from));
        const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
        return (
          <group key={`${e.from}-${e.to}`}>
            <Line
              points={[
                [from.x, from.y, 0],
                [to.x, to.y, 0],
              ]}
              color={active ? "#d97a4d" : "#3a332c"}
              lineWidth={active ? 3 : 1.5}
            />
            {showWeights && (
              <Text3D
                position={[mid.x, mid.y, 0.3]}
                fontSize={0.2}
                color={active ? "#ece7dc" : "#8f897d"}
                anchorX="center"
                anchorY="middle"
                pixelScale={compact ? 0.45 : 1}
              >
                {String(e.weight)}
              </Text3D>
            )}
          </group>
        );
      })}

      {/* nodes */}
      {Object.values(nodes).map((node) => {
        const p = pos[node.id];
        if (!p) return null;
        return (
          <NodeSphere
            key={node.id}
            label={node.label}
            role={nodeStates[node.id] ?? "idle"}
            dist={dist[node.id]}
            showDist={showDist}
            pos={p}
            compact={compact}
          />
        );
      })}

      <OrbitControls
        enabled={interactive}
        enablePan={false}
        minDistance={4}
        maxDistance={14}
        minPolarAngle={0.4}
        maxPolarAngle={Math.PI / 1.7}
      />
    </Canvas>
  );
}
