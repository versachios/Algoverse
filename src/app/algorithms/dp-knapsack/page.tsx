'use client';

import { AlgorithmPageShell } from '@/components/AlgorithmPageShell';
import DPGridScene from '@/components/render-3d/DPGridScene';

export default function DPKnapsackPage() {
  return (
    <AlgorithmPageShell algorithmId="dp-knapsack">
      <DPGridScene />
    </AlgorithmPageShell>
  );
}
