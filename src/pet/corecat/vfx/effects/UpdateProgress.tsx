import type React from "react";

export function UpdateProgress({ progress }: { progress: number }) {
  const clampedProgress = Math.max(0, Math.min(1, progress));

  return (
    <div
      className="corecat-update-progress"
      style={
        {
          "--corecat-update-progress": clampedProgress,
        } as React.CSSProperties
      }
      aria-hidden="true"
    >
      <span className="corecat-update-track" />
      <span className="corecat-update-fill" />
      <span className="corecat-update-tick" />
    </div>
  );
}
