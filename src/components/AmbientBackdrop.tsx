"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Simple deterministic PRNG so the point field is stable and generating it
// isn't an "impure call during render" — it runs once at module load.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generatePositions(count: number, seed: number) {
  const rand = mulberry32(seed);
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 6 + rand() * 6;
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.5;
    arr[i * 3 + 2] = r * Math.cos(phi);
  }
  return arr;
}

// Computed once at module load, not during a component's render pass.
const AMBIENT_POINTS = generatePositions(260, 42);

function PointField() {
  const ref = useRef<THREE.Points>(null);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[AMBIENT_POINTS, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="#2c3f5c" sizeAttenuation transparent opacity={0.7} />
    </points>
  );
}

function DriftingShape({
  position,
  color,
  speed,
  geometry,
}: {
  position: [number, number, number];
  color: string;
  speed: number;
  geometry: "ico" | "octa" | "box";
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * speed;
    ref.current.rotation.y += delta * speed * 0.7;
  });
  return (
    <mesh ref={ref} position={position}>
      {geometry === "ico" && <icosahedronGeometry args={[1, 0]} />}
      {geometry === "octa" && <octahedronGeometry args={[0.9, 0]} />}
      {geometry === "box" && <boxGeometry args={[1, 1, 1]} />}
      <meshBasicMaterial color={color} wireframe transparent opacity={0.35} />
    </mesh>
  );
}

export function AmbientBackdrop() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none opacity-70">
      <Canvas camera={{ position: [0, 0, 9], fov: 50 }} dpr={[1, 1.25]}>
        <PointField />
        <DriftingShape position={[-4, 1.5, -2]} color="#4dd9c0" speed={0.12} geometry="ico" />
        <DriftingShape position={[4.5, -1.2, -3]} color="#f0a94e" speed={0.09} geometry="octa" />
        <DriftingShape position={[2.5, 2.6, -5]} color="#22344f" speed={0.06} geometry="box" />
      </Canvas>
    </div>
  );
}
