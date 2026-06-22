import { useEffect } from "react";
import { bootstrapApp } from "./bootstrap";
import { getWindowLabel, WindowRouter } from "./WindowRouter";
import { useSettingsStore } from "../stores/settingsStore";

export function AppShell() {
  const windowLabel = getWindowLabel();
  const settings = useSettingsStore((state) => state.settings);

  useEffect(() => bootstrapApp(windowLabel), [windowLabel]);

  useEffect(() => {
    if (!settings?.themeName) {
      return;
    }

    const htmlEl = document.documentElement;
    htmlEl.classList.remove("theme-coreworkpal", "theme-classic", "theme-cyber", "theme-steampunk");
    // "coreworkpal" is the default skin — no theme class needed, uses :root variables
    if (settings.themeName !== "coreworkpal") {
      htmlEl.classList.add(`theme-${settings.themeName}`);
    }
  }, [settings?.themeName]);

  return <WindowRouter />;
}
