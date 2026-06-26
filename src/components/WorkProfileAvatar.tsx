import type React from "react";
import deepFocus from "../assets/pets/avatars/deepFocus.png";
import buildBurst from "../assets/pets/avatars/buildBurst.png";
import archiveFlow from "../assets/pets/avatars/archiveFlow.png";
import pressureRepair from "../assets/pets/avatars/pressureRepair.png";
import stableMaintenance from "../assets/pets/avatars/stableMaintenance.png";
import fragmentedSwitching from "../assets/pets/avatars/fragmentedSwitching.png";
import lowLoadCompanion from "../assets/pets/avatars/lowLoadCompanion.png";
import unknown from "../assets/pets/avatars/unknown.png";

export type WorkDayType =
  | "deepFocus"
  | "buildBurst"
  | "archiveFlow"
  | "pressureRepair"
  | "stableMaintenance"
  | "fragmentedSwitching"
  | "lowLoadCompanion"
  | "unknown";

interface WorkProfileAvatarProps {
  dayType: WorkDayType | string | undefined;
  size?: number;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

const avatarMap: Record<string, string> = {
  deepfocus: deepFocus,
  buildburst: buildBurst,
  archiveflow: archiveFlow,
  pressurerepair: pressureRepair,
  stablemaintenance: stableMaintenance,
  fragmentedswitching: fragmentedSwitching,
  lowloadcompanion: lowLoadCompanion,
  unknown: unknown,
};

export function WorkProfileAvatar({
  dayType,
  size,
  width,
  height,
  className,
  style,
}: WorkProfileAvatarProps) {
  const normalizedKey = (dayType || "unknown").toLowerCase();
  const src = avatarMap[normalizedKey] || avatarMap.unknown;

  const finalWidth = size !== undefined ? size : width;
  const finalHeight = size !== undefined ? size : height;

  return (
    <img
      src={src}
      alt={dayType || "unknown"}
      {...(finalWidth !== undefined ? { width: finalWidth } : {})}
      {...(finalHeight !== undefined ? { height: finalHeight } : {})}
      className={className}
      style={{
        imageRendering: "pixelated",
        display: "block",
        ...style,
      }}
    />
  );
}
