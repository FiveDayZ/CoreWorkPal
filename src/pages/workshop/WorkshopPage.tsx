import { useState } from "react";
import { emit } from "@tauri-apps/api/event";
import {
  formatBytes,
  formatBytesPerSecond,
  formatParts,
  formatPercent,
  formatTemperature,
} from "../../services/formatters";
import { useHardwareStore } from "../../stores/hardwareStore";
import { useSettingsStore } from "../../stores/settingsStore";
import { useWorkshopStore } from "../../stores/workshopStore";
import {
  normalizeModuleLevels,
  type ModuleUpgradeLevels,
  type WorkshopModuleKey,
} from "../../types/workshop";
import { moduleAssets } from "../../ui/assets";
import { playAudioFeedback } from "../../services/audioFeedback";
import type { CoreCatAnimationState } from "../../pet/corecat/animation/animationTypes";
import { PixelIcon } from "../../ui/PixelIcon";

interface ResourceCost {
  parts: number;
  insight: number;
}

interface ModuleData {
  key: WorkshopModuleKey;
  num: string;
  titleZh: string;
  titleEn: string;
  detail: string;
  metricLabel: string;
  metricVal: string;
  progress: number;
  statZh: string;
  statEn: string;
  partsRule: string;
  processRule: string;
}

const MAX_WORKSHOP_LEVEL = 100;
const MAX_MODULE_SUB_LEVEL = 100;

