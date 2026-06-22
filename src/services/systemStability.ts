import type { HardwareSnapshot } from "../types/hardware";
import type { AppSettings } from "../types/settings";

export interface SystemStability {
  score: number;
  label: string;
  detail: string;
  tone: "normal" | "warning" | "danger";
}

export function calculateSystemStability(
  snapshot: HardwareSnapshot | null,
  settings: AppSettings | null,
): SystemStability {
  if (!snapshot) {
    return {
      score: 100,
      label: "等待采样",
      detail: "监控数据加载中",
      tone: "normal",
    };
  }

  const cpuWarning = settings?.cpuTemperatureWarning ?? 80;
  const gpuWarning = settings?.gpuTemperatureWarning ?? 82;
  const memoryWarning = settings?.memoryCrowdedThreshold ?? 82;
  const penalties = [
    thermalPenalty(snapshot.cpuTemperatureCelsius, cpuWarning, 26),
    thermalPenalty(snapshot.gpuTemperatureCelsius, gpuWarning, 20),
    memoryPenalty(snapshot.memoryUsagePercent, memoryWarning),
    loadPenalty(snapshot.cpuUsagePercent, 12),
    loadPenalty(snapshot.gpuUsagePercent, 8),
    throughputPenalty(
      (snapshot.diskReadBytesPerSecond ?? 0) +
        (snapshot.diskWriteBytesPerSecond ?? 0),
      160 * 1024 * 1024,
      8,
    ),
    throughputPenalty(
      (snapshot.networkDownloadBytesPerSecond ?? 0) +
        (snapshot.networkUploadBytesPerSecond ?? 0),
      220 * 1024 * 1024,
      5,
    ),
  ];
  const score = Math.round(
    clamp(100 - penalties.reduce((total, item) => total + item, 0), 35, 100),
  );
  const detail = resolveStabilityDetail(snapshot, settings);

  if (score < 60) {
    return { score, label: "高风险", detail, tone: "danger" };
  }

  if (score < 78) {
    return { score, label: "需要维护", detail, tone: "warning" };
  }

  if (score < 92) {
    return { score, label: "承压运行", detail, tone: "warning" };
  }

  return { score, label: "状态稳定", detail, tone: "normal" };
}

function thermalPenalty(value: number | null | undefined, warning: number, max: number) {
  if (value == null) {
    return 0;
  }

  if (value <= warning - 12) {
    return 0;
  }

  if (value <= warning) {
    return ((value - (warning - 12)) / 12) * (max * 0.35);
  }

  return Math.min(max, max * 0.35 + ((value - warning) / 20) * (max * 0.65));
}

function memoryPenalty(value: number | null | undefined, warning: number) {
  if (value == null || value <= warning - 10) {
    return 0;
  }

  if (value <= warning) {
    return ((value - (warning - 10)) / 10) * 8;
  }

  return Math.min(24, 8 + ((value - warning) / (100 - warning)) * 16);
}

function loadPenalty(value: number | null | undefined, max: number) {
  if (value == null || value <= 72) {
    return 0;
  }

  if (value <= 90) {
    return ((value - 72) / 18) * (max * 0.58);
  }

  return Math.min(max, max * 0.58 + ((value - 90) / 10) * (max * 0.42));
}

function throughputPenalty(value: number, highWatermark: number, max: number) {
  if (value <= highWatermark * 0.35) {
    return 0;
  }

  return Math.min(max, ((value - highWatermark * 0.35) / (highWatermark * 0.65)) * max);
}

function resolveStabilityDetail(
  snapshot: HardwareSnapshot,
  settings: AppSettings | null,
) {
  const cpuWarning = settings?.cpuTemperatureWarning ?? 80;
  const gpuWarning = settings?.gpuTemperatureWarning ?? 82;
  const memoryWarning = settings?.memoryCrowdedThreshold ?? 82;

  if (
    (snapshot.cpuTemperatureCelsius ?? 0) > cpuWarning ||
    (snapshot.gpuTemperatureCelsius ?? 0) > gpuWarning
  ) {
    return "温度过高，优先降温";
  }

  if ((snapshot.memoryUsagePercent ?? 0) > memoryWarning) {
    return "内存紧张，建议整理后台";
  }

  if ((snapshot.cpuUsagePercent ?? 0) > 90 || (snapshot.gpuUsagePercent ?? 0) > 90) {
    return "核心负载过高";
  }

  if ((snapshot.cpuUsagePercent ?? 0) > 72 || (snapshot.gpuUsagePercent ?? 0) > 72) {
    return "高负载运行中";
  }

  return "各项指标处于合理区间";
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
