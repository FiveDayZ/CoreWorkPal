import type {
  BoneTransform,
  CoreCatBoneId,
  CoreCatPose,
} from "./animationTypes";
import { easeInOutSine, lerp } from "./animationCurves";
import { CORE_CAT_ANIMATION_CONFIG } from "./animationConfig";

const defaultTransform = {
  x: 0,
  y: 0,
  scaleX: 1,
  scaleY: 1,
  rotate: 0,
  opacity: 1,
};

export function blendPose(
  fromPose: CoreCatPose,
  toPose: CoreCatPose,
  weight: number,
): CoreCatPose {
  const clampedWeight = Math.max(0, Math.min(1, weight));
  const boneIds = new Set<CoreCatBoneId>([
    ...(Object.keys(fromPose) as CoreCatBoneId[]),
    ...(Object.keys(toPose) as CoreCatBoneId[]),
  ]);
  const blended: CoreCatPose = {};

  boneIds.forEach((boneId) => {
    const from = fromPose[boneId] ?? {};
    const to = toPose[boneId] ?? {};
    blended[boneId] = blendTransform(from, to, clampedWeight);
  });

  return blended;
}

export function mixTransitionPose(
  fromPose: CoreCatPose,
  toPose: CoreCatPose,
  elapsedMs: number,
  durationMs: number = CORE_CAT_ANIMATION_CONFIG.transition.defaultMs,
): CoreCatPose {
  if (durationMs <= 0 || elapsedMs >= durationMs) {
    return toPose;
  }

  return blendPose(fromPose, toPose, easeInOutSine(elapsedMs / durationMs));
}

export function blendTransform(
  from: BoneTransform,
  to: BoneTransform,
  weight: number,
): BoneTransform {
  return {
    x: lerp(from.x ?? defaultTransform.x, to.x ?? defaultTransform.x, weight),
    y: lerp(from.y ?? defaultTransform.y, to.y ?? defaultTransform.y, weight),
    scaleX: lerp(
      from.scaleX ?? defaultTransform.scaleX,
      to.scaleX ?? defaultTransform.scaleX,
      weight,
    ),
    scaleY: lerp(
      from.scaleY ?? defaultTransform.scaleY,
      to.scaleY ?? defaultTransform.scaleY,
      weight,
    ),
    rotate: lerp(
      from.rotate ?? defaultTransform.rotate,
      to.rotate ?? defaultTransform.rotate,
      weight,
    ),
    opacity: lerp(
      from.opacity ?? defaultTransform.opacity,
      to.opacity ?? defaultTransform.opacity,
      weight,
    ),
  };
}
