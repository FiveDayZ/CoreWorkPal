import { create } from "zustand";
import type { HardwareSnapshot } from "../types/hardware";

export interface HardwareStore {
  snapshot: HardwareSnapshot | null;
  setSnapshot: (snapshot: HardwareSnapshot) => void;
}

export const useHardwareStore = create<HardwareStore>((set) => ({
  snapshot: null,
  setSnapshot: (snapshot) => set({ snapshot }),
}));
