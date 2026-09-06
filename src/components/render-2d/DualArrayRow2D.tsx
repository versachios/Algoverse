"use client";

import { useEffect, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, OrthographicCamera } from "@react-three/drei";
import * as THREE from "three";
import type { DualArrayStep, IndexHighlight, IndexRole } from "@/algorithms/types";
import { Text3D, textGlyphHeight } from "@/components/render-3d/Text3D";

const ROLE_COLOR: Record<IndexRole, string> = {
  default: "#211e1a",
  comparing: "#d97a4d",
  swapping: "#a54a3a",
  sorted: "#c9b892",
  pointer: "#d97a4d",
  eliminated: "#151311",
};

const ROLE_OPACITY: Record<IndexRole, number> = {
  default: 1,
  comparing: 1,
  swapping: 1,
  sorted: 1,
  pointer: 1,
  eliminated: 0.28,
};

const VALUE_FONT_SIZE = 0.28;
const VALUE_PIXEL_SCALE = 0.325;
const VALUE_MAX_WIDTH = 0.6;
const VALUE_POS_Z = 0.27;

const LABEL_FONT_SIZE = 0.2;
const LABEL_PIXEL_SCALE = 0.41;
const LABEL_MAX_WIDTH = 0.85;

const ROW_TAG_FONT_SIZE = 0.16;
const ROW_TAG_PIXEL_SCALE = 0.41;

const SPACING = 1.0;
const CELL_X_HALF = 0.41;
const CELL_Z_HALF = 0.25;
const CELL_Y_TOP = 0.41;
const CELL_Y_BOTTOM = -0.45;
const ROW_GAP = 1.35; // vertical distance between row centers

const VALUE_HALF_HEIGHT = textGlyphHeight(VALUE_FONT_SIZE, VALUE_PIXEL_SCALE) / 2;
const VALUE_HALF_WIDTH = 0.21;
const LABEL_HALF_HEIGHT = textGlyphHeight(LABEL_FONT_SIZE, LABEL_PIXEL_SCALE) / 2;
const LABEL_HALF_WIDTH = LABEL_MAX_WIDTH / 2;

function rowOffset(len: number) {
  return ((len - 1) * SPACING) / 2;
}

function Cell({
  value,
  x,
  y,
  role,
  label,
}: {
  value: number;
  x: number;
  y: number;
  role: IndexRole;
  label?: string;
}) {
  return (
    <group position={[x, y, 0]}>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.82, 0.82, 0.5]} />
        <meshStandardMaterial
          color={ROLE_COLOR[role]}
          roughness={0.4}
          metalness={0.1}
          transparent
          opacity={ROLE_OPACITY[role]}
        />
      </mesh>
      <Text3D
        position={[0, 0, VALUE_POS_Z]}
        fontSize={VALUE_FONT_SIZE}
        color="#ece7dc"
        pixelScale={VALUE_PIXEL_SCALE}
        maxWidth={VALUE_MAX_WIDTH}
        renderOrder={100}
        depthTest={false}
      >
        {String(value)}
      </Text3D>
      {label && (
        <Text3D
          position={[0, 0.62, 0]}
          fontSize={LABEL_FONT_SIZE}
          color="#d97a4d"
          pixelScale={LABEL_PIXEL_SCALE}
          maxWidth={LABEL_MAX_WIDTH}
          renderOrder={200}
          depthTest={false}
        >
          {label}
        </Text3D>
      )}
    </group>
  );
}

type Row = { values: number[]; highlights: IndexHighlight[]; tag?: string; y: number };

function Row3D({ row }: { row: Row }) {
  const offset = rowOffset(row.values.length);
  const roleByIndex = useMemo(() => {
    const m = new Map<number, { role: IndexRole; label?: string }>();
    for (const h of row.highlights) m.set(h.index, { role: h.role, label: h.label });
    return m;
  }, [row.highlights]);

  return (
    <>
      {row.tag && (
        <Text3D
          position={[-offset - 0.85, row.y, 0]}
          fontSize={ROW_TAG_FONT_SIZE}
          color="#8f897d"
          pixelScale={ROW_TAG_PIXEL_SCALE}
          maxWidth={1.2}
          anchorX="right"
          renderOrder={200}
          depthTest={false}
        >
          {row.tag}
        </Text3D>
      )}
      {row.values.map((v, i) => (
        <Cell
          key={i}
          value={v}
          x={i * SPACING - offset}
          y={row.y}
          role={roleByIndex.get(i)?.role ?? "default"}
          label={roleByIndex.get(i)?.label}
        />
      ))}
    </>
  );
}

