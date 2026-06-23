import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { useHardwareStore } from "../../stores/hardwareStore";
import { useSettingsStore } from "../../stores/settingsStore";
import type { HardwareMetricsSnapshot } from "../../types/hardware";
import type { AppSettings } from "../../types/settings";
import {
  cleanupEventListeners,
  emptyEventCleanup,
  isTauriRuntime,
} from "./eventUtils";

export function registerMonitorWindowEvents() {
  const unlisteners: Array<Promise<UnlistenFn>> = [];

  if (!isTauriRuntime()) {
    return emptyEventCleanup();
  }

  unlisteners.push(
    listen<HardwareMetricsSnapshot>("hardware:metrics", (event) => {
      useHardwareStore.getState().setMetrics(event.payload);
    }),
  );

  unlisteners.push(
    listen<AppSettings>("settings:updated", (event) => {
      useSettingsStore.getState().setSettings(event.payload);
    }),
  );

  return cleanupEventListeners(unlisteners);
}
