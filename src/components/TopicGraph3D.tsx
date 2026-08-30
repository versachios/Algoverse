"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Canvas, useFrame } from "@react-three/fiber";
import { Billboard, Line, OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import { catalogue } from "@/algorithms/catalogue";

// Single necklace layout, in catalogue order — which already follows the
// suggested learning path — so the graph doubles as a literal timeline of
// the curriculum instead of an arbitrary cluster of dots.
function layout() {
  const total = catalogue.length;
  const radiusX = 4.6;
  const radiusY = 2.4;

  const nodes = catalogue.map((item, i) => {
    const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
    const wobble = Math.sin(angle * 3) * 0.5; // gentle depth variation, not flat
    const pos: [number, number, number] = [
      Math.cos(angle) * radiusX,
      Math.sin(angle) * radiusY,
      wobble,
    ];
    return { slug: item.slug, name: item.name, ready: item.ready, group: item.group, pos };
  });

  const edges: [THREE.Vector3, THREE.Vector3][] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    edges.push([new THREE.Vector3(...nodes[i].pos), new THREE.Vector3(...nodes[i + 1].pos)]);
  }

  return { nodes, edges };
}

function Node({
  node,
  onNavigate,
}: {
  node: ReturnType<typeof layout>["nodes"][number];
  onNavigate: (slug: string) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const target = hovered ? 1.6 : 1;
    meshRef.current.scale.setScalar(
      THREE.MathUtils.damp(meshRef.current.scale.x, target, 10, delta)
    );
  });

  return (
    <group position={node.pos}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => node.ready && onNavigate(node.slug)}
      >
        {node.ready ? (
          <>
            <sphereGeometry args={[0.15, 20, 20]} />
            <meshStandardMaterial
              color="#d97a4d"
              emissive="#d97a4d"
              emissiveIntensity={hovered ? 1.2 : 0.6}
              roughness={0.4}
            />
          </>
        ) : (
          <>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshBasicMaterial color="#4a4238" wireframe transparent opacity={0.7} />
          </>
        )}
      </mesh>
      {hovered && (
        <Billboard position={[0, 0.34, 0]}>
          <Text
            fontSize={0.19}
            color={node.ready ? "#ece7dc" : "#8f897d"}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.01}
            outlineColor="#0d0c0a"
          >
            {node.name}
          </Text>
        </Billboard>
      )}
    </group>
  );
}

function Edges({ edges }: { edges: [THREE.Vector3, THREE.Vector3][] }) {
  return (
    <>
      {edges.map((pts, i) => (
        <Line key={i} points={pts} color="#2b2723" lineWidth={1} transparent opacity={0.55} />
      ))}
    </>
  );
}

function Scene() {
  const router = useRouter();
  const { nodes, edges } = useMemo(() => layout(), []);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.05;
  });

  return (
    <>
      <color attach="background" args={["#0d0c0a"]} />
      <ambientLight intensity={0.7} color="#f2e9dc" />
      <pointLight position={[0, 0, 6]} intensity={0.9} color="#d97a4d" />
      <group ref={groupRef}>
        <Edges edges={edges} />
        {nodes.map((n) => (
          <Node key={n.slug} node={n} onNavigate={(slug) => router.push(`/algorithms/${slug}`)} />
        ))}
      </group>
      <OrbitControls enablePan={false} minDistance={5} maxDistance={13} />
    </>
  );
}

export function TopicGraph3D() {
  return (
    <div className="relative h-full w-full">
      <Canvas camera={{ position: [0, 0.6, 9.5], fov: 42 }} dpr={[1, 1.5]}>
        <Scene />
      </Canvas>
      <div className="pointer-events-none absolute bottom-3 left-3 font-mono-tech text-[11px] text-[var(--color-muted)] uppercase tracking-widest">
        kéo để xoay · di chuột vào node để xem tên · nhấp để mở bài học
      </div>
    </div>
  );
}
