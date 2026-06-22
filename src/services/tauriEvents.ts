import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { useHardwareStore } from "../stores/hardwareStore";
import { usePetStore } from "../stores/petStore";
import { useSettingsStore } from "../stores/settingsStore";
import { useUiStore } from "../stores/uiStore";
import { useWorkLogStore } from "../stores/workLogStore";
import { useWorkshopStore } from "../stores/workshopStore";
import { mainRoutes, type MainRoute } from "../routes";
import {
  deriveCatStatusFromHardware,
  isTemperatureAboveEnterThreshold,
  isTemperatureBelowExitThreshold,
  shouldApplyCatStateTransition,
} from "./catStateRules";
import { getLastUserActivityAt } from "./userActivityTracker";
import type { HardwareSnapshot } from "../types/hardware";
import type { CatState } from "../types/pet";
import type { CatStateChangedEvent } from "../types/pet";
import type { AppSettings } from "../types/settings";
import type { WorkLogReport } from "../types/workLog";
import type { WorkshopState } from "../types/workshop";

let lastDerivedCatState: CatState = "Idle";
let lastDerivedChangedAt = 0;
let pendingCleanupSucceeded = false;
let temperatureSafeSince: number | null = null;

function isTauriRuntime() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

function isMainRoute(route: string): route is MainRoute {
  return mainRoutes.some((item) => item.key === route);
}

export function registerTauriEvents(): () => Promise<void> {
  const unlisteners: Array<Promise<UnlistenFn>> = [];

  if (!isTauriRuntime()) {
    return async () => undefined;
  }

  unlisteners.push(
    listen<HardwareSnapshot>("hardware:snapshot", (event) => {
      useHardwareStore.getState().setSnapshot(event.payload);
      applyHardwareDerivedPetFallback(event.payload);
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

  unlisteners.push(
    listen<CatStateChangedEvent>("pet:state-changed", (event) => {
      lastDerivedCatState = event.payload.catState;
      lastDerivedChangedAt = event.payload.timestamp;
      usePetStore.getState().setPetStatus(event.payload);
      maybeNotifyPetState(event.payload);
    }),
  );

  unlisteners.push(
    listen("cleanup:succeeded", () => {
      applyCleanupSucceeded(Date.now());
    }),
  );

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

  return async () => {
    const resolved = await Promise.all(unlisteners);
    resolved.forEach((unlisten) => unlisten());
  };
}

function applyHardwareDerivedPetFallback(snapshot: HardwareSnapshot) {
  const settings = useSettingsStore.getState().settings;
  if (!settings) {
    return;
  }

  const nextSafeSince = nextTemperatureSafeSince(
    snapshot,
    settings,
    lastDerivedCatState,
    temperatureSafeSince,
  );
  const event = deriveCatStatusFromHardware(snapshot, settings, {
    cleanupSucceeded: pendingCleanupSucceeded,
    currentCatState: lastDerivedCatState,
    lastUserActivityAt: getLastUserActivityAt(),
    temperatureSafeSince: nextSafeSince,
    timestamp: snapshot.timestamp,
  });
  pendingCleanupSucceeded = false;
  temperatureSafeSince = nextSafeSince;
  const elapsedMs = event.timestamp - lastDerivedChangedAt;

  if (
    lastDerivedChangedAt > 0 &&
    !shouldApplyCatStateTransition(
      lastDerivedCatState,
      event.catState,
      elapsedMs,
    )
  ) {
    return;
  }

  lastDerivedCatState = event.catState;
  lastDerivedChangedAt = event.timestamp;
  usePetStore.getState().setPetStatus(event);
  maybeNotifyPetState(event);
}

function nextTemperatureSafeSince(
  snapshot: HardwareSnapshot,
  settings: Pick<AppSettings, "cpuTemperatureWarning" | "gpuTemperatureWarning">,
  currentCatState: CatState,
  currentSafeSince: number | null,
) {
  if (isTemperatureAboveEnterThreshold(snapshot, settings)) {
    return null;
  }

  if (
    currentCatState === "TemperatureCheck" &&
    isTemperatureBelowExitThreshold(snapshot)
  ) {
    return currentSafeSince ?? snapshot.timestamp;
  }

  return null;
}

function applyCleanupSucceeded(timestamp: number) {
  pendingCleanupSucceeded = true;
  lastDerivedCatState = "Celebrate";
  lastDerivedChangedAt = timestamp;
  usePetStore.getState().setPetStatus({
    timestamp,
    catState: "Celebrate",
    catMessage: "清理完成，工坊状态良好。",
  });
  maybeNotify("CoreCat", "清理完成，工坊状态良好。");
}

function maybeNotifyPetState(event: CatStateChangedEvent) {
  if (
    event.catState !== "TemperatureCheck" &&
    event.catState !== "MemoryCrowded" &&
    event.catState !== "RepairHeavy"
  ) {
    return;
  }

  maybeNotify("CoreCat", event.catMessage);
}

function maybeNotify(title: string, body: string) {
  const settings = useSettingsStore.getState().settings;
  if (!settings?.enableNotifications || typeof window === "undefined") {
    return;
  }

  if (!("Notification" in window)) {
    return;
  }

  if (Notification.permission === "granted") {
    new Notification(title, { body });
    return;
  }

  if (Notification.permission === "default") {
    void Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification(title, { body });
      }
    });
  }
}
