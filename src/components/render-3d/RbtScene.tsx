"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import { Text3D } from "@/components/render-3d/Text3D";
import type { RbtNodeRole, RbtStep } from "@/algorithms/types";

const ROLE_EMISSIVE: Record<RbtNodeRole, number> = {
  idle: 0.12,
  comparing: 0.45,
  inserted: 0.6,
  rotating: 0.7,
  found: 0.6,
  removed: 0.35,
};

function layoutTree(nodes: Record<string, import("@/algorithms/types").RbtNode>, rootId: string | null) {
  const pos: Record<string, { x: number; y: number }> = {};
  let counter = 0;
  const spacingX = 1.15;
  const spacingY = 1.05;

  const visit = (id: string | null, depth: number) => {
    if (!id || !nodes[id]) return;
    visit(nodes[id].left, depth + 1);
    pos[id] = { x: counter * spacingX, y: -depth * spacingY };
    counter++;
    visit(nodes[id].right, depth + 1);
  };
  visit(rootId, 0);

  const xs = Object.values(pos).map((p) => p.x);
  if (xs.length) {
    const mid = (Math.min(...xs) + Math.max(...xs)) / 2;
    Object.values(pos).forEach((p) => (p.x -= mid));
  }
  return pos;
}

function NodeSphere({ node, role, x, y }: { node: import("@/algorithms/types").RbtNode; role: RbtNodeRole; x: number; y: number }) {
  const color = node.red ? "#c0553f" : "#23201c";
  const label = node.value !== undefined ? `${node.key}:${node.value}` : String(node.key);
  return (
    <group position={[x, y, 0]}>
      <mesh>
        <sphereGeometry args={[0.34, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={ROLE_EMISSIVE[role]}
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>
      <Text3D position={[0, 0, 0.4]} fontSize={0.22} color="#ece7dc" anchorX="center" anchorY="middle">
        {label}
      </Text3D>
      <Text3D position={[0, -0.5, 0.2]} fontSize={0.16} color="#8f897d" anchorX="center" anchorY="middle">
        {node.red ? "R" : "B"}
      </Text3D>
    </group>
  );
}

function Floor() {
  return <gridHelper args={[20, 20, "#2b2723", "#211e1a"]} position={[0, -3, 0]} />;
}

export function RbtScene({ step, interactive = true }: { step: RbtStep; interactive?: boolean }) {
  const { nodes, rootId, nodeStates, edgeHighlight } = step;
  const pos = useMemo(() => layoutTree(nodes, rootId), [nodes, rootId]);

  const edges = useMemo(() => {
    const list: { from: [number, number, number]; to: [number, number, number]; active: boolean }[] = [];
    for (const node of Object.values(nodes)) {
      for (const childId of [node.left, node.right]) {
        if (!childId || !pos[childId] || !pos[node.id]) continue;
        const active = !!edgeHighlight && edgeHighlight[0] === node.id && edgeHighlight[1] === childId;
        list.push({
          from: [pos[node.id].x, pos[node.id].y, 0],
          to: [pos[childId].x, pos[childId].y, 0],
          active,
        });
      }
    }
    return list;
  }, [nodes, pos, edgeHighlight]);

  return (
    <Canvas shadows camera={{ position: [0, 1, 8], fov: 45 }} dpr={[1, 1.5]}>
      <color attach="background" args={["#0d0c0a"]} />
      <fog attach="fog" args={["#0d0c0a", 8, 18]} />
      <ambientLight intensity={0.6} color="#f2e9dc" />
      <directionalLight position={[4, 6, 3]} intensity={1} color="#e0a67c" castShadow />
      <Floor />
      {edges.map((e, i) => (
        <Line key={i} points={[e.from, e.to]} color={e.active ? "#d97a4d" : "#3a332c"} lineWidth={e.active ? 3 : 1.5} />
      ))}
      {Object.values(nodes).map((node) => {
        const p = pos[node.id];
        if (!p) return null;
        return <NodeSphere key={node.id} node={node} role={nodeStates[node.id] ?? "idle"} x={p.x} y={p.y} />;
      })}
      <OrbitControls
        enabled={interactive}
        enablePan={false}
        minDistance={4}
        maxDistance={14}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI / 1.6}
      />
    </Canvas>
  );
}
