import { lazy, Suspense } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

type WindowLabel = "main" | "pet" | "monitor-bar" | "pet-panel" | "taskbar-monitor";

const MainWindow = lazy(() =>
  import("../windows/main/MainWindow").then((module) => ({
    default: module.MainWindow,
  })),
);
const MonitorBarWindow = lazy(() =>
  import("../windows/monitor-bar/MonitorBarWindow").then((module) => ({
    default: module.MonitorBarWindow,
  })),
);
const PetQuickPanelWindow = lazy(() =>
  import("../windows/pet-panel/PetQuickPanelWindow").then((module) => ({
    default: module.PetQuickPanelWindow,
  })),
);
const PetWindow = lazy(() =>
  import("../windows/pet/PetWindow").then((module) => ({
    default: module.PetWindow,
  })),
);
const TaskbarMonitorWindow = lazy(() =>
  import("../windows/taskbar-monitor/TaskbarMonitorWindow").then((module) => ({
    default: module.TaskbarMonitorWindow,
  })),
);

export function getWindowLabel(): WindowLabel {
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
    return (
      <Suspense fallback={null}>
        <PetWindow />
      </Suspense>
    );
  }

  if (label === "monitor-bar") {
    return (
      <Suspense fallback={null}>
        <MonitorBarWindow />
      </Suspense>
    );
  }

  if (label === "pet-panel") {
    return (
      <Suspense fallback={null}>
        <PetQuickPanelWindow />
      </Suspense>
    );
  }

  if (label === "taskbar-monitor") {
    return (
      <Suspense fallback={null}>
        <TaskbarMonitorWindow />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={null}>
      <MainWindow />
    </Suspense>
  );
}
