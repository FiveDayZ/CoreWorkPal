export type MonitorMetric = "Cpu" | "Ram" | "Disk" | "Network" | "Gpu";
export type MonitorBarMode = "Micro" | "Default" | "Expanded";

export interface AppSettings {
  schemaVersion: number;
  launchAtStartup: boolean;
  isCatVisible: boolean;
  isMonitorBarVisible: boolean;
  enableSleepMode: boolean;
  enableSound: boolean;
  enableNotifications: boolean;
  isProductionPaused: boolean;
  enableLowPowerMode: boolean;
  enableStaticCatMode: boolean;
  enablePetBubble: boolean;
  showMonitorDataInTaskbar: boolean;
  samplingIntervalMs: number;
  backgroundSamplingIntervalMs: number;
  dataSortingCpuThreshold: number;
  catSize: number;
  catOpacity: number;
  catWindowX: number;
  catWindowY: number;
  monitorBarX: number;
  monitorBarY: number;
  cpuTemperatureWarning: number;
  gpuTemperatureWarning: number;
  memoryCrowdedThreshold: number;
  errorGlitchCpuThreshold: number;
  themeName: string;
  visibleMonitorMetrics: MonitorMetric[];
  monitorBarMode: MonitorBarMode;
  visibleTaskbarMetrics: MonitorMetric[];
  taskbarMonitorMode: MonitorBarMode;
}

export type AppSettingsPatch = Partial<AppSettings>;
