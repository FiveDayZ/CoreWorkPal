import { useState } from "react";
import { iconAssets } from "../../ui/assets";
import { PixelIcon } from "../../ui/PixelIcon";
import { UpdateModal } from "../../components/UpdateModal";

export function AboutPage() {
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  return (
    <div className="cwp-page">
      <div className="page-title-row">
        <h2 className="page-title">关于CoreWorkPal</h2>
      </div>

      {/* Hero Welcome Banner */}
      <div className="cwp-about-hero">
        <div className="cwp-about-hero-base" />
        <div>
          <h1 className="cwp-about-hero-title">CoreWorkPal 桌面伙伴</h1>
          <p className="cwp-about-hero-subtitle">
            让工作更有序，让创意更自由。这是一个精心打磨的桌面监控伙伴，集成迷你桌面宠物、硬件状态监控、工作投入度与专注度评估、以及工坊养成系统，实时分析您的工作状态与产出效能，是您贴心的工作伙伴。
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
            <span className="cwp-about-version-tag">Version {typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "0.1.0"} (Release-Build)</span>
            <button
              onClick={() => setIsUpdateOpen(true)}
              className="cwp-custom-btn"
              style={{
                background: "var(--color-brand-orange)",
                border: "1px solid var(--color-border-strong)",
                color: "var(--color-bg-950)",
                fontSize: "10px",
                padding: "2px 8px",
                cursor: "pointer",
                fontWeight: "bold",
                fontFamily: "var(--font-pixel-title)",
                lineHeight: 1
              }}
              type="button"
            >
              检查更新
            </button>
          </div>
        </div>
        <img
          src={iconAssets.corecatAvatar}
          alt="Mascot Celebrate"
          className="cwp-about-hero-mascot"
        />
      </div>

      {/* Git Repository Info */}
      <div className="cwp-about-card" style={{ height: "auto", padding: "12px 16px", gap: "8px", marginTop: "8px" }}>
        <span className="cwp-about-card-title" style={{ fontSize: "13px", display: "flex", alignItems: "center" }}>
          <PixelIcon name="energy" size={14} style={{ marginRight: "8px" }} />
          开源项目仓库 (Git Repository)
        </span>
        <p className="cwp-about-card-p" style={{ fontSize: "11px", marginBottom: "4px" }}>
          欢迎访问项目主页提交 Issue 或 PR。让我们一起打磨出更好玩的硬件诊断工坊与桌面伴侣！
        </p>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--color-bg-950)",
          border: "1px solid var(--color-border-soft)",
          padding: "6px 10px",
          borderRadius: "0px",
          marginTop: "6px"
        }}>
          <code style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--color-brand-orange-strong)",
            userSelect: "all",
            wordBreak: "break-all"
          }}>
            https://github.com/FiveDayZ/CoreWorkPal.git
          </code>
          <button
            onClick={() => {
              void navigator.clipboard.writeText("https://github.com/FiveDayZ/CoreWorkPal.git");
              alert("Git 仓库地址已复制到剪贴板！");
            }}
            style={{
              background: "var(--color-bg-800)",
              border: "1px solid var(--color-border-soft)",
              color: "var(--color-text-primary)",
              fontSize: "11px",
              padding: "4px 10px",
              cursor: "pointer",
              marginLeft: "10px",
              fontFamily: "var(--font-pixel-title)",
              transition: "all 0.15s ease"
            }}
            className="cwp-custom-btn"
            type="button"
          >
            复制地址
          </button>
        </div>
      </div>
      <UpdateModal isOpen={isUpdateOpen} onClose={() => setIsUpdateOpen(false)} />
    </div>
  );
}
