import { invoke } from "@tauri-apps/api/core";
import type { MainRoute } from "../routes";
import type { HardwareSnapshot } from "../types/hardware";
import type { AppSettings, AppSettingsPatch } from "../types/settings";
import type { WorkLogReport } from "../types/workLog";
import { defaultModuleLevels, type WorkshopState } from "../types/workshop";

export type CoreCatInteractionAction = "pet" | "sortParts";

function isTauriRuntime() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

const browserSettings: AppSettings = {
  schemaVersion: 1,
  launchAtStartup: false,
  isCatVisible: true,
  isMonitorBarVisible: true,
  enableSleepMode: true,
  enableSound: false,
  enableNotifications: false,
  isProductionPaused: false,
  enableLowPowerMode: false,
  enableStaticCatMode: false,
  enablePetBubble: true,
  showMonitorDataInTaskbar: true,
  samplingIntervalMs: 2000,
  backgroundSamplingIntervalMs: 5000,
  dataSortingCpuThreshold: 40,
  catSize: 1,
  catOpacity: 0.95,
  catWindowX: 1200,
  catWindowY: 520,
  monitorBarX: 580,
  monitorBarY: 24,
  cpuTemperatureWarning: 80,
  gpuTemperatureWarning: 82,
  memoryCrowdedThreshold: 82,
  errorGlitchCpuThreshold: 96,
  themeName: "coreworkpal",
  visibleMonitorMetrics: ["Cpu", "Ram", "Gpu", "Network"],
  monitorBarMode: "Default",
  visibleTaskbarMetrics: ["Cpu", "Ram", "Gpu", "Network"],
  taskbarMonitorMode: "Default",
};

const browserWorkshop: WorkshopState = {
  schemaVersion: 1,
  parts: 0,
  insight: 0,
  workshopLevel: 1,
  catAffinityLevel: 1,
  moduleLevels: defaultModuleLevels,
  lastProductionTime: 0,
  totalOnlineSeconds: 0,
  todayParts: 0,
  todayInsight: 0,
  lastDailyResetDate: "1970-01-01",
};

