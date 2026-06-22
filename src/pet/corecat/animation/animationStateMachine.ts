import type { CoreCatAnimationState } from "./animationTypes";
import type { CatState } from "../../../types/pet";
import {
  coreCatStatePriority,
  mapCatStateToCoreCatState,
} from "./coreCatStates";
import { CORE_CAT_ANIMATION_CONFIG } from "./animationConfig";

export interface CoreCatStateMachineInput {
  catState: CatState;
  completedOneShotState?: CoreCatAnimationState | null;
  debugStateOverride?: CoreCatAnimationState | null;
  interactionStateOverride?: CoreCatAnimationState | null;
  pointerInside: boolean;
  isClicking: boolean;
  isDragging: boolean;
  staticMode: boolean;
  lowPowerMode: boolean;
}

interface CoreCatStateCandidate {
  priority: number;
  state: CoreCatAnimationState;
}

const userInteractionPriority =
  CORE_CAT_ANIMATION_CONFIG.statePriority.lowPowerStatic + 10;

export function resolveCoreCatAnimationState(
  input: CoreCatStateMachineInput,
): CoreCatAnimationState {
  if (
    input.debugStateOverride &&
    input.debugStateOverride !== input.completedOneShotState
  ) {
    return input.debugStateOverride;
  }

  return getCoreCatStateCandidates(input).reduce((selected, candidate) =>
    candidate.priority > selected.priority ? candidate : selected,
  ).state;
}

export function getCoreCatTransitionMs(
  from: CoreCatAnimationState,
  to: CoreCatAnimationState,
) {
  if (from === to) {
    return 0;
  }

  const { durations } = CORE_CAT_ANIMATION_CONFIG.transition;

  if (to === "bootWake") {
    return durations.Any_to_BootWake;
  }

  if (from === "bootWake") {
    return durations.BootWake_to_Idle;
  }

  if (from === "idle" && to === "hover") {
    return durations.Idle_to_Hover;
  }

  if (from === "hover" && to === "idle") {
    return durations.Hover_to_Idle;
  }

  if (from === "dragging" && to === "dropLanding") {
    return durations.Dragging_to_DropLanding;
  }

  if (to === "dragging") {
    return durations.Any_to_Dragging;
  }

  if (from === "dragging") {
    return durations.Dragging_to_Idle;
  }

  if (to === "dropLanding") {
    return durations.Dragging_to_DropLanding;
  }

  if (from === "dropLanding") {
    return durations.DropLanding_to_Idle;
  }

  if (to === "panelOpen") {
    return durations.Any_to_PanelOpen;
  }

  if (from === "panelOpen") {
    return durations.PanelOpen_to_Idle;
  }

  if (to === "panelClose") {
    return durations.Any_to_PanelClose;
  }

  if (from === "panelClose") {
    return durations.PanelClose_to_Idle;
  }

  if (to === "errorGlitch") {
    return durations.Any_to_ErrorGlitch;
  }

  if (from === "errorGlitch") {
    return durations.ErrorGlitch_to_Idle;
  }

  if (from === "updateInstalling" && to === "celebrate") {
    return durations.UpdateInstalling_to_Celebrate;
  }

  if (to === "updateInstalling") {
    return durations.Any_to_UpdateInstalling;
  }

  if (from === "updateInstalling") {
    return durations.UpdateInstalling_to_Idle;
  }

  if (to === "achievementPop") {
    return durations.Any_to_AchievementPop;
  }

  if (from === "achievementPop") {
    return durations.AchievementPop_to_Idle;
  }

  if (to === "click") {
    return durations.Any_to_Click;
  }

  if (from === "click") {
    return durations.Click_to_Idle;
  }

  if (to === "celebrate") {
    return durations.Any_to_Celebrate;
  }

  if (from === "celebrate") {
    return durations.Celebrate_to_Idle;
  }

  if (to === "workshopUpgrade") {
    return durations.Any_to_WorkshopUpgrade;
  }

  if (from === "workshopUpgrade") {
    return durations.WorkshopUpgrade_to_Idle;
  }

  if (to === "moduleUpgrade") {
    return durations.Any_to_ModuleUpgrade;
  }

  if (from === "moduleUpgrade") {
    return durations.ModuleUpgrade_to_Idle;
  }

  if (to === "temperatureCheck") {
    return durations.Any_to_TemperatureCheck;
  }

  if (from === "temperatureCheck") {
    return durations.TemperatureCheck_to_Idle;
  }

  if (to === "memoryCrowded") {
    return durations.Any_to_MemoryCrowded;
  }

  if (from === "memoryCrowded") {
    return durations.MemoryCrowded_to_Idle;
  }

  if (to === "repairing") {
    return durations.Any_to_Repairing;
  }

  if (from === "repairing") {
    return durations.Repairing_to_Idle;
  }

  if (to === "dataSorting") {
    return durations.Any_to_DataSorting;
  }

  if (from === "dataSorting") {
    return durations.DataSorting_to_Idle;
  }

  if (to === "sleep") {
    return durations.Any_to_Sleep;
  }

  if (from === "sleep") {
    return durations.Sleep_to_Idle;
  }

  return CORE_CAT_ANIMATION_CONFIG.transition.defaultMs;
}