export function WorkshopPage() {
  const workshop = useWorkshopStore((store) => store.state);
  const saveWorkshopState = useWorkshopStore((store) => store.saveWorkshopState);
  const settings = useSettingsStore((state) => state.settings);
  const snapshot = useHardwareStore((state) => state.snapshot);
  const [selectedModuleKey, setSelectedModuleKey] =
    useState<WorkshopModuleKey | null>(null);

  const moduleLevels = normalizeModuleLevels(workshop?.moduleLevels);
  const currentLevel = workshop?.workshopLevel ?? 1;
  const currentParts = workshop?.parts ?? 0;
  const currentInsight = workshop?.insight ?? 0;
  const nextLevel = currentLevel + 1;
  const workshopCost = getWorkshopUpgradeCost(currentLevel);
  const isWorkshopMaxed = currentLevel >= MAX_WORKSHOP_LEVEL;
  const canUpgradeWorkshop =
    !isWorkshopMaxed &&
    currentParts >= workshopCost.parts &&
    currentInsight >= workshopCost.insight;
  const modules = buildModules(moduleLevels, snapshot, settings);
  const selectedModule =
    modules.find((module) => module.key === selectedModuleKey) ?? null;

  const handleUpgradeWorkshop = async () => {
    if (!canUpgradeWorkshop || !workshop) return;
    playAudioFeedback("meow", settings?.enableSound ?? false);
    await saveWorkshopState({
      ...workshop,
      parts: currentParts - workshopCost.parts,
      insight: currentInsight - workshopCost.insight,
      workshopLevel: nextLevel,
      moduleLevels,
    });
    void triggerCoreCatUpgradeAnimation("workshopUpgrade");
  };

  const handleSubUpgrade = async (type: "parts" | "process") => {
    if (!selectedModule || !workshop) return;

    const currentSubLevel = moduleLevels[selectedModule.key][type];
    if (currentSubLevel >= MAX_MODULE_SUB_LEVEL) {
      alert("该模块已达升级上限！");
      return;
    }
    const cost = getSubCost(currentSubLevel, type, currentLevel);
    if (currentParts < cost.parts || currentInsight < cost.insight) {
      alert("零件或灵感不足！");
      return;
    }

    playAudioFeedback("click", settings?.enableSound ?? false);
    const nextModuleLevels = {
      ...moduleLevels,
      [selectedModule.key]: {
        ...moduleLevels[selectedModule.key],
        [type]: currentSubLevel + 1,
      },
    };

    await saveWorkshopState({
      ...workshop,
      parts: currentParts - cost.parts,
      insight: currentInsight - cost.insight,
      moduleLevels: nextModuleLevels,
    });
    void triggerCoreCatUpgradeAnimation("moduleUpgrade");
  };

  return (
    <div className="cwp-page">
      <div className="page-title-row">
        <h2 className="page-title">迷你硬件工坊地图</h2>
      </div>

      <section className="cwp-workshop-grid">
        {modules.map((module) => {
          const levels = moduleLevels[module.key];
          const calculatedLevel = getModuleDisplayLevel(levels);

          return (
            <div
              className="cwp-module-card"
              key={module.key}
              onClick={() => setSelectedModuleKey(module.key)}
            >
              <img
                src={moduleAssets[module.key]}
                alt=""
                className="cwp-module-illust-bg"
              />
              <div className="cwp-module-header">
                <div className="cwp-module-meta">
                  <span className="cwp-module-num">{module.num}</span>
                  <span className="cwp-module-title-zh">{module.titleZh}</span>
                  <span className="cwp-module-title-en">{module.titleEn}</span>
                </div>
                <span className="cwp-module-badge">LV.{calculatedLevel}</span>
              </div>
              <div className="cwp-module-body">
                <div className="cwp-module-metrics">
                  <span>{module.metricLabel}</span>
                  {module.metricVal}
                </div>
              </div>
              <div className="cwp-module-footer">
                <div className="cwp-module-bar">
                  <div
                    className="cwp-module-bar-fill"
                    style={{ width: `${module.progress}%` }}
                  />
                </div>
                <div className="cwp-module-stat-row">
                  <span>{module.statZh}</span>
                  <span>{module.statEn}</span>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <div className="cwp-workshop-gains-panel">
        <div className="cwp-gains-column">
          <div className="cwp-gains-title">
            <PixelIcon name="settings" size={14} style={{ marginRight: "6px" }} /> 零件与灵感产出规则
          </div>
          <div className="cwp-gains-list">
            <GainItem label="CPU" value="负载驱动零件" />
            <GainItem label="GPU" value="渲染与显存仅转化零件" />
            <GainItem label="RAM" value="压力仅给零件" />
            <GainItem label="NET" value="吞吐仅带来灵感" />
            <GainItem label="TEMP" value="温度越稳惩罚越低" />
            <GainItem label="DISK" value="读写形成归档灵感" />
          </div>
        </div>
        <div
          className="cwp-gains-column"
          style={{
            borderLeft: "1px solid var(--color-border-soft)",
            paddingLeft: "10px",
          }}
        >
          <div className="cwp-gains-title">
            <PixelIcon name="energy" size={14} style={{ marginRight: "6px" }} /> 工坊升级增益
          </div>
          <div className="cwp-gains-desc">
            Level <strong>{currentLevel}</strong> 提供{" "}
            <strong>+{Math.round((currentLevel - 1) * 12)}%</strong>{" "}
            综合产能。模块的“零件强化”偏向产出，“工艺优化”偏向灵感与稳定。
          </div>
        </div>
      </div>

      <div className="cwp-workshop-upgrade-panel">
        <div className="cwp-upgrade-left">
          <div className="cwp-upgrade-stat">
            <span className="cwp-upgrade-stat-label">工坊等级</span>
            <span className="cwp-upgrade-stat-val">Level {currentLevel}</span>
          </div>
          <div className="cwp-upgrade-stat">
            <span className="cwp-upgrade-stat-label">升级零件</span>
            <span className="cwp-upgrade-stat-val">
              {formatParts(currentParts)} / {workshopCost.parts}
            </span>
          </div>
          <div className="cwp-upgrade-stat">
            <span className="cwp-upgrade-stat-label">升级灵感</span>
            <span className="cwp-upgrade-stat-val gold">
              {formatParts(currentInsight)} / {workshopCost.insight}
            </span>
          </div>
        </div>
        <button
          className={`cwp-upgrade-btn ${!canUpgradeWorkshop ? "disabled" : ""} ${isWorkshopMaxed ? "is-maxed" : ""}`}
          onClick={handleUpgradeWorkshop}
          disabled={!canUpgradeWorkshop}
          type="button"
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
        >
          <PixelIcon name="energy" size={14} /> {isWorkshopMaxed ? "已达上限" : "升级工坊"}
        </button>
      </div>

      {selectedModule && (
        <div className="cwp-workshop-detail-modal show">
          <div className="cwp-modal-header">
            <span className="cwp-modal-title">{selectedModule.titleZh} 强化</span>
            <button
              aria-label="Close Modal"
              onClick={() => setSelectedModuleKey(null)}
              type="button"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "18px",
                color: "var(--color-text-muted)",
              }}
            >
              ×
            </button>
          </div>
          <div className="cwp-modal-body">
            <div className="cwp-modal-illust">
              <img src={moduleAssets[selectedModule.key]} alt="" />
            </div>
            <p className="cwp-module-detail-copy">{selectedModule.detail}</p>
            <SubUpgradeRow
              cost={getSubCost(
                moduleLevels[selectedModule.key].parts,
                "parts",
                currentLevel,
              )}
              currentInsight={currentInsight}
              currentParts={currentParts}
              level={moduleLevels[selectedModule.key].parts}
              name="零件强化"
              onUpgrade={() => void handleSubUpgrade("parts")}
              rule={selectedModule.partsRule}
            />
            <SubUpgradeRow
              cost={getSubCost(
                moduleLevels[selectedModule.key].process,
                "process",
                currentLevel,
              )}
              currentInsight={currentInsight}
              currentParts={currentParts}
              level={moduleLevels[selectedModule.key].process}
              name="工艺优化"
              onUpgrade={() => void handleSubUpgrade("process")}
              rule={selectedModule.processRule}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function GainItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="cwp-gains-item">
      <span>{label}:</span>
      <strong>{value}</strong>
    </div>
  );
}

function SubUpgradeRow({
  cost,
  currentInsight,
  currentParts,
  level,
  name,
  onUpgrade,
  rule,
}: {
  cost: ResourceCost;
  currentInsight: number;
  currentParts: number;
  level: number;
  name: string;
  onUpgrade: () => void;
  rule: string;
}) {
  const isMaxed = level >= MAX_MODULE_SUB_LEVEL;
  const disabled = isMaxed || currentParts < cost.parts || currentInsight < cost.insight;
  return (
    <div className="cwp-sub-upgrade-row">
      <div className="cwp-sub-upgrade-info">
        <span className="cwp-sub-upgrade-name">{name}</span>
        <span className="cwp-sub-upgrade-level">
          {isMaxed ? `LV.${level} (已达上限)` : `LV.${level} → LV.${level + 1}`}
        </span>
        <span className="cwp-sub-upgrade-rule">{rule}</span>
      </div>
      <button
        className={`cwp-sub-upgrade-btn ${isMaxed ? "is-maxed" : ""}`}
        disabled={disabled}
        onClick={onUpgrade}
        type="button"
      >
        {isMaxed ? "已达上限" : formatCost(cost)}
      </button>
    </div>
  );
}

function buildModules(
  levels: ReturnType<typeof normalizeModuleLevels>,
  snapshot: ReturnType<typeof useHardwareStore.getState>["snapshot"],
  settings: ReturnType<typeof useSettingsStore.getState>["settings"],
): ModuleData[] {
  const cpu = snapshot?.cpuUsagePercent ?? null;
  const gpu = snapshot?.gpuUsagePercent ?? null;
  const ram = snapshot?.memoryUsagePercent ?? null;
  const networkBytes =
    (snapshot?.networkDownloadBytesPerSecond ?? 0) +
    (snapshot?.networkUploadBytesPerSecond ?? 0);
  const diskBytes =
    (snapshot?.diskReadBytesPerSecond ?? 0) +
    (snapshot?.diskWriteBytesPerSecond ?? 0);
  const cpuTemp = snapshot?.cpuTemperatureCelsius ?? null;
  const gpuTemp = snapshot?.gpuTemperatureCelsius ?? null;
  const maxTemp = Math.max(cpuTemp ?? 0, gpuTemp ?? 0);
  const tempWarning = Math.max(
    settings?.cpuTemperatureWarning ?? 80,
    settings?.gpuTemperatureWarning ?? 82,
  );

  return [
    {
      key: "cpu",
      num: "MOD-01",
      titleZh: "核心工作台",
      titleEn: "CPU Workbench",
      detail: "CPU 负载越高，基础零件加工越活跃；过热会触发稳定惩罚。",
      metricLabel: "CPU 负载",
      metricVal: formatPercent(cpu),
      progress: percentProgress(cpu),
      statZh: cpu != null && cpu > 85 ? "状态: 高负载" : "状态: 良好",
      statEn: `零件 +${moduleBonus(levels.cpu, 5.0, 2.5)}%`,
      partsRule: "提升 CPU 对零件产出的转化率。",
      processRule: "降低高负载下的产出抖动。",
    },
    {
      key: "gpu",
      num: "MOD-02",
      titleZh: "图形渲染平台",
      titleEn: "GPU Graphic Bench",
      detail: "GPU 负载和显存占用会把渲染工作转化为零件产出。",
      metricLabel: "GPU / 显存",
      metricVal: formatGpuMetric(snapshot),
      progress: percentProgress(gpu),
      statZh: gpu != null && gpu > 75 ? "状态: 渲染中" : "状态: 待命",
      statEn: `零件 +${moduleBonus(levels.gpu, 4.0, 2.0)}%`,
      partsRule: "提高渲染平台对零件打磨的辅助效率。",
      processRule: "提高 GPU 对零件的产出率。",
    },
    {
      key: "ram",
      num: "MOD-03",
      titleZh: "零件仓储仓库",
      titleEn: "RAM Parts Warehouse",
      detail: "内存压力代表仓储吞吐，仅产生零件产出。",
      metricLabel: "内存占用",
      metricVal: formatMemoryMetric(snapshot),
      progress: percentProgress(ram),
      statZh:
        ram != null && ram > (settings?.memoryCrowdedThreshold ?? 82)
          ? "状态: 拥挤"
          : "状态: 良好",
      statEn: `零件 +${moduleBonus(levels.ram, 4.5, 2.0)}%`,
      partsRule: "扩大零件仓储吞吐，提升 RAM 对产出的贡献。",
      processRule: "缓解内存拥挤惩罚，保持产出稳定。",
    },
    {
      key: "network",
      num: "MOD-04",
      titleZh: "数据网络传输站",
      titleEn: "Net Transfer Station",
      detail: "网络下载/上传越活跃，仅产生灵感产出。",
      metricLabel: "网络吞吐",
      metricVal: `${formatBytesPerSecond(snapshot?.networkDownloadBytesPerSecond ?? null)} / ${formatBytesPerSecond(snapshot?.networkUploadBytesPerSecond ?? null)}`,
      progress: throughputProgress(networkBytes),
      statZh: networkBytes > 1024 * 1024 ? "状态: 流畅" : "状态: 低流量",
      statEn: `灵感 +${moduleBonus(levels.network, 3.6, 7.2)}%`,
      partsRule: "提升网络物流对灵感获取的贡献。",
      processRule: "提升网络蓝图交换带来的灵感。",
    },
    {
      key: "temperature",
      num: "MOD-05",
      titleZh: "温度冷却风扇墙",
      titleEn: "Temp Cooling Wall",
      detail: "温度越接近警戒线，稳定惩罚越明显；冷却升级会抵消惩罚。",
      metricLabel: "核心温度",
      metricVal: formatTemperature(maxTemp > 0 ? maxTemp : null),
      progress: clamp((maxTemp / tempWarning) * 100, 0, 100),
      statZh: maxTemp > tempWarning ? "状态: 过热" : "状态: 安全",
      statEn: `稳定 +${moduleBonus(levels.temperature, 2.0, 3.5)}%`,
      partsRule: "提升散热组件耐久，减少零件产出损耗。",
      processRule: "降低温度惩罚，保持灵感稳定。",
    },
    {
      key: "disk",
      num: "MOD-06",
      titleZh: "硬盘数据归档柜",
      titleEn: "Disk Archive Cabinet",
      detail: "磁盘读写会形成归档作业，仅贡献灵感。",
      metricLabel: "磁盘读写",
      metricVal: `${formatBytesPerSecond(snapshot?.diskReadBytesPerSecond ?? null)} / ${formatBytesPerSecond(snapshot?.diskWriteBytesPerSecond ?? null)}`,
      progress: throughputProgress(diskBytes),
      statZh: diskBytes > 1024 * 1024 ? "状态: 归档中" : "状态: 安静",
      statEn: `灵感 +${moduleBonus(levels.disk, 3.2, 5.6)}%`,
      partsRule: "提高归档读写对灵感整理的收益。",
      processRule: "提升数据归档带来的灵感回收。",
    },
  ];
}

function getWorkshopUpgradeCost(level: number): ResourceCost {
  return {
    parts: Math.round(level * 300 + Math.pow(level, 1.7) * 80),
    insight: Math.round(level * 10 + Math.pow(level, 1.6) * 8),
  };
}

function getSubCost(
  level: number,
  type: "parts" | "process",
  workshopLevel: number,
): ResourceCost {
  const safeLevel = Math.max(1, level);
  if (type === "parts") {
    return {
      parts: Math.round(80 + safeLevel * 60 + workshopLevel * 30 + Math.pow(safeLevel, 1.8) * 12),
      insight: Math.max(0, Math.floor((safeLevel - 1) * 1.5)),
    };
  }

  return {
    parts: Math.round(100 + safeLevel * 70 + workshopLevel * 28 + Math.pow(safeLevel, 1.9) * 15),
    insight: Math.max(1, Math.ceil(safeLevel * 1.8)),
  };
}

function getModuleDisplayLevel(levels: ModuleUpgradeLevels) {
  return Math.max(1, Math.floor((levels.parts + levels.process) / 2));
}

function moduleBonus(levels: ModuleUpgradeLevels, partsWeight: number, processWeight: number) {
  return Math.round(
    Math.max(0, levels.parts - 1) * partsWeight +
      Math.max(0, levels.process - 1) * processWeight,
  );
}

function formatCost(cost: ResourceCost): React.ReactNode {
  if (cost.insight > 0) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
        升级 <PixelIcon name="wrench" size={12} style={{ color: "var(--color-brand-orange-strong)" }} />
        {cost.parts} / <PixelIcon name="sparkle" size={12} style={{ color: "var(--color-insight-gold)", marginLeft: "4px" }} />
        {cost.insight}
      </span>
    );
  }
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
      升级 <PixelIcon name="wrench" size={12} style={{ color: "var(--color-brand-orange-strong)" }} />
      {cost.parts}
    </span>
  );
}

function formatMemoryMetric(
  snapshot: ReturnType<typeof useHardwareStore.getState>["snapshot"],
) {
  if (snapshot?.usedMemoryBytes != null && snapshot.totalMemoryBytes != null) {
    return `${formatBytes(snapshot.usedMemoryBytes)} / ${formatBytes(snapshot.totalMemoryBytes)}`;
  }

  return formatPercent(snapshot?.memoryUsagePercent ?? null);
}

function formatGpuMetric(
  snapshot: ReturnType<typeof useHardwareStore.getState>["snapshot"],
) {
  if (snapshot?.gpuMemoryUsedBytes != null && snapshot.gpuMemoryTotalBytes != null) {
    return `${formatPercent(snapshot.gpuUsagePercent)} / ${formatBytes(snapshot.gpuMemoryUsedBytes)}`;
  }

  return formatPercent(snapshot?.gpuUsagePercent ?? null);
}

function percentProgress(value: number | null | undefined) {
  return clamp(value ?? 0, 0, 100);
}

function throughputProgress(bytesPerSecond: number) {
  const mib = Math.max(0, bytesPerSecond) / 1024 / 1024;
  return clamp((Math.log1p(mib) / Math.log1p(64)) * 100, 0, 100);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
}

async function triggerCoreCatUpgradeAnimation(state: CoreCatAnimationState) {
  if (typeof window === "undefined" || !("__TAURI_INTERNALS__" in window)) {
    return;
  }

  await emit("corecat:interaction-state", state);
}
