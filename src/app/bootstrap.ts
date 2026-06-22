import { registerTauriEvents } from "../services/tauriEvents";
import { registerUserActivityTracking } from "../services/userActivityTracker";
import { useSettingsStore } from "../stores/settingsStore";
import { useWorkLogStore } from "../stores/workLogStore";
import { useWorkshopStore } from "../stores/workshopStore";

let bootstrapped = false;

export function bootstrapApp() {
  if (bootstrapped) {
    return undefined;
  }

  bootstrapped = true;
  const unlisten = registerTauriEvents();
  const unregisterUserActivityTracking = registerUserActivityTracking();

  void useSettingsStore.getState().loadSettings();
  void useWorkshopStore.getState().loadWorkshopState();
  void useWorkLogStore.getState().loadWorkLogReport();

  return () => {
    unregisterUserActivityTracking();
    void unlisten();
    bootstrapped = false;
  };
}
