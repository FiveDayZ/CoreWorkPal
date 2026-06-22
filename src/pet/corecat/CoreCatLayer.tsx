import type React from "react";
import type {
  BoneTransform,
  CoreCatPose,
  CoreCatSkeletonNode,
} from "./animation/animationTypes";

export interface CoreCatLayerProps {
  children: React.ReactNode;
  node: CoreCatSkeletonNode;
  pose: CoreCatPose;
}

export function CoreCatLayer({ children, node, pose }: CoreCatLayerProps) {
  const transform = {
    ...node.defaultTransform,
    ...(pose[node.id] ?? {}),
  };

  return (
    <div
      className={`corecat-bone corecat-bone--${node.id.replaceAll("_", "-")}`}
      data-bone-id={node.id}
      style={createBoneStyle(node, transform)}
    >
      {children}
    </div>
  );
}

function createBoneStyle(
  node: CoreCatSkeletonNode,
  transform: Required<Pick<BoneTransform, "x" | "y" | "scaleX" | "scaleY" | "rotate" | "opacity">>,
): React.CSSProperties {
  return {
    opacity: transform.opacity,
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0) rotate(${transform.rotate}deg) scale(${transform.scaleX}, ${transform.scaleY})`,
    transformOrigin: `${node.pivot[0]}px ${node.pivot[1]}px`,
    zIndex: node.zIndex,
  };
}
