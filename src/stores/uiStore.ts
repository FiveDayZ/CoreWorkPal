import { create } from "zustand";
import type { MainRoute } from "../routes";

export interface UiStore {
  mainRoute: MainRoute;
  setMainRoute: (route: MainRoute) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  mainRoute: "dashboard",
  setMainRoute: (mainRoute) => set({ mainRoute }),
}));
