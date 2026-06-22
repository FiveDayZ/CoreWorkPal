import type { CoreCatAnimationState } from "../animation/animationTypes";
import { getCoreCatOneShotDurationMs } from "../animation/animationStateMachine";
import { CORE_CAT_ANIMATION_CONFIG } from "../animation/animationConfig";

export type CoreCatQaSequenceId = "all" | "hardware" | "interaction";

export interface CoreCatQaSequence {
  id: CoreCatQaSequenceId;
  label: string;
  states: CoreCatAnimationState[];
}

export const CORE_CAT_QA_SEQUENCES: Record<
  CoreCatQaSequenceId,
  CoreCatQaSequence
> = {
  all: {
    id: "all",
    label: "All States",
    states: [
      "idle",
      "dataSorting",
      "memoryCrowded",
      "temperatureCheck",
      "repairing",
      "celebrate",
      "workshopUpgrade",
      "moduleUpgrade",
      "lowPowerStatic",
      "bootWake",
      "hover",
      "click",
      "panelOpen",
      "panelClose",
      "dragging",
      "dropLanding",
      "errorGlitch",
      "updateInstalling",
      "achievementPop",
      "idle",
    ],
  },
  hardware: {
    id: "hardware",
    label: "Hardware States",
    states: [
      "idle",
      "dataSorting",
      "memoryCrowded",
      "temperatureCheck",
      "repairing",
      "celebrate",
      "idle",
    ],
  },
  interaction: {
    id: "interaction",
    label: "Interaction States",
    states: [
      "bootWake",
      "hover",
      "click",
      "panelOpen",
      "panelClose",
      "dragging",
      "dropLanding",
      "lowPowerStatic",
      "idle",
    ],
  },
};

export function getCoreCatQaSequence(id: CoreCatQaSequenceId) {
  return CORE_CAT_QA_SEQUENCES[id];
}

export function getCoreCatQaStepHoldMs(state: CoreCatAnimationState) {
  const oneShotMs = getCoreCatOneShotDurationMs(state);
  if (oneShotMs != null) {
    return oneShotMs + CORE_CAT_ANIMATION_CONFIG.transition.defaultMs + 80;
  }

  if (state === "click") {
    return CORE_CAT_ANIMATION_CONFIG.click.totalMs + 120;
  }

  return 620;
}

export function shouldCoreCatQaStepAutoFallback(
  state: CoreCatAnimationState,
) {
  return getCoreCatOneShotDurationMs(state) != null;
}
