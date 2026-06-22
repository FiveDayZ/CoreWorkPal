import type { CoreCatAnimationState, CoreCatStarParticle } from "../animation/animationTypes";

export type CoreCatVfxEvent =
  | { type: "spark"; count?: number }
  | { type: "clickStars"; count?: number }
  | { type: "coolingWind"; intensity: number }
  | { type: "coldPixels"; intensity: number }
  | { type: "steamBurst"; count?: number }
  | { type: "dataCubeSpawn"; count?: number }
  | { type: "errorGlitch" }
  | { type: "pouchGlow" }
  | { type: "sleepBubblePulse" }
  | { type: "goldenSteamRing" }
  | { type: "achievementPop" }
  | { type: "updateProgress"; progress?: number }
  | { type: "goggleShimmer" };

export type CoreCatVfxEffectId =
  | "clickStars"
  | "coolingWind"
  | "coolingParticles"
  | "coolingText"
  | "memoryRamBox"
  | "memorySteam"
  | "repairSparks"
  | "hologramPanel"
  | "dataCubes"
  | "celebrateBurst"
  | "sleepBubble"
  | "errorGlitch"
  | "updateProgress"
  | "achievementBadge";

export interface CoreCatVfxRuntimeInput {
  animationState: CoreCatAnimationState;
  degradeVfx?: boolean;
  isPaused: boolean;
  lowPowerMode: boolean;
  reducedMotion: boolean;
  sleepBreath: number;
  stars: CoreCatStarParticle[];
  stateElapsedMs: number;
  updateProgress?: number;
}

export interface CoreCatVfxParticleCounts {
  celebrateParticles: number;
  clickStars: number;
  coolingParticles: number;
  dataCubes: number;
  sparkParticles: number;
  steamPuffs: number;
  total: number;
}

export interface CoreCatVfxSnapshot {
  activeEffects: CoreCatVfxEffectId[];
  animationState: CoreCatAnimationState;
  isAutoDegraded: boolean;
  isPaused: boolean;
  particleCounts: CoreCatVfxParticleCounts;
  shouldRenderHighFrequencyVfx: boolean;
  sleepBreath: number;
  stars: CoreCatStarParticle[];
  stateElapsedMs: number;
  updateProgress: number;
}
