import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import {
  deriveCatStatusFromHardware,
  isTemperatureAboveEnterThreshold,
  isTemperatureBelowExitThreshold,
  shouldApplyCatStateTransition,
} from "../catStateRules";
import { getLastUserActivityAt } from "../userActivityTracker";
import { useHardwareStore } from "../../stores/hardwareStore";
import { usePetStore } from "../../stores/petStore";
import { useSettingsStore } from "../../stores/settingsStore";
import type { HardwareMetricsSnapshot } from "../../types/hardware";
import type { CatState } from "../../types/pet";
import type { AppSettings } from "../../types/settings";
import {
  cleanupEventListeners,
  emptyEventCleanup,
  isTauriRuntime,
} from "./eventUtils";
import { registerPetStateListeners } from "./petStateEvents";

let lastDerivedCatState: CatState = "Idle";
let lastDerivedChangedAt = 0;
let pendingCleanupSucceeded = false;
let temperatureSafeSince: number | null = null;

export function registerPetWindowEvents() {
  const unlisteners: Array<Promise<UnlistenFn>> = [];

  if (!isTauriRuntime()) {
    return emptyEventCleanup();
  }

  unlisteners.push(
    listen<HardwareMetricsSnapshot>("hardware:metrics", (event) => {
      useHardwareStore.getState().setMetrics(event.payload);
      applyHardwareDerivedPetFallback(event.payload);
    }),
  );

  registerPetStateListeners(unlisteners);

  unlisteners.push(
    listen("cleanup:succeeded", () => {
      pendingCleanupSucceeded = true;
    }),
  );

  unlisteners.push(
    listen<AppSettings>("settings:updated", (event) => {
      useSettingsStore.getState().setSettings(event.payload);
    }),
  );

  return cleanupEventListeners(unlisteners);
}

function applyHardwareDerivedPetFallback(snapshot: HardwareMetricsSnapshot) {
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
}

function nextTemperatureSafeSince(
  snapshot: HardwareMetricsSnapshot,
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
