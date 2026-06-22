import { useState } from "react";
import {
  formatBytes,
  formatBytesPerSecond,
  formatDuration,
  formatParts,
  formatPercent,
  formatTemperature,
} from "../../services/formatters";
import { useHardwareStore } from "../../stores/hardwareStore";
import { usePetStore } from "../../stores/petStore";
import { useSettingsStore } from "../../stores/settingsStore";
import { useWorkshopStore } from "../../stores/workshopStore";
import { useThemedIcons } from "../../ui/assets";
import { playAudioFeedback } from "../../services/audioFeedback";
import { calculateSystemStability } from "../../services/systemStability";
import { PixelIcon } from "../../ui/PixelIcon";

export function DashboardPage() {
  const snapshot = useHardwareStore((state) => state.snapshot);
  const workshop = useWorkshopStore((state) => state.state);
  const settings = useSettingsStore((state) => state.settings);
  const catState = usePetStore((state) => state.catState);
  const catMessage = usePetStore((state) => state.catMessage);
  const icons = useThemedIcons();

  const [localBubble, setLocalBubble] = useState<string | null>(null);

  // Helper to get cat status text and light tone
  const getCatStatusText = () => {
    switch (catState) {
      case "Idle":
        return "Idle 闲置中";
      case "RepairLight":
        return "Repair 微调中";
      case "RepairHeavy":
        return "Repair 紧急抢修";
      case "TemperatureCheck":
        return "Cooling 冷却降温";
      case "MemoryCrowded":
        return "Storage 零件整理";
      case "DataSorting":
        return "Sorting 归档传输";
      case "Sleep":
        return "Sleep 睡眠休眠";
      case "Celebrate":
        return "Level Up 庆祝";
      default:
        return "Companion 陪伴中";
    }
  };

  const handlePetCat = () => {
    playAudioFeedback("meow", settings?.enableSound ?? false);
    setLocalBubble("喵呜~ 今天也要加油工作呀！");
    setTimeout(() => setLocalBubble(null), 3000);
  };

  const handleCleanParts = () => {
    playAudioFeedback("click", settings?.enableSound ?? false);
    setLocalBubble("工坊运转正常，我守着呢。");
    setTimeout(() => setLocalBubble(null), 3000);
  };

  const cpuVal = snapshot?.cpuUsagePercent ?? 0;
  const { label: cpuBadge, className: cpuClass } = loadBadge(
    snapshot?.cpuUsagePercent ?? null,
    50,
    80,
    ["稳定", "繁忙", "过载"],
  );

  const gpuVal = snapshot?.gpuUsagePercent ?? 0;
  const { label: gpuBadge, className: gpuClass } = loadBadge(
    snapshot?.gpuUsagePercent ?? null,
    50,
    80,
    ["清凉", "活跃", "超载"],
  );

  const ramVal = snapshot?.memoryUsagePercent ?? 0;
  const { label: ramBadge, className: ramClass } = loadBadge(
    snapshot?.memoryUsagePercent ?? null,
    60,
    82,
    ["充沛", "偏高", "紧张"],
  );

  const tempVal = snapshot?.cpuTemperatureCelsius ?? null;
  const tempLevel = tempVal ?? 0;
  const { label: tempBadge, className: tempClass } = loadBadge(
    tempVal,
    55,
    75,
    ["安全", "预警", "高温"],
  );

  const gpuMemoryText = formatMemoryUsage(
    snapshot?.gpuMemoryUsedBytes ?? null,
    snapshot?.gpuMemoryTotalBytes ?? null,
  );
  const ramMemoryText = formatMemoryUsage(
    snapshot?.usedMemoryBytes ?? null,
    snapshot?.totalMemoryBytes ?? null,
  );
  const networkLevel = rateLevel(snapshot?.networkDownloadBytesPerSecond ?? null);
  const diskLevel = rateLevel(
    (snapshot?.diskReadBytesPerSecond ?? 0) + (snapshot?.diskWriteBytesPerSecond ?? 0),
  );

  // Calculate dynamic multipliers from current hardware usage
  const activity = (cpuVal * 0.7 + ramVal * 0.3) / 100;
  const efficiency = Math.min(1.8, Math.max(0.8, 0.8 + activity));
  const stability = calculateSystemStability(snapshot, settings);

  return (
    <div className="cwp-page">
      <div className="page-title-row">
        <h2 className="page-title">工坊控制台</h2>
      </div>

      <div className="cwp-dashboard-grid">
        {/* Left Hero Card */}
        <div className="cwp-hero-card">
          <div className="cwp-hero-base-light" />
          <div className="cwp-hero-speech-container">
            <div className="cwp-hero-bubble">
              {localBubble || catMessage || "正在全力监控您的工作区..."}
            </div>
          </div>
          <div className="cwp-hero-pet-canvas">
            <img
              src={icons.corecatAvatar}
              alt="Hero Companion"
              className="cwp-hero-pet-img"
            />
          </div>
          <div className="cwp-hero-status-row">
            <span>当前状态:</span>
            <span className="cwp-hero-status-tag">{getCatStatusText()}</span>
          </div>
          <div className="cwp-hero-quick-actions">
            <button className="cwp-hero-btn" onClick={handlePetCat} type="button">
              抚摸猫咪
            </button>
            <button className="cwp-hero-btn" onClick={handleCleanParts} type="button">
              整理零件
            </button>
          </div>
        </div>

        {/* Right 6 Metric Cards */}
        <div className="cwp-metric-grid">
          {/* CPU */}
          <div className="cwp-metric-card-new">
            <div className="cwp-card-top">
              <div className="cwp-card-title-grp">
                <span className="cwp-card-title-zh">CPU 核心工作台</span>
                <span className="cwp-card-title-en">CPU Workbench</span>
              </div>
              <div className="cwp-card-icon-container" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}><PixelIcon name="cpu" size={16} /></div>
            </div>
            <div className="cwp-card-mid">
              <span className="cwp-card-val">{formatPercent(snapshot?.cpuUsagePercent ?? null)}</span>
              <span className={`cwp-card-badge ${cpuClass}`}>{cpuBadge}</span>
            </div>
            <div className="cwp-card-bottom">
              <div className="cwp-card-progress-bar">
                <div className="cwp-card-progress-fill" style={{ width: `${cpuVal}%` }} />
              </div>
              <div className="cwp-card-subtext">
                <span>温度: {formatTemperature(snapshot?.cpuTemperatureCelsius ?? null)}</span>
                <span>线程活跃</span>
              </div>
            </div>
          </div>

          {/* GPU */}
          <div className="cwp-metric-card-new">
            <div className="cwp-card-top">
              <div className="cwp-card-title-grp">
                <span className="cwp-card-title-zh">GPU 渲染流水线</span>
                <span className="cwp-card-title-en">GPU Graphic Bench</span>
              </div>
              <div className="cwp-card-icon-container" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}><PixelIcon name="gpu" size={16} /></div>
            </div>
            <div className="cwp-card-mid">
              <span className="cwp-card-val">{formatPercent(snapshot?.gpuUsagePercent ?? null)}</span>
              <span className={`cwp-card-badge ${gpuClass}`}>{gpuBadge}</span>
            </div>
            <div className="cwp-card-bottom">
              <div className="cwp-card-progress-bar">
                <div className="cwp-card-progress-fill" style={{ width: `${gpuVal}%` }} />
              </div>
              <div className="cwp-card-subtext">
                <span>显存: {gpuMemoryText}</span>
                <span>温度: {formatTemperature(snapshot?.gpuTemperatureCelsius ?? null)}</span>
              </div>
            </div>
          </div>

          {/* RAM */}
          <div className="cwp-metric-card-new">
            <div className="cwp-card-top">
              <div className="cwp-card-title-grp">
                <span className="cwp-card-title-zh">RAM 零件仓库</span>
                <span className="cwp-card-title-en">RAM Parts Warehouse</span>
              </div>
              <div className="cwp-card-icon-container" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}><PixelIcon name="ram" size={16} /></div>
            </div>
            <div className="cwp-card-mid">
              <span className="cwp-card-val">{formatPercent(snapshot?.memoryUsagePercent ?? null)}</span>
              <span className={`cwp-card-badge ${ramClass}`}>{ramBadge}</span>
            </div>
            <div className="cwp-card-bottom">
              <div className="cwp-card-progress-bar">
                <div className="cwp-card-progress-fill" style={{ width: `${ramVal}%` }} />
              </div>
              <div className="cwp-card-subtext">
                <span>内存: {ramMemoryText}</span>
                <span>缓存就绪</span>
              </div>
            </div>
          </div>

          {/* NET */}
          <div className="cwp-metric-card-new">
            <div className="cwp-card-top">
              <div className="cwp-card-title-grp">
                <span className="cwp-card-title-zh">NET 数据传输站</span>
                <span className="cwp-card-title-en">Net Transfer Station</span>
              </div>
              <div className="cwp-card-icon-container" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}><PixelIcon name="energy" size={16} /></div>
            </div>
            <div className="cwp-card-mid">
              <span className="cwp-card-val">
                {formatBytesPerSecond(snapshot?.networkDownloadBytesPerSecond ?? null)}
              </span>
              <span className="cwp-card-badge cwp-badge-normal">流畅</span>
            </div>
            <div className="cwp-card-bottom">
              <div className="cwp-card-progress-bar">
                <div className="cwp-card-progress-fill" style={{ width: `${networkLevel}%` }} />
              </div>
              <div className="cwp-card-subtext">
                <span>上传: {formatBytesPerSecond(snapshot?.networkUploadBytesPerSecond ?? null)}</span>
                <span>下载: {formatBytesPerSecond(snapshot?.networkDownloadBytesPerSecond ?? null)}</span>
              </div>
            </div>
          </div>

          {/* TEMP */}
          <div className="cwp-metric-card-new">
            <div className="cwp-card-top">
              <div className="cwp-card-title-grp">
                <span className="cwp-card-title-zh">TEMP 冷却风扇墙</span>
                <span className="cwp-card-title-en">Temp Cooling Wall</span>
              </div>
              <div className="cwp-card-icon-container" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}><PixelIcon name="temp" size={16} /></div>
            </div>
            <div className="cwp-card-mid">
              <span className="cwp-card-val">{formatTemperature(snapshot?.cpuTemperatureCelsius ?? null)}</span>
              <span className={`cwp-card-badge ${tempClass}`}>{tempBadge}</span>
            </div>
            <div className="cwp-card-bottom">
              <div className="cwp-card-progress-bar">
                <div className="cwp-card-progress-fill" style={{ width: `${clampPercent(tempLevel)}%`, background: "var(--color-brand-orange)" }} />
              </div>
              <div className="cwp-card-subtext">
                <span>CPU: {formatTemperature(snapshot?.cpuTemperatureCelsius ?? null)}</span>
                <span>GPU: {formatTemperature(snapshot?.gpuTemperatureCelsius ?? null)}</span>
              </div>
            </div>
          </div>

          {/* DISK */}
          <div className="cwp-metric-card-new">
            <div className="cwp-card-top">
              <div className="cwp-card-title-grp">
                <span className="cwp-card-title-zh">DISK 数据归档柜</span>
                <span className="cwp-card-title-en">Disk Archive Cabinet</span>
              </div>
              <div className="cwp-card-icon-container" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}><PixelIcon name="disk" size={16} /></div>
            </div>
            <div className="cwp-card-mid">
              <span className="cwp-card-val">62%</span>
              <span className="cwp-card-badge cwp-badge-normal">宽敞</span>
            </div>
            <div className="cwp-card-bottom">
              <div className="cwp-card-progress-bar">
                <div className="cwp-card-progress-fill" style={{ width: `${diskLevel}%` }} />
              </div>
              <div className="cwp-card-subtext">
                <span>读取: {formatBytesPerSecond(snapshot?.diskReadBytesPerSecond ?? null)}</span>
                <span>写入: {formatBytesPerSecond(snapshot?.diskWriteBytesPerSecond ?? null)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Output Strip */}
      <div className="cwp-output-strip">
        <div className="cwp-output-card">
          <div className="cwp-output-icon" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}><PixelIcon name="wrench" size={18} /></div>
          <div className="cwp-output-info">
            <span className="cwp-output-title">今日零件</span>
            <span className="cwp-output-val">{formatParts(workshop?.todayParts ?? 0)}</span>
          </div>
        </div>
        <div className="cwp-output-card">
          <div className="cwp-output-icon" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}><PixelIcon name="lightbulb" size={18} /></div>
          <div className="cwp-output-info">
            <span className="cwp-output-title">今日灵感</span>
            <span className="cwp-output-val">{formatParts(workshop?.todayInsight ?? 0)}</span>
          </div>
        </div>
        <div className="cwp-output-card">
          <div className="cwp-output-icon" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}><PixelIcon name="energy" size={18} /></div>
          <div className="cwp-output-info">
            <span className="cwp-output-title">工坊效率</span>
            <span className="cwp-output-val">x{efficiency.toFixed(1)}</span>
            <span className="cwp-output-sub">{efficiency > 1.2 ? "高效运行" : "常态运行"}</span>
          </div>
        </div>
        <div className="cwp-output-card" title={stability.detail}>
          <div className="cwp-output-icon" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}><PixelIcon name="shield" size={18} /></div>
          <div className="cwp-output-info">
            <span className="cwp-output-title">系统稳定度</span>
            <span className={`cwp-output-val is-${stability.tone}`}>
              {stability.score}%
            </span>
            <span className="cwp-output-sub is-visible">{stability.label}</span>
          </div>
        </div>
        <div className="cwp-output-card">
          <div className="cwp-output-icon" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}><PixelIcon name="clock" size={18} /></div>
          <div className="cwp-output-info">
            <span className="cwp-output-title">猫咪在线</span>
            <span className="cwp-output-val">{formatDuration(workshop?.totalOnlineSeconds ?? 0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function loadBadge(
  value: number | null,
  warningThreshold: number,
  dangerThreshold: number,
  labels: [normal: string, warning: string, danger: string],
) {
  if (value == null) {
    return { className: "cwp-badge-normal", label: "待机" };
  }

  if (value > dangerThreshold) {
    return { className: "cwp-badge-danger", label: labels[2] };
  }

  if (value > warningThreshold) {
    return { className: "cwp-badge-warning", label: labels[1] };
  }

  return { className: "cwp-badge-normal", label: labels[0] };
}

function formatMemoryUsage(usedBytes: number | null, totalBytes: number | null) {
  if (usedBytes == null && totalBytes == null) {
    return "N/A";
  }

  if (totalBytes == null) {
    return formatBytes(usedBytes);
  }

  return `${formatBytes(usedBytes)} / ${formatBytes(totalBytes)}`;
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

function rateLevel(value: number | null, highWatermark = 10 * 1024 * 1024) {
  if (value == null) {
    return 0;
  }

  return clampPercent((value / highWatermark) * 100);
}
