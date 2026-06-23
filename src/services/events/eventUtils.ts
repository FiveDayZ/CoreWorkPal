import type { UnlistenFn } from "@tauri-apps/api/event";

export type EventCleanup = () => Promise<void>;

export function isTauriRuntime() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export function emptyEventCleanup(): EventCleanup {
  return async () => undefined;
}

export function cleanupEventListeners(
  unlisteners: Array<Promise<UnlistenFn>>,
): EventCleanup {
  return async () => {
    const resolved = await Promise.all(unlisteners);
    resolved.forEach((unlisten) => unlisten());
  };
}
