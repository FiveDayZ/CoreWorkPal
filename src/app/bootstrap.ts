import { registerTauriEvents } from "../services/tauriEvents";
import { registerUserActivityTracking } from "../services/userActivityTracker";
import { useSettingsStore } from "../stores/settingsStore";
import { useWorkLogStore } from "../stores/workLogStore";
import { useWorkshopStore } from "../stores/workshopStore";

type BootstrapWindowLabel =
  | "main"
  | "pet"
  | "monitor-bar"
  | "pet-panel"
  | "taskbar-monitor";

let bootstrapped = false;

export function bootstrapApp(label: BootstrapWindowLabel) {
  if (bootstrapped) {
    return undefined;
  }

  bootstrapped = true;
  const unlisten = registerTauriEvents({
    derivePetState: label === "pet",
    listenHardware:
      label === "main" ||
      label === "pet" ||
      label === "monitor-bar" ||
      label === "pet-panel" ||
      label === "taskbar-monitor",
    listenNavigation: label === "main",
    listenPetState: label === "main" || label === "pet" || label === "pet-panel",
    listenSettings: true,
    listenWorkLog: label === "main",
    listenWorkshop: label === "main" || label === "pet-panel",
  });
  const unregisterUserActivityTracking =
    label === "pet" ? registerUserActivityTracking() : () => undefined;

  void useSettingsStore.getState().loadSettings();
  if (label === "main" || label === "pet-panel") {
    void useWorkshopStore.getState().loadWorkshopState();
  }
  if (label === "main") {
    void useWorkLogStore.getState().loadWorkLogReport();
  }

  return () => {
    unregisterUserActivityTracking();
    void unlisten();
    bootstrapped = false;
  };
}
