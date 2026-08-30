import { create } from "zustand";
import type { AlgorithmModule, AlgorithmStep } from "@/algorithms/types";

interface PlaybackState {
  algorithm: AlgorithmModule | null;
  input: number[];
  steps: AlgorithmStep[];
  cursor: number; // index into steps
  playing: boolean;
  speedMs: number; // delay between auto-steps

  load: (algorithm: AlgorithmModule, input: number[]) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  reset: () => void;
  seek: (index: number) => void;
  setSpeed: (ms: number) => void;
}

export const usePlaybackStore = create<PlaybackState>((set, get) => ({
  algorithm: null,
  input: [],
  steps: [],
  cursor: 0,
  playing: false,
  speedMs: 500,

  load: (algorithm, input) => {
    const steps = [...algorithm.run(input)];
    set({ algorithm, input, steps, cursor: 0, playing: false });
  },

  play: () => {
    const { cursor, steps } = get();
    if (cursor >= steps.length - 1) set({ cursor: 0 });
    set({ playing: true });
  },
  pause: () => set({ playing: false }),
  toggle: () => (get().playing ? get().pause() : get().play()),

  next: () =>
    set((s) => ({
      cursor: Math.min(s.cursor + 1, s.steps.length - 1),
      playing: s.cursor + 1 >= s.steps.length - 1 ? false : s.playing,
    })),
  prev: () => set((s) => ({ cursor: Math.max(s.cursor - 1, 0), playing: false })),
  reset: () => set({ cursor: 0, playing: false }),
  seek: (index) =>
    set((s) => ({
      cursor: Math.max(0, Math.min(index, s.steps.length - 1)),
      playing: false,
    })),
  setSpeed: (ms) => set({ speedMs: ms }),
}));
