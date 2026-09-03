"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Canvas, useFrame } from "@react-three/fiber";
import { Billboard, Line, OrbitControls } from "@react-three/drei";
import { Text3D } from "@/components/render-3d/Text3D";
import * as THREE from "three";
import { catalogue, groups } from "@/algorithms/catalogue";

const ALGOVERSE_REPO_URL = "https://github.com/versachios/Algoverse";

// Solar-system layout: Algoverse itself is the sun at the center (clicking it
// opens the repo), each catalogue group gets its own orbit ring, and every
// lesson in that group is a planet drifting around the ring at its own phase.
function buildOrbits() {
  const baseRadius = 2.4;
  const radiusStep = 1.15;

  return groups.map((group, groupIndex) => {
    const radius = baseRadius + groupIndex * radiusStep;
    const items = catalogue.filter((c) => c.group === group);
    const planets = items.map((item, i) => ({
      slug: item.slug,
      name: item.name,
      ready: item.ready,
      phase: (i / items.length) * Math.PI * 2,
      // inner orbits sweep faster than outer ones, like real planets
      speed: 0.22 / Math.sqrt(radius),
    }));
    return { group, radius, planets };
  });
}

function Sun() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.15;
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => window.open(ALGOVERSE_REPO_URL, "_blank", "noopener,noreferrer")}
      >
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial
          color="#d97a4d"
          emissive="#d97a4d"
          emissiveIntensity={hovered ? 1.4 : 1}
          roughness={0.3}
        />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={1.4} color="#d97a4d" distance={14} />
      <Billboard position={[0, 0.95, 0]}>
        <Text3D
          fontSize={0.26}
          color={hovered ? "#ffd9b0" : "#ece7dc"}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.012}
          outlineColor="#0d0c0a"
        >
          ALGOVERSE
        </Text3D>
      </Billboard>
      {hovered && (
        <Billboard position={[0, 0.65, 0]}>
          <Text3D
            fontSize={0.14}
            color="#8f897d"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.008}
            outlineColor="#0d0c0a"
          >
            mở repo trên GitHub
          </Text3D>
        </Billboard>
      )}
    </group>
  );
}

function OrbitRing({ radius }: { radius: number }) {
  const points = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      pts.push([Math.cos(a) * radius, 0, Math.sin(a) * radius]);
    }
    return pts;
  }, [radius]);

  return <Line points={points} color="#2b2723" lineWidth={1} transparent opacity={0.5} />;
}

function Planet({
  planet,
  radius,
  onNavigate,
}: {
  planet: ReturnType<typeof buildOrbits>[number]["planets"][number];
  radius: number;
  onNavigate: (slug: string) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }, delta) => {
    if (groupRef.current) {
      const angle = planet.phase + clock.getElapsedTime() * planet.speed;
      groupRef.current.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    }
    if (meshRef.current) {
      const target = hovered ? 1.6 : 1;
      meshRef.current.scale.setScalar(THREE.MathUtils.damp(meshRef.current.scale.x, target, 10, delta));
    }
  });

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => planet.ready && onNavigate(planet.slug)}
      >
        {planet.ready ? (
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
          <Text3D
            fontSize={0.19}
            color={planet.ready ? "#ece7dc" : "#8f897d"}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.01}
            outlineColor="#0d0c0a"
          >
            {planet.name}
          </Text3D>
        </Billboard>
      )}
    </group>
  );
}

function Scene() {
  const router = useRouter();
  const orbits = useMemo(() => buildOrbits(), []);

  return (
    <>
      <color attach="background" args={["#0d0c0a"]} />
      <ambientLight intensity={0.5} color="#f2e9dc" />
      <Sun />
      {orbits.map(({ group, radius, planets }) => (
        <group key={group}>
          <OrbitRing radius={radius} />
          {planets.map((planet) => (
            <Planet
              key={planet.slug}
              planet={planet}
              radius={radius}
              onNavigate={(slug) => router.push(`/algorithms/${slug}`)}
            />
          ))}
        </group>
      ))}
      <OrbitControls enablePan={false} minDistance={6} maxDistance={16} />
    </>
  );
}

export function TopicGraph3D() {
  return (
    <div className="relative h-full w-full">
      <Canvas camera={{ position: [0, 5, 12], fov: 42 }} dpr={[1, 1.5]}>
        <Scene />
      </Canvas>
      <div className="pointer-events-none absolute bottom-3 left-3 font-mono-tech text-[11px] text-[var(--color-muted)] uppercase tracking-widest">
        kéo để xoay · di chuột vào node để xem tên · nhấp hành tinh trung tâm để mở repo, nhấp bài học để mở
      </div>
    </div>
  );
}
