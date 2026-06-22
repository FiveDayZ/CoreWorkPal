import type { HardwareSnapshot } from "../types/hardware";
import type { MonitorMetric } from "../types/settings";
import { formatBytesPerSecond } from "./formatters";

export const defaultTaskbarMetrics: MonitorMetric[] = [
  "Cpu",
  "Ram",
  "Gpu",
  "Network",
];

export function getMonitorTaskbarText(
  metrics: MonitorMetric[],
  snapshot: HardwareSnapshot | null,
) {
  if (metrics.length === 0) {
    return "未选择监控指标";
  }

  return metrics
    .map((metric) => getTaskbarMetricText(metric, snapshot))
    .join(" | ");
}

export function getTaskbarMetricText(
  metric: MonitorMetric,
  snapshot: HardwareSnapshot | null,
) {
  if (metric === "Cpu") {
    return `CPU ${formatTaskbarPercent(snapshot?.cpuUsagePercent ?? null)}`;
  }

  if (metric === "Ram") {
    return `RAM ${formatTaskbarPercent(snapshot?.memoryUsagePercent ?? null)}`;
  }

  if (metric === "Gpu") {
    return `GPU ${formatTaskbarPercent(snapshot?.gpuUsagePercent ?? null)}`;
  }

  if (metric === "Network") {
    return `NET ↓${formatBytesPerSecond(
      snapshot?.networkDownloadBytesPerSecond ?? null,
    )} ↑${formatBytesPerSecond(snapshot?.networkUploadBytesPerSecond ?? null)}`;
  }

  return `DISK R${formatBytesPerSecond(
    snapshot?.diskReadBytesPerSecond ?? null,
  )} W${formatBytesPerSecond(snapshot?.diskWriteBytesPerSecond ?? null)}`;
}

function formatTaskbarPercent(value: number | null) {
  if (value == null) {
    return "N/A";
  }

  return `${Math.round(Math.max(0, Math.min(100, value)))}%`;
}
