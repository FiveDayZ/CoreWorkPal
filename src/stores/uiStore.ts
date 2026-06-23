import { create } from "zustand";
import type { MainRoute } from "../routeTypes";

export interface UiStore {
  mainRoute: MainRoute;
  setMainRoute: (route: MainRoute) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  mainRoute: "dashboard",
  setMainRoute: (mainRoute) => set({ mainRoute }),
}));
