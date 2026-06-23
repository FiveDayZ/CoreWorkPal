import { invoke } from "@tauri-apps/api/core";
import type { MainRoute } from "../routeTypes";
import type {
  DailyWorkAssessment,
  DailyWorkAssessmentSummary,
  DailyWorkAssessmentTrend,
} from "../types/dailyWorkAssessment";
import type { HardwareSnapshot } from "../types/hardware";
import type { AppSettings, AppSettingsPatch } from "../types/settings";
import type { WorkLogReport } from "../types/workLog";
import { defaultModuleLevels, type WorkshopState } from "../types/workshop";

export type CoreCatInteractionAction = "pet" | "sortParts";

function isTauriRuntime() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

const browserSettings: AppSettings = {
  schemaVersion: 2,
  launchAtStartup: false,
  isCatVisible: true,
  isMonitorBarVisible: false,
  enableSleepMode: true,
  enableSound: false,
  enableNotifications: false,
  isProductionPaused: false,
  enableLowPowerMode: false,
  enableStaticCatMode: false,
  enablePetBubble: true,
  showMonitorDataInTaskbar: false,
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
  catId: "DEV_CAT_ID",
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

function relativeDateKey(offsetDays: number) {
  const date = new Date();
  date.setDate(date.getDate() - offsetDays);
  return date.toISOString().slice(0, 10);
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

function createBrowserDailyWorkAssessment(date = todayKey()): DailyWorkAssessment {
  const report = createBrowserWorkLogReport(date);
  const isToday = date === todayKey();

  return {
    date,
    dayType: isToday ? "stableMaintenance" : "unknown",
    dayTypeTitle: isToday ? "平稳维护日" : "数据积累中",
    score: report.totalScore,
    corecatSummary: isToday
      ? "浏览器预览数据：CoreCat 会在 Tauri 运行后根据真实硬件与键鼠节奏生成每日工作画像。"
      : "这一天暂时没有足够的本地采样数据，CoreCat 还无法形成可靠画像。",
    badgeIds: isToday ? ["STEADY", "OBSERVE"] : ["OBSERVE"],
    workprint: {
      label: isToday ? "平稳维护型" : "数据积累中",
      description: isToday
        ? "今日 Workprint 呈现为平稳维护型：负载适中，输入节奏和 IO 活动都处于预览水平。"
        : "这一天的数据还不足以形成稳定指纹。",
      pixelGrid: [
        1, 1, 2, 2, 0, 0, 0, 0,
        1, 2, 2, 2, 0, 0, 0, 0,
        1, 1, 1, 0, 0, 0, 0, 0,
        1, 1, 0, 0, 0, 0, 0, 0,
        1, 2, 2, 1, 0, 0, 0, 0,
        1, 1, 2, 1, 0, 0, 0, 0,
        1, 2, 1, 2, 0, 0, 0, 0,
        1, 1, 2, 2, 0, 0, 0, 0,
      ],
      width: 8,
      height: 8,
      loadShape: isToday ? 0.42 : 0,
      inputRhythm: isToday ? 0.36 : 0,
      ioIntensity: isToday ? 0.28 : 0,
      thermalPressure: isToday ? 0.12 : 0,
      continuity: isToday ? 0.44 : 0,
    },
    baseline: {
      sampleDays: 0,
      activeSecondsDeltaRatio: 0,
      loadDeltaRatio: 0,
      ioDeltaRatio: 0,
      thermalDeltaRatio: 0,
      inputDeltaRatio: 0,
      summary: "浏览器预览暂不包含历史基线；Tauri 运行几天后会生成近 7 日对比。",
    },
    timeline: isToday
      ? [
          {
            startTime: "09:00",
            endTime: "10:15",
            kind: "steadyProgress",
            intensity: 0.42,
            label: "稳定推进",
            description: "预览片段：系统负载和输入节奏比较平稳。",
          },
          {
            startTime: "10:15",
            endTime: "10:45",
            kind: "buildPeak",
            intensity: 0.68,
            label: "构建高峰",
            description: "预览片段：CPU 和磁盘活动同时抬升。",
          },
          {
            startTime: "10:45",
            endTime: "11:30",
            kind: "archiveFlow",
            intensity: 0.5,
            label: "资料归档",
            description: "预览片段：磁盘和网络流动较明显。",
          },
        ]
      : [],
    highlights: [
      {
        title: "CoreCat 已准备记录节奏",
        body: "真实运行后，这里会展示今天最有代表性的工作片段。",
        severity: "positive",
        metricValue: isToday ? "Preview" : null,
      },
    ],
    risks: [
      {
        title: "暂无明显隐患",
        body: "浏览器预览没有真实温度和内存压力数据，正式运行后会按本机采样判断。",
        severity: "neutral",
        metricValue: null,
      },
    ],
    suggestions: [
      {
        title: "保持 CoreCat 常驻",
        body: "让 CoreCat 安静观察一段时间后，每日工况报告会更贴近你的实际工作节奏。",
        severity: "neutral",
        metricValue: null,
      },
    ],
    dimensions: report.dimensions.map((dimension) => ({
      ...dimension,
      title: mapAssessmentDimensionTitle(dimension.key, dimension.title),
    })),
  };
}

function createBrowserDailyWorkAssessmentHistory(
  limit = 14,
): DailyWorkAssessmentSummary[] {
  const summaries: DailyWorkAssessmentSummary[] = [
    {
      date: relativeDateKey(0),
      dayType: "stableMaintenance",
      dayTypeTitle: "平稳维护日",
      score: 42,
      corecatSummary: "今天的预览画像偏平稳：有持续观察，也有几段轻量推进。",
      badgeIds: ["STEADY", "OBSERVE"],
      hasTimeline: true,
      hasData: true,
    },
    {
      date: relativeDateKey(1),
      dayType: "buildBurst",
      dayTypeTitle: "编译构建日",
      score: 78,
      corecatSummary: "昨天出现过更明显的 CPU 与磁盘高峰，像是一段集中构建窗口。",
      badgeIds: ["BUILD", "HEAT"],
      hasTimeline: true,
      hasData: true,
    },
    {
      date: relativeDateKey(2),
      dayType: "deepFocus",
      dayTypeTitle: "深度工作日",
      score: 84,
      corecatSummary: "长时间稳定输入，压力适中，更像专注推进的一天。",
      badgeIds: ["FOCUS", "FLOW"],
      hasTimeline: true,
      hasData: true,
    },
    {
      date: relativeDateKey(3),
      dayType: "unknown",
      dayTypeTitle: "未形成画像",
      score: 0,
      corecatSummary: "这一天没有足够的预览采样，历史墙会以灰态保留这个空日期。",
      badgeIds: ["EMPTY"],
      hasTimeline: false,
      hasData: false,
    },
    {
      date: relativeDateKey(4),
      dayType: "lowLoadCompanion",
      dayTypeTitle: "低负载陪伴日",
      score: 24,
      corecatSummary: "这天记录较轻，适合和高投入日期放在一起对照节奏变化。",
      badgeIds: ["LIGHT", "OBSERVE"],
      hasTimeline: false,
      hasData: true,
    },
  ];

  return summaries.slice(0, Math.max(1, limit));
}

function createBrowserDailyWorkAssessmentTrend(
  limit = 14,
): DailyWorkAssessmentTrend {
  const summaries = createBrowserDailyWorkAssessmentHistory(limit).filter(
    (item) => item.hasData,
  );
  const scoreSum = summaries.reduce((sum, item) => sum + item.score, 0);
  const averageScore = Math.round(scoreSum / Math.max(1, summaries.length));
  const best = summaries.reduce((current, item) =>
    item.score > current.score ? item : current,
  );
  const newestScore = summaries[0]?.score ?? 0;
  const oldestScore = summaries[summaries.length - 1]?.score ?? newestScore;
  const scoreDelta = newestScore - oldestScore;
  const timelineDays = summaries.filter((item) => item.hasTimeline).length;
  const dominantDayType = summaries[0]?.dayType ?? "unknown";
  const dominantDayTypeTitle = summaries[0]?.dayTypeTitle ?? "数据积累中";

  return {
    sampleDays: summaries.length,
    averageScore,
    bestDate: best?.date ?? null,
    bestScore: best?.score ?? null,
    bestDayType: best?.dayType ?? "unknown",
    bestDayTypeTitle: best?.dayTypeTitle ?? "数据积累中",
    dominantDayType,
    dominantDayTypeTitle,
    timelineDays,
    scoreDelta,
    summary:
      summaries.length > 0
        ? `浏览器预览：近 ${summaries.length} 个有记录日里，平均画像分 ${averageScore}，最常见的是${dominantDayTypeTitle}。`
        : "CoreCat 还没有足够的历史日报来判断近期节奏。",
    insights: [
      {
        title: "近期主导形态",
        body: `预览数据里最常见的是${dominantDayTypeTitle}，正式运行后会按真实历史计算。`,
        severity: "positive",
        metricValue: dominantDayTypeTitle,
      },
      {
        title: "最高画像日",
        body: best
          ? `${best.date} 的预览画像分最高，为 ${best.score} 分。`
          : "暂无可比较日期。",
        severity: "positive",
        metricValue: best ? `${best.score} 分` : null,
      },
      {
        title: "节奏线覆盖",
        body: `当前预览中有 ${timelineDays}/${summaries.length} 天带有节奏线。`,
        severity: "neutral",
        metricValue: `${timelineDays}/${summaries.length} 天`,
      },
    ],
  };
}

function mapAssessmentDimensionTitle(key: string, fallback: string) {
  switch (key) {
    case "duration":
      return "陪伴时长";
    case "load":
      return "工坊火力";
    case "complexity":
      return "蓝图复杂度";
    case "stability":
      return "机器健康";
    case "continuity":
      return "专注节奏";
    default:
      return fallback;
  }
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

export async function getDailyWorkAssessment(
  date?: string,
): Promise<DailyWorkAssessment> {
  if (!isTauriRuntime()) {
    return createBrowserDailyWorkAssessment(date);
  }

  return invoke<DailyWorkAssessment>("get_daily_work_assessment", {
    date: date ?? null,
  });
}

export async function getDailyWorkAssessmentHistory(
  limit?: number,
): Promise<DailyWorkAssessmentSummary[]> {
  if (!isTauriRuntime()) {
    return createBrowserDailyWorkAssessmentHistory(limit);
  }

  return invoke<DailyWorkAssessmentSummary[]>(
    "get_daily_work_assessment_history",
    {
      limit: limit ?? null,
    },
  );
}

export async function getDailyWorkAssessmentTrend(
  limit?: number,
): Promise<DailyWorkAssessmentTrend> {
  if (!isTauriRuntime()) {
    return createBrowserDailyWorkAssessmentTrend(limit);
  }

  return invoke<DailyWorkAssessmentTrend>("get_daily_work_assessment_trend", {
    limit: limit ?? null,
  });
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

import type { UpdateCheckResult } from "../types/update";

export async function checkUpdate(pat?: string): Promise<UpdateCheckResult> {
  if (!isTauriRuntime()) {
    return {
      hasUpdate: true,
      currentVersion: "0.1.0",
      latestVersion: "1.1.0",
      changelog: "### 更新日志\n- [优化] 提升了桌面猫咪动画运行效率\n- [修复] 解决任务栏嵌入在某些分辨率下的偏移问题",
      downloadUrl: "https://mock.com/core-work-pal_1.1.0_x64-setup.exe",
      assetId: 12345,
      assetSize: 15420100,
      assetName: "core-work-pal_1.1.0_x64-setup.exe",
    };
  }

  return invoke<UpdateCheckResult>("check_update", { pat });
}

export async function downloadUpdate(
  assetId: number,
  assetName: string,
  pat?: string,
): Promise<string> {
  if (!isTauriRuntime()) {
    return "C:\\MockPath\\core-work-pal_1.1.0_x64-setup.exe";
  }

  return invoke<string>("download_update", { assetId, assetName, pat });
}

export async function installUpdate(packagePath: string): Promise<void> {
  if (!isTauriRuntime()) {
    alert(`Mock安装：已经启动安装程序 ${packagePath}`);
    return;
  }

  return invoke<void>("install_update", { packagePath });
}
