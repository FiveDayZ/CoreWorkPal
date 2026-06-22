import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  showMainWindow,
  showPetPanel,
  togglePetPanel,
} from "./tauriCommands";

function isTauriRuntime() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export async function startDraggingCurrentWindow(): Promise<void> {
  if (!isTauriRuntime()) {
    return;
  }

  await getCurrentWindow().startDragging();
}

export async function openMainWindow(): Promise<void> {
  await showMainWindow();
}

export async function openPetPanel(): Promise<void> {
  await showPetPanel();
}

export async function toggleQuickPanel(): Promise<void> {
  await togglePetPanel();
}

export async function minimizeMainWindow(): Promise<void> {
  if (!isTauriRuntime()) {
    return;
  }
  await getCurrentWindow().minimize();
}

export async function closeMainWindow(): Promise<void> {
  if (!isTauriRuntime()) {
    return;
  }
  await getCurrentWindow().hide();
}