const browserSnapshot: HardwareSnapshot = {
  timestamp: Date.now(),
  cpuUsagePercent: null,
  gpuUsagePercent: null,
  memoryUsagePercent: null,
  cpuTemperatureCelsius: null,
  gpuTemperatureCelsius: null,
  diskReadBytesPerSecond: null,
  diskWriteBytesPerSecond: null,
  networkDownloadBytesPerSecond: null,
  networkUploadBytesPerSecond: null,
  cpuName: null,
  gpuName: null,
  gpuMemoryUsedBytes: null,
  gpuMemoryTotalBytes: null,
  totalMemoryBytes: null,
  usedMemoryBytes: null,
  cpuPhysicalCoreCount: null,
  cpuLogicalCoreCount: null,
  deviceInventory: {
    motherboard: [],
    memoryModules: [],
    gpus: [],
    displays: [],
    disks: [],
    audioDevices: [],
    networkAdapters: [],
  },
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function createBrowserWorkLogReport(date = todayKey()): WorkLogReport {
  return {
    date,
    totalScore: date === todayKey() ? 42 : 0,
    summary:
      date === todayKey()
        ? "浏览器预览数据：Tauri 运行后会基于真实硬件采样自动生成日志。"
        : "暂无足够数据：保持 CoreCat 运行后，将自动生成当天工作投入度。",
    activeSeconds: date === todayKey() ? 3600 : 0,
    sampleCount: date === todayKey() ? 60 : 0,
    dimensions: [
      {
        key: "duration",
        title: "CoreCat 运行时长",
        score: date === todayKey() ? 5 : 0,
        maxScore: 30,
        value: date === todayKey() ? "1.0h" : "0.0h",
        explanation: "按当日 CoreCat 连续在线与生产观察时长折算。",
        facts: [
          { label: "运行时长", value: date === todayKey() ? "1h 0m" : "0s" },
          { label: "采样记录", value: date === todayKey() ? "60 次" : "0 次" },
        ],
      },
      {
        key: "load",
        title: "硬件负载强度",
        score: date === todayKey() ? 12 : 0,
        maxScore: 25,
        value: "CPU 42% / RAM 60% / GPU 0%",
        explanation: "综合平均负载与 CPU>50%、RAM>70%、GPU>70% 的持续时长。",
        facts: [
          { label: "CPU>50%", value: "18m 0s" },
          { label: "RAM>70%", value: "6m 0s" },
          { label: "GPU>70%", value: "0s" },
        ],
      },
      {
        key: "complexity",
        title: "任务复杂度",
        score: date === todayKey() ? 7 : 0,
        maxScore: 20,
        value: "高负载 18% / IO 10%",
        explanation: "结合高负载比例、磁盘读写总量、网络上传与访问流量。",
        facts: [
          { label: "磁盘读", value: "320.0 MB" },
          { label: "磁盘写", value: "96.0 MB" },
          { label: "上传", value: "48.0 MB" },
          { label: "访问", value: "220.0 MB" },
        ],
      },
      {
        key: "stability",
        title: "运行稳定性",
        score: date === todayKey() ? 14 : 0,
        maxScore: 15,
        value: "压力 20%",
        explanation: "高温持续时间越短，说明高强度工作下系统越稳定。",
        facts: [
          { label: "CPU>80C", value: "0s" },
          { label: "GPU>80C", value: "0s" },
        ],
      },
      {
        key: "continuity",
        title: "连续工作投入",
        score: date === todayKey() ? 4 : 0,
        maxScore: 10,
        value: date === todayKey() ? "点击 420 / 按键 1680" : "点击 0 / 按键 0",
        explanation: "结合持续观察窗口、鼠标点击和键盘按键次数，体现实际操作密度。",
        facts: [
          { label: "鼠标点击", value: date === todayKey() ? "420 次" : "0 次" },
          { label: "键盘按键", value: date === todayKey() ? "1680 次" : "0 次" },
        ],
      },
    ],
  };
}

export async function getHardwareSnapshot(): Promise<HardwareSnapshot> {
  if (!isTauriRuntime()) {
    return { ...browserSnapshot, timestamp: Date.now() };
  }

  return invoke<HardwareSnapshot>("get_hardware_snapshot");
}

export async function getAppSettings(): Promise<AppSettings> {
  if (!isTauriRuntime()) {
    return { ...browserSettings };
  }

  return invoke<AppSettings>("get_app_settings");
}

export async function updateAppSettings(
  patch: AppSettingsPatch,
): Promise<AppSettings> {
  if (!isTauriRuntime()) {
    Object.assign(browserSettings, patch);
    return { ...browserSettings };
  }

  return invoke<AppSettings>("update_app_settings", { patch });
}

export async function getWorkshopState(): Promise<WorkshopState> {
  if (!isTauriRuntime()) {
    return browserWorkshop;
  }

  return invoke<WorkshopState>("get_workshop_state");
}

export async function rewardCoreCatInteraction(
  action: CoreCatInteractionAction,
): Promise<WorkshopState> {
  if (!isTauriRuntime()) {
    resetBrowserWorkshopDailyCounters();
    if (action === "pet") {
      browserWorkshop.insight += 0.01;
      browserWorkshop.todayInsight += 0.01;
    } else {
      browserWorkshop.parts += 0.1;
      browserWorkshop.todayParts += 0.1;
    }
    return { ...browserWorkshop };
  }

  return invoke<WorkshopState>("reward_corecat_interaction", { action });
}

export async function getWorkLogReport(date?: string): Promise<WorkLogReport> {
  if (!isTauriRuntime()) {
    return createBrowserWorkLogReport(date);
  }

  return invoke<WorkLogReport>("get_work_log_report", { date: date ?? null });
}

export async function toggleProductionPaused(): Promise<AppSettings> {
  return invoke<AppSettings>("toggle_production_paused");
}

export async function showMainWindow(): Promise<void> {
  return invoke("show_main_window");
}

export async function showMainRoute(route: MainRoute): Promise<void> {
  return invoke("show_main_route", { route });
}

export async function hideMainWindow(): Promise<void> {
  return invoke("hide_main_window");
}

export async function showPetWindow(): Promise<void> {
  return invoke("show_pet_window");
}

export async function hidePetWindow(): Promise<void> {
  return invoke("hide_pet_window");
}

export async function toggleMonitorBar(): Promise<void> {
  return invoke("toggle_monitor_bar");
}

export async function showMonitorBar(): Promise<void> {
  return invoke("show_monitor_bar");
}

export async function hideMonitorBar(): Promise<void> {
  return invoke("hide_monitor_bar");
}

export async function togglePetPanel(): Promise<void> {
  return invoke("toggle_pet_panel");
}

export async function showPetPanel(): Promise<void> {
  return invoke("show_pet_panel");
}

export async function hidePetPanel(): Promise<void> {
  return invoke("hide_pet_panel");
}

export async function saveWindowPosition(
  windowLabel: "pet" | "monitor-bar",
  x: number,
  y: number,
): Promise<AppSettings> {
  return invoke<AppSettings>("save_window_position", { windowLabel, x, y });
}

export async function exitApp(): Promise<void> {
  return invoke("exit_app");
}

export async function updateWorkshopState(
  workshop: WorkshopState,
): Promise<WorkshopState> {
  return invoke<WorkshopState>("update_workshop_state", { workshop });
}

function resetBrowserWorkshopDailyCounters() {
  const today = todayKey();
  if (browserWorkshop.lastDailyResetDate === today) {
    return;
  }

  browserWorkshop.todayParts = 0;
  browserWorkshop.todayInsight = 0;
  browserWorkshop.lastDailyResetDate = today;
}
