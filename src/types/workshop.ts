export type WorkshopModuleKey =
  | "cpu"
  | "gpu"
  | "ram"
  | "network"
  | "temperature"
  | "disk";

export interface ModuleUpgradeLevels {
  parts: number;
  process: number;
}

export interface WorkshopModuleLevels {
  cpu: ModuleUpgradeLevels;
  gpu: ModuleUpgradeLevels;
  ram: ModuleUpgradeLevels;
  network: ModuleUpgradeLevels;
  temperature: ModuleUpgradeLevels;
  disk: ModuleUpgradeLevels;
}

export interface WorkshopState {
  schemaVersion: number;
  parts: number;
  insight: number;
  workshopLevel: number;
  catAffinityLevel: number;
  moduleLevels: WorkshopModuleLevels;
  lastProductionTime: number;
  totalOnlineSeconds: number;
  todayParts: number;
  todayInsight: number;
  lastDailyResetDate: string;
}

export const defaultModuleLevels: WorkshopModuleLevels = {
  cpu: { parts: 1, process: 1 },
  gpu: { parts: 1, process: 1 },
  ram: { parts: 1, process: 1 },
  network: { parts: 1, process: 1 },
  temperature: { parts: 1, process: 1 },
  disk: { parts: 1, process: 1 },
};

export function normalizeModuleLevels(
  levels: Partial<WorkshopModuleLevels> | null | undefined,
): WorkshopModuleLevels {
  return {
    cpu: normalizeModuleLevel(levels?.cpu),
    gpu: normalizeModuleLevel(levels?.gpu),
    ram: normalizeModuleLevel(levels?.ram),
    network: normalizeModuleLevel(levels?.network),
    temperature: normalizeModuleLevel(levels?.temperature),
    disk: normalizeModuleLevel(levels?.disk),
  };
}

function normalizeModuleLevel(
  level: Partial<ModuleUpgradeLevels> | null | undefined,
): ModuleUpgradeLevels {
  return {
    parts: Math.max(1, Math.floor(level?.parts ?? 1)),
    process: Math.max(1, Math.floor(level?.process ?? 1)),
  };
}
