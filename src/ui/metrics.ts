import {
  formatBytes,
  formatBytesPerSecond,
  formatPercent,
  formatTemperature,
} from "../services/formatters";
import type { HardwareSnapshot } from "../types/hardware";
import type { MonitorMetric } from "../types/settings";

export function percentLevel(value: number | null | undefined) {
  return value == null ? 0 : Math.max(0, Math.min(100, value));
}

export function metricTone(metric: MonitorMetric) {
  if (metric === "Cpu") {
    return "orange" as const;
  }

  if (metric === "Ram") {
    return "cyan" as const;
  }

  if (metric === "Gpu") {
    return "gold" as const;
  }

  return "green" as const;
}

export function getMonitorMetricView(
  metric: MonitorMetric,
  snapshot: HardwareSnapshot | null,
) {
  if (metric === "Cpu") {
    return {
      label: "CPU",
      value: formatPercent(snapshot?.cpuUsagePercent ?? null),
      detail: formatTemperature(snapshot?.cpuTemperatureCelsius ?? null),
      level: percentLevel(snapshot?.cpuUsagePercent),
      tone: metricTone(metric),
    };
  }

  if (metric === "Ram") {
    return {
      label: "RAM",
      value: formatPercent(snapshot?.memoryUsagePercent ?? null),
      detail: snapshot?.usedMemoryBytes
        ? formatBytes(snapshot.usedMemoryBytes)
        : undefined,
      level: percentLevel(snapshot?.memoryUsagePercent),
      tone: metricTone(metric),
    };
  }

  if (metric === "Disk") {
    return {
      label: "DISK",
      value: formatBytesPerSecond(snapshot?.diskReadBytesPerSecond ?? null),
      detail: `W ${formatBytesPerSecond(snapshot?.diskWriteBytesPerSecond ?? null)}`,
      level: snapshot?.diskReadBytesPerSecond == null ? 0 : 56,
      tone: metricTone(metric),
    };
  }

  if (metric === "Network") {
    return {
      label: "NET",
      value: formatBytesPerSecond(snapshot?.networkDownloadBytesPerSecond ?? null),
      detail: `U ${formatBytesPerSecond(snapshot?.networkUploadBytesPerSecond ?? null)}`,
      level: snapshot?.networkDownloadBytesPerSecond == null ? 0 : 48,
      tone: metricTone(metric),
    };
  }

  return {
    label: "GPU",
    value: formatPercent(snapshot?.gpuUsagePercent ?? null),
    detail: formatTemperature(snapshot?.gpuTemperatureCelsius ?? null),
    level: percentLevel(snapshot?.gpuUsagePercent),
    tone: metricTone(metric),
  };
}
