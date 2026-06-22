import { getCurrentWindow } from "@tauri-apps/api/window";
import { MainWindow } from "../windows/main/MainWindow";
import { MonitorBarWindow } from "../windows/monitor-bar/MonitorBarWindow";
import { PetQuickPanelWindow } from "../windows/pet-panel/PetQuickPanelWindow";
import { PetWindow } from "../windows/pet/PetWindow";
import { TaskbarMonitorWindow } from "../windows/taskbar-monitor/TaskbarMonitorWindow";

type WindowLabel = "main" | "pet" | "monitor-bar" | "pet-panel" | "taskbar-monitor";

function getWindowLabel(): WindowLabel {
  try {
    const label = getCurrentWindow().label;
    if (
      label === "main" ||
      label === "pet" ||
      label === "monitor-bar" ||
      label === "pet-panel" ||
      label === "taskbar-monitor"
    ) {
      return label;
    }
  } catch {
    // Browser fallback for Vite preview outside Tauri.
  }

  const pathLabel = window.location.pathname.replace("/", "");
  if (
    pathLabel === "pet" ||
    pathLabel === "monitor-bar" ||
    pathLabel === "pet-panel" ||
    pathLabel === "taskbar-monitor"
  ) {
    return pathLabel;
  }

  return "main";
}

export function WindowRouter() {
  const label = getWindowLabel();

  if (label === "pet") {
    return <PetWindow />;
  }

  if (label === "monitor-bar") {
    return <MonitorBarWindow />;
  }

  if (label === "pet-panel") {
    return <PetQuickPanelWindow />;
  }

  if (label === "taskbar-monitor") {
    return <TaskbarMonitorWindow />;
  }

  return <MainWindow />;
}
