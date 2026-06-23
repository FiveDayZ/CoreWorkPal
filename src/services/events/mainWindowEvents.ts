import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { isMainRoute } from "../../routeTypes";
import { useHardwareStore } from "../../stores/hardwareStore";
import { useSettingsStore } from "../../stores/settingsStore";
import { useUiStore } from "../../stores/uiStore";
import { useWorkLogStore } from "../../stores/workLogStore";
import { useWorkshopStore } from "../../stores/workshopStore";
import type { HardwareMetricsSnapshot } from "../../types/hardware";
import type { AppSettings } from "../../types/settings";
import type { WorkLogReport } from "../../types/workLog";
import type { WorkshopState } from "../../types/workshop";
import {
  cleanupEventListeners,
  emptyEventCleanup,
  isTauriRuntime,
} from "./eventUtils";
import { registerPetStateListeners } from "./petStateEvents";

export function registerMainWindowEvents() {
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
    listen<WorkshopState>("workshop:updated", (event) => {
      useWorkshopStore.getState().setWorkshopState(event.payload);
    }),
  );

  unlisteners.push(
    listen<WorkLogReport>("worklog:updated", (event) => {
      const workLogStore = useWorkLogStore.getState();
      if (workLogStore.selectedDate === event.payload.date) {
        workLogStore.setReport(event.payload);
      }
    }),
  );

  registerPetStateListeners(unlisteners);

  unlisteners.push(
    listen<AppSettings>("settings:updated", (event) => {
      useSettingsStore.getState().setSettings(event.payload);
    }),
  );

  unlisteners.push(
    listen<string>("ui:navigate-main", (event) => {
      if (isMainRoute(event.payload)) {
        useUiStore.getState().setMainRoute(event.payload);
      }
    }),
  );

  return cleanupEventListeners(unlisteners);
}
