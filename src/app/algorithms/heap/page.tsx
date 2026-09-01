'use client';

import { AlgorithmPageShell } from '@/components/AlgorithmPageShell';
import TreeScene from '@/components/render-3d/TreeScene';

export default function Page() {
  return (
    <AlgorithmPageShell algorithmId="heap">
      <TreeScene />
    </AlgorithmPageShell>
  );
}
