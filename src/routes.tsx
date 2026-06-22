import type React from "react";
import { AboutPage } from "./pages/about/AboutPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { DevicesPage } from "./pages/devices/DevicesPage";
import { SettingsPage } from "./pages/settings/SettingsPage";
import { WorkLogPage } from "./pages/work-log/WorkLogPage";
import { WorkshopPage } from "./pages/workshop/WorkshopPage";

export type MainRoute = "dashboard" | "workshop" | "devices" | "settings" | "workLog" | "about";

export const mainRoutes: Array<{
  key: MainRoute;
  label: string;
  element: React.ComponentType;
}> = [
  { key: "dashboard", label: "Dashboard", element: DashboardPage },
  { key: "devices", label: "Devices", element: DevicesPage },
  { key: "workshop", label: "Workshop", element: WorkshopPage },
  { key: "settings", label: "Settings", element: SettingsPage },
  { key: "workLog", label: "Work Log", element: WorkLogPage },
  { key: "about", label: "About", element: AboutPage },
];