function applyFit(camera: THREE.OrthographicCamera, size: { width: number; height: number }, rows: Row[]): void {
  camera.updateMatrixWorld(true);
  const viewMatrix = new THREE.Matrix4().copy(camera.matrixWorld).invert();

  let halfW = 0;
  let halfH = 0;

  for (const row of rows) {
    const offset = rowOffset(row.values.length);
    const labeled = new Set(row.highlights.filter((h) => h.label).map((h) => h.index));

    for (let i = 0; i < row.values.length; i++) {
      const x = i * SPACING - offset;
      for (const cx of [x - CELL_X_HALF, x + CELL_X_HALF]) {
        for (const cy of [row.y + CELL_Y_BOTTOM, row.y + CELL_Y_TOP]) {
          for (const cz of [-CELL_Z_HALF, CELL_Z_HALF]) {
            const p = new THREE.Vector3(cx, cy, cz).applyMatrix4(viewMatrix);
            halfW = Math.max(halfW, Math.abs(p.x));
            halfH = Math.max(halfH, Math.abs(p.y));
          }
        }
      }
      const valueCenter = new THREE.Vector3(x, row.y, VALUE_POS_Z).applyMatrix4(viewMatrix);
      halfW = Math.max(halfW, Math.abs(valueCenter.x) + VALUE_HALF_WIDTH);
      halfH = Math.max(halfH, Math.abs(valueCenter.y) + VALUE_HALF_HEIGHT);
      if (labeled.has(i)) {
        const labelCenter = new THREE.Vector3(x, row.y + 0.62, 0).applyMatrix4(viewMatrix);
        halfW = Math.max(halfW, Math.abs(labelCenter.x) + LABEL_HALF_WIDTH);
        halfH = Math.max(halfH, Math.abs(labelCenter.y) + LABEL_HALF_HEIGHT);
      }
    }
    if (row.tag) {
      const tagCenter = new THREE.Vector3(-offset - 1.3, row.y, 0).applyMatrix4(viewMatrix);
      halfW = Math.max(halfW, Math.abs(tagCenter.x));
    }
  }

  const margin = 1.18;
  const zoomForWidth = size.width / (2 * halfW * margin);
  const zoomForHeight = size.height / (2 * halfH * margin);
  camera.zoom = THREE.MathUtils.clamp(Math.min(zoomForWidth, zoomForHeight), 5, 260);
  camera.updateProjectionMatrix();
}

function FitCamera({ rows }: { rows: Row[] }) {
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);
  const camera = useThree((s) => s.camera) as THREE.OrthographicCamera;
  const key = rows.map((r) => `${r.values.join(",")}|${r.highlights.map((h) => `${h.index}:${h.label ?? ""}`).join(",")}`).join("/");

  useEffect(() => {
    applyFit(camera, { width, height }, rows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, width, height, key]);

  return null;
}

export function DualArrayRow2D({
  step,
  interactive = true,
}: {
  step: DualArrayStep;
  interactive?: boolean;
}) {
  const rows: Row[] = useMemo(() => {
    const list: Row[] = [
      { values: step.arrayA, highlights: step.highlightsA, tag: step.labelA ?? "A", y: ROW_GAP },
      { values: step.arrayB, highlights: step.highlightsB, tag: step.labelB ?? "B", y: 0 },
    ];
    if (step.result) {
      list.push({ values: step.result, highlights: [], tag: step.resultLabel ?? "Kết quả", y: -ROW_GAP });
    }
    return list;
  }, [step]);

  return (
    <Canvas shadows dpr={[1, 1.5]}>
      <color attach="background" args={["#0d0c0a"]} />
      <ambientLight intensity={0.7} color="#f2e9dc" />
      <directionalLight position={[3, 5, 4]} intensity={0.9} color="#e0a67c" castShadow />
      <OrthographicCamera makeDefault position={[4, 4.2, 6]} near={0.1} far={50} />
      <FitCamera rows={rows} />
      {rows.map((row, i) => (
        <Row3D key={i} row={row} />
      ))}
      <OrbitControls
        makeDefault
        enabled={interactive}
        enableRotate={false}
        minZoom={5}
        maxZoom={260}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}
