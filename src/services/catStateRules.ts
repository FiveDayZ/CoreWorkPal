import type { HardwareSnapshot } from "../types/hardware";
import type { CatState, CatStateChangedEvent } from "../types/pet";
import type { AppSettings } from "../types/settings";

const minStateHoldMs = 3000;
export const idleSleepAfterMs = 15 * 60 * 1000;
const repairLightLoadThreshold = 76;
const repairHeavyLoadThreshold = 92;
export const temperatureCheckEnterMinCelsius = 75;
export const temperatureCheckExitCelsius = 70;
export const temperatureCheckExitStableMs = 5000;

export interface HardwareCatStateContext {
  cleanupSucceeded?: boolean;
  lastUserActivityAt?: number;
  now?: Date;
  temperatureSafeSince?: number | null;
  currentCatState?: CatState;
  timestamp?: number;
}

export function deriveCatStatusFromHardware(
  snapshot: HardwareSnapshot,
  settings: AppSettings,
  context: HardwareCatStateContext = {},
): CatStateChangedEvent {
  const catState = resolveHardwareCatState(snapshot, settings, context);

  return {
    timestamp: context.timestamp ?? Date.now(),
    catState,
    catMessage: messageForCatState(catState),
  };
}

export function resolveHardwareCatState(
  snapshot: HardwareSnapshot,
  settings: Pick<
    AppSettings,
    | "isCatVisible"
    | "isProductionPaused"
    | "enableSleepMode"
    | "cpuTemperatureWarning"
    | "gpuTemperatureWarning"
    | "memoryCrowdedThreshold"
    | "dataSortingCpuThreshold"
  >,
  context: HardwareCatStateContext = {},
): CatState {
  if (!settings.isCatVisible) {
    return "Hidden";
  }

  if (settings.isProductionPaused) {
    return "Sleep";
  }

  if (isTemperatureWarning(snapshot, settings, context)) {
    return "TemperatureCheck";
  }

  if (
    snapshot.memoryUsagePercent != null &&
    snapshot.memoryUsagePercent > settings.memoryCrowdedThreshold
  ) {
    return "MemoryCrowded";
  }

  if (isHeavyLoad(snapshot)) {
    return "RepairHeavy";
  }

  if (
    snapshot.cpuUsagePercent != null &&
    snapshot.cpuUsagePercent >= settings.dataSortingCpuThreshold
  ) {
    return "RepairLight";
  }

  if (isSustainedBusyLoad(snapshot)) {
    return "RepairLight";
  }

  if (context.cleanupSucceeded) {
    return "Celebrate";
  }

  if (settings.enableSleepMode && isInactiveForSleep(context)) {
    return "Sleep";
  }

  return "Idle";
}

export function shouldApplyCatStateTransition(
  current: CatState,
  candidate: CatState,
  elapsedMs: number,
) {
  if (current === candidate) {
    return false;
  }

  if (catStateSeverity(candidate) > catStateSeverity(current)) {
    return true;
  }

  return elapsedMs >= minStateHoldMs;
}

export function catStateSeverity(state: CatState) {
  switch (state) {
    case "Hidden":
      return 100;
    case "TemperatureCheck":
      return 90;
    case "RepairHeavy":
      return 80;
    case "MemoryCrowded":
      return 70;
    case "RepairLight":
      return 50;
    case "Sleep":
      return 40;
    case "DataSorting":
      return 30;
    case "Celebrate":
      return 15;
    case "Interactive":
      return 8;
    case "Idle":
    default:
      return 0;
  }
}

export function messageForCatState(state: CatState) {
  switch (state) {
    case "Idle":
      return "CoreCat 正在待命。";
    case "RepairLight":
      return "检测到轻量维护负载。";
    case "RepairHeavy":
      return "系统负载偏高，CoreCat 正在检修。";
    case "TemperatureCheck":
      return "温度偏高，正在关注散热状态。";
    case "MemoryCrowded":
      return "内存较拥挤，建议留意后台任务。";
    case "DataSorting":
      return "系统空闲，CoreCat 正在整理数据。";
    case "Sleep":
      return "长时间未操作，CoreCat 进入休眠。";
    case "Interactive":
      return "CoreCat 正在响应你的操作。";
    case "Celebrate":
      return "清理完成，工坊状态良好。";
    case "Hidden":
      return "";
  }
}

function isTemperatureWarning(
  snapshot: HardwareSnapshot,
  settings: Pick<AppSettings, "cpuTemperatureWarning" | "gpuTemperatureWarning">,
  context: HardwareCatStateContext,
) {
  if (isTemperatureAboveEnterThreshold(snapshot, settings)) {
    return true;
  }

  if (context.currentCatState !== "TemperatureCheck") {
    return false;
  }

  if (!isTemperatureBelowExitThreshold(snapshot)) {
    return true;
  }

  if (context.temperatureSafeSince == null) {
    return false;
  }

  const now = context.timestamp ?? context.now?.getTime() ?? Date.now();
  return now - context.temperatureSafeSince < temperatureCheckExitStableMs;
}

export function isTemperatureAboveEnterThreshold(
  snapshot: HardwareSnapshot,
  settings: Pick<AppSettings, "cpuTemperatureWarning" | "gpuTemperatureWarning">,
) {
  const cpuWarning = Math.max(
    temperatureCheckEnterMinCelsius,
    settings.cpuTemperatureWarning,
  );
  const gpuWarning = Math.max(
    temperatureCheckEnterMinCelsius,
    settings.gpuTemperatureWarning,
  );

  return (
    (snapshot.cpuTemperatureCelsius != null &&
      snapshot.cpuTemperatureCelsius > cpuWarning) ||
    (snapshot.gpuTemperatureCelsius != null &&
      snapshot.gpuTemperatureCelsius > gpuWarning)
  );
}

export function isTemperatureBelowExitThreshold(snapshot: HardwareSnapshot) {
  const temperatures = [
    snapshot.cpuTemperatureCelsius,
    snapshot.gpuTemperatureCelsius,
  ].filter((value): value is number => value != null && Number.isFinite(value));

  if (temperatures.length === 0) {
    return true;
  }

  return temperatures.every((value) => value < temperatureCheckExitCelsius);
}

function isHeavyLoad(snapshot: HardwareSnapshot) {
  return (
    (snapshot.cpuUsagePercent != null &&
      snapshot.cpuUsagePercent >= repairHeavyLoadThreshold) ||
    (snapshot.gpuUsagePercent != null &&
      snapshot.gpuUsagePercent >= repairHeavyLoadThreshold)
  );
}

function isSustainedBusyLoad(snapshot: HardwareSnapshot) {
  return (
    snapshot.gpuUsagePercent != null &&
    snapshot.gpuUsagePercent >= repairLightLoadThreshold
  );
}

function isInactiveForSleep(context: HardwareCatStateContext) {
  if (context.lastUserActivityAt == null) {
    return false;
  }

  const now = context.timestamp ?? context.now?.getTime() ?? Date.now();
  return now - context.lastUserActivityAt >= idleSleepAfterMs;
}
