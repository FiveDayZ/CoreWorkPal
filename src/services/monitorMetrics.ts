import type { MonitorBarMode, MonitorMetric } from "../types/settings";

/**
 * Returns the metrics to render for a given monitor bar mode.
 *
 * "Micro" mode is space-constrained (e.g. the taskbar strip) and only shows the
 * first two metrics; other modes show the full set. Previously this identical
 * helper was duplicated in MonitorBarWindow and TaskbarMonitorWindow.
 */
export function getDisplayedMetrics(
  metrics: MonitorMetric[],
  mode: MonitorBarMode,
): MonitorMetric[] {
  if (mode === "Micro") {
    return metrics.slice(0, 2);
  }

  return metrics;
}
