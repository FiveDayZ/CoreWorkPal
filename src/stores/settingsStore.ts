import { create } from "zustand";
import { getAppSettings, updateAppSettings } from "../services/tauriCommands";
import type { AppSettings, AppSettingsPatch } from "../types/settings";

export interface SettingsStore {
  settings: AppSettings | null;
  setSettings: (settings: AppSettings) => void;
  loadSettings: () => Promise<void>;
  updateSettings: (patch: AppSettingsPatch) => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: null,
  setSettings: (settings) => set({ settings }),
  loadSettings: async () => {
    const settings = await getAppSettings();
    set({ settings });
  },
  updateSettings: async (patch) => {
    const previousSettings = get().settings;

    if (previousSettings) {
      set({ settings: { ...previousSettings, ...patch } });
    }

    try {
      const settings = await updateAppSettings(patch);
      set({ settings });
    } catch (error) {
      if (previousSettings) {
        set({ settings: previousSettings });
      }
      throw error;
    }
  },
}));
