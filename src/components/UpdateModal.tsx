import React, { useState, useEffect } from "react";
import { listen, emit } from "@tauri-apps/api/event";
import { checkUpdate, downloadUpdate, installUpdate } from "../services/tauriCommands";
import type { UpdateCheckResult, DownloadProgress } from "../types/update";
import { PixelIcon } from "../ui/PixelIcon";

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpdateModal({ isOpen, onClose }: UpdateModalProps) {
  const [step, setStep] = useState<"checking" | "up-to-date" | "new-version" | "downloading" | "ready" | "error">("checking");
  const [errorMsg, setErrorMsg] = useState("");
  const [updateResult, setUpdateResult] = useState<UpdateCheckResult | null>(null);
  const [progress, setProgress] = useState<DownloadProgress>({ bytesDownloaded: 0, totalBytes: 0, percent: 0 });
  const [pat, setPat] = useState(() => localStorage.getItem("cwp_updater_pat") || "");
  const [showSettings, setShowSettings] = useState(false);
  const [downloadedPath, setDownloadedPath] = useState("");

  useEffect(() => {
    if (isOpen) {
      handleCheck();
      void emit("corecat:interaction-state", "updateInstalling");
    }
    return () => {
      void emit("corecat:interaction-state", "idle");
    };
  }, [isOpen]);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    const setupListener = async () => {
      unsubscribe = await listen<DownloadProgress>("update:progress", (event) => {
        setProgress(event.payload);
      });
    };

    if (step === "downloading") {
      setupListener().catch((e) => {
        console.error("Failed to setup update listener:", e);
      });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [step]);

  const handleCheck = async () => {
    setStep("checking");
    setErrorMsg("");
    try {
      const result = await checkUpdate(pat || undefined);
      setUpdateResult(result);
      if (result.hasUpdate) {
        setStep("new-version");
      } else {
        setStep("up-to-date");
      }
    } catch (e: any) {
      setErrorMsg(e.toString());
      setStep("error");
    }
  };

  const handleDownload = async () => {
    if (!updateResult) return;
    setStep("downloading");
    setProgress({ bytesDownloaded: 0, totalBytes: updateResult.assetSize, percent: 0 });
    try {
      const path = await downloadUpdate(updateResult.assetId || 0, updateResult.assetName, pat || undefined);
      setDownloadedPath(path);
      setStep("ready");
    } catch (e: any) {
      setErrorMsg(e.toString());
      setStep("error");
    }
  };

  const handleInstall = async () => {
    try {
      await installUpdate(downloadedPath);
    } catch (e: any) {
      setErrorMsg(e.toString());
      setStep("error");
    }
  };

  const savePat = (val: string) => {
    setPat(val);
    localStorage.setItem("cwp_updater_pat", val);
  };

  if (!isOpen) return null;

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="cwp-modal-overlay" style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.4)",
      backdropFilter: "blur(4px)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div className="cwp-workshop-detail-modal show" style={{ 
        position: "relative",
        top: "auto",
        left: "auto",
        transform: "none",
        display: "block", 
        opacity: 1, 
        width: "320px", 
        zIndex: 10000 
      }}>
        <div className="cwp-modal-header">
          <span className="cwp-modal-title" style={{ display: "flex", alignItems: "center" }}>
            <PixelIcon name="energy" size={14} style={{ marginRight: "6px" }} />
            在线自动更新
          </span>
          <button onClick={onClose} className="cwp-custom-btn" style={{ 
            background: "transparent", 
            border: "none", 
            color: "var(--color-text-muted)", 
            cursor: "pointer", 
            fontSize: "12px",
            lineHeight: 1
          }}>
            ✕
          </button>
        </div>

        <div className="cwp-modal-body" style={{ minHeight: "160px", justifyContent: "center" }}>
          {step === "checking" && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div className="cwp-spinner" style={{ 
                margin: "0 auto 10px auto",
                width: "24px",
                height: "24px",
                border: "2px solid var(--color-border-soft)",
                borderTopColor: "var(--color-brand-orange-strong)",
                borderRadius: "50%",
                animation: "spin 1s linear infinite"
              }}></div>
              <p style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>正在检查服务器上的最新发布记录...</p>
            </div>
          )}

          {step === "up-to-date" && (
            <div style={{ textAlign: "center", padding: "10px 0" }}>
              <p style={{ fontSize: "14px", color: "var(--color-tech-cyan)", fontFamily: "var(--font-pixel-title)", marginBottom: "8px" }}>已是最新版本</p>
              <p style={{ fontSize: "11px", color: "var(--color-text-muted)", marginBottom: "2px" }}>本地版本：v{updateResult?.currentVersion}</p>
              <p style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>线上版本：{updateResult?.latestVersion}</p>
              <button onClick={onClose} className="cwp-custom-btn" style={{ 
                marginTop: "20px", 
                width: "100%", 
                height: "26px",
                background: "var(--color-bg-800)",
                border: "1px solid var(--color-border-soft)",
                color: "var(--color-text-primary)",
                cursor: "pointer"
              }}>
                确定并关闭
              </button>
            </div>
          )}

          {step === "new-version" && updateResult && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                <span style={{ color: "var(--color-text-secondary)" }}>当前版本：v{updateResult.currentVersion}</span>
                <span style={{ color: "var(--color-brand-orange-strong)", fontWeight: "bold" }}>发现新版本：{updateResult.latestVersion}</span>
              </div>
              <div style={{ 
                background: "var(--color-bg-950)", 
                border: "1px solid var(--color-border-soft)", 
                padding: "6px", 
                fontSize: "10px", 
                maxHeight: "120px", 
                overflowY: "auto", 
                whiteSpace: "pre-wrap",
                color: "var(--color-text-secondary)"
              }}>
                <strong style={{ color: "var(--color-text-primary)", display: "block", marginBottom: "4px" }}>更新日志：</strong>
                {updateResult.changelog || "无更新日志描述。"}
              </div>
              <div style={{ fontSize: "10px", color: "var(--color-text-muted)" }}>
                安装包大小：{formatSize(updateResult.assetSize)}
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                <button onClick={handleDownload} className="cwp-custom-btn" style={{ 
                  flex: 1, 
                  height: "26px", 
                  background: "var(--color-brand-orange)", 
                  border: "1px solid var(--color-border-strong)",
                  color: "var(--color-bg-950)", 
                  fontWeight: "bold",
                  cursor: "pointer"
                }}>
                  立即下载
                </button>
                <button onClick={onClose} className="cwp-custom-btn" style={{ 
                  width: "80px", 
                  height: "26px",
                  background: "var(--color-bg-800)",
                  border: "1px solid var(--color-border-soft)",
                  color: "var(--color-text-secondary)",
                  cursor: "pointer"
                }}>
                  稍后
                </button>
              </div>
            </div>
          )}

          {step === "downloading" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <p style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>正在下载最新升级安装包...</p>
              <div style={{ height: "12px", background: "var(--color-bg-950)", border: "1px solid var(--color-border-soft)", position: "relative", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progress.percent}%`, background: "var(--color-brand-orange)", transition: "width 0.1s ease" }}></div>
                <span style={{ position: "absolute", top: 0, left: 0, width: "100%", textAlign: "center", fontSize: "9px", lineHeight: "12px", color: "#fff", mixBlendMode: "difference", fontFamily: "var(--font-mono)" }}>
                  {progress.percent.toFixed(1)}%
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--color-text-muted)" }}>
                <span>已下载: {formatSize(progress.bytesDownloaded)}</span>
                <span>总大小: {formatSize(progress.totalBytes)}</span>
              </div>
            </div>
          )}

          {step === "ready" && (
            <div style={{ textAlign: "center", padding: "10px 0" }}>
              <p style={{ fontSize: "13px", color: "var(--color-tech-cyan)", fontWeight: "bold", marginBottom: "8px" }}>下载完成</p>
              <p style={{ fontSize: "10px", color: "var(--color-text-secondary)", marginBottom: "20px", lineHeight: 1.3 }}>
                升级包已准备就绪，点击下方按钮将关闭当前程序并启动更新安装程序。
              </p>
              <button onClick={handleInstall} className="cwp-custom-btn" style={{ 
                width: "100%", 
                height: "28px", 
                background: "var(--color-brand-orange)", 
                border: "1px solid var(--color-border-strong)",
                color: "var(--color-bg-950)", 
                fontWeight: "bold",
                cursor: "pointer"
              }}>
                立即重启并升级
              </button>
            </div>
          )}

          {step === "error" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <p style={{ fontSize: "12px", color: "var(--color-danger)", fontWeight: "bold" }}>更新失败</p>
              <div style={{ 
                background: "rgba(255, 110, 110, 0.15)", 
                border: "1px solid var(--color-danger)", 
                color: "var(--color-danger)", 
                padding: "6px", 
                fontSize: "10px", 
                maxHeight: "80px", 
                overflowY: "auto", 
                wordBreak: "break-all" 
              }}>
                {errorMsg}
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                <button onClick={handleCheck} className="cwp-custom-btn" style={{ 
                  flex: 1, 
                  height: "26px",
                  background: "var(--color-bg-800)",
                  border: "1px solid var(--color-border-soft)",
                  color: "var(--color-text-primary)",
                  cursor: "pointer"
                }}>
                  重试
                </button>
                <button onClick={() => setShowSettings(!showSettings)} className="cwp-custom-btn" style={{ 
                  width: "60px", 
                  height: "26px",
                  background: "var(--color-bg-800)",
                  border: "1px solid var(--color-border-soft)",
                  color: "var(--color-text-secondary)",
                  cursor: "pointer"
                }}>
                  配置
                </button>
                <button onClick={onClose} className="cwp-custom-btn" style={{ 
                  width: "60px", 
                  height: "26px",
                  background: "var(--color-bg-800)",
                  border: "1px solid var(--color-border-soft)",
                  color: "var(--color-text-secondary)",
                  cursor: "pointer"
                }}>
                  取消
                </button>
              </div>
            </div>
          )}

          {/* Settings panel for token auth */}
          {(showSettings || step === "error") && (
            <div style={{ borderTop: "1px solid var(--color-border-soft)", marginTop: "10px", paddingTop: "8px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "9px", color: "var(--color-text-muted)" }}>
                  GitHub Access Token (私有仓库可选鉴权):
                </label>
                <input
                  type="password"
                  value={pat}
                  onChange={(e) => savePat(e.target.value)}
                  placeholder="ghp_..."
                  style={{
                    background: "var(--color-bg-950)",
                    border: "1px solid var(--color-border-soft)",
                    color: "var(--color-text-primary)",
                    padding: "3px 6px",
                    fontSize: "10px",
                    width: "100%",
                    outline: "none"
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
