import { create } from "zustand";
import { getWorkshopState, updateWorkshopState } from "../services/tauriCommands";
import type { WorkshopState } from "../types/workshop";

export interface WorkshopStore {
  state: WorkshopState | null;
  setWorkshopState: (state: WorkshopState) => void;
  loadWorkshopState: () => Promise<void>;
  saveWorkshopState: (state: WorkshopState) => Promise<void>;
}

export const useWorkshopStore = create<WorkshopStore>((set) => ({
  state: null,
  setWorkshopState: (state) => set({ state }),
  loadWorkshopState: async () => {
    const state = await getWorkshopState();
    set({ state });
  },
  saveWorkshopState: async (state) => {
    const updated = await updateWorkshopState(state);
    set({ state: updated });
  },
}));
