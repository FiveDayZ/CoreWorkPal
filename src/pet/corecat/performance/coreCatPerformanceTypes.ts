import type { CoreCatAnimationState } from "../animation/animationTypes";

export interface CoreCatStateTransitionRecord {
  atMs: number;
  durationMs: number;
  from: CoreCatAnimationState;
  to: CoreCatAnimationState;
}

export interface CoreCatPerformanceFrameInput {
  activeVfxCount: number;
  animationState: CoreCatAnimationState;
  isLowPower: boolean;
  isVfxAutoDegraded: boolean;
  isVfxPaused: boolean;
  previousAnimationState: CoreCatAnimationState;
  reducedMotion: boolean;
  transitionDurationMs: number;
  vfxParticleCount: number;
}

export interface CoreCatPerformanceReport
  extends CoreCatPerformanceFrameInput {
  averageFrameMs: number;
  fps: number;
  frameCount: number;
  sampledAtMs: number;
  stateTransitions: CoreCatStateTransitionRecord[];
}