export function getCoreCatStateCandidates(
  input: CoreCatStateMachineInput,
): CoreCatStateCandidate[] {
  const isHidden = input.catState === "Hidden";
  const candidates: CoreCatStateCandidate[] = [
    {
      priority: CORE_CAT_ANIMATION_CONFIG.statePriority.idle,
      state: "idle",
    },
  ];
  const mappedState = mapCatStateToCoreCatState(input.catState);

  if (
    !isHidden &&
    input.interactionStateOverride &&
    input.interactionStateOverride !== input.completedOneShotState
  ) {
    candidates.push({
      priority: userInteractionPriority,
      state: input.interactionStateOverride,
    });
  }

  if (!isHidden && input.isDragging) {
    candidates.push({
      priority: CORE_CAT_ANIMATION_CONFIG.statePriority.dragging,
      state: "dragging",
    });
  } else if (!isHidden && input.pointerInside) {
    candidates.push({
      priority: CORE_CAT_ANIMATION_CONFIG.statePriority.hover,
      state: "hover",
    });
  }

  if (
    mappedState !== "idle" &&
    mappedState !== input.completedOneShotState
  ) {
    candidates.push({
      priority: getCoreCatStatePriority(mappedState),
      state: mappedState,
    });
  }

  if (!isHidden && input.isClicking) {
    candidates.push({
      priority: userInteractionPriority,
      state: "click",
    });
  }

  if (
    isCoreCatForcedSleepRequested(input) &&
    (isHidden || !input.interactionStateOverride) &&
    !input.isClicking &&
    !input.isDragging
  ) {
    candidates.push({
      priority: CORE_CAT_ANIMATION_CONFIG.statePriority.lowPowerStatic,
      state: isHidden ? "sleep" : "lowPowerStatic",
    });
  }

  return candidates;
}

export function getCoreCatStatePriority(state: CoreCatAnimationState) {
  return coreCatStatePriority[state];
}

export function getCoreCatOneShotDurationMs(
  state: CoreCatAnimationState,
): number | null {
  const { oneShot } = CORE_CAT_ANIMATION_CONFIG;

  switch (state) {
    case "achievementPop":
      return oneShot.achievementPopMs;
    case "bootWake":
      return oneShot.bootWakeMs;
    case "click":
      return CORE_CAT_ANIMATION_CONFIG.click.totalMs;
    case "dropLanding":
      return oneShot.dropLandingMs;
    case "moduleUpgrade":
      return oneShot.moduleUpgradeMs;
    case "errorGlitch":
      return oneShot.errorGlitchMs;
    case "panelClose":
      return oneShot.panelCloseMs;
    case "panelOpen":
      return oneShot.panelOpenMs;
    case "celebrate":
      return CORE_CAT_ANIMATION_CONFIG.celebrate.totalMs;
    case "workshopUpgrade":
      return oneShot.workshopUpgradeMs;
    default:
      return null;
  }
}

export function isCoreCatForcedSleepRequested(input: CoreCatStateMachineInput) {
  if (input.catState === "Hidden") {
    return true;
  }

  return (
    (input.staticMode || input.lowPowerMode) &&
    (input.catState === "Idle" ||
      input.catState === "Interactive" ||
      input.catState === "Sleep")
  );
}
