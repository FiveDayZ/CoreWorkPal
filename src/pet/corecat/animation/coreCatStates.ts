import type { CatState } from "../../../types/pet";
import type { CoreCatAnimationState } from "./animationTypes";
import { CORE_CAT_ANIMATION_CONFIG } from "./animationConfig";

export const coreCatAnimationStates: CoreCatAnimationState[] = [
  "bootWake",
  "idle",
  "hover",
  "click",
  "dragging",
  "dropLanding",
  "panelOpen",
  "panelClose",
  "temperatureCheck",
  "memoryCrowded",
  "repairing",
  "dataSorting",
  "scaredByMouse",
  "eatingFish",
  "pettingHearts",
  "sleep",
  "celebrate",
  "workshopUpgrade",
  "moduleUpgrade",
  "updateInstalling",
  "achievementPop",
  "errorGlitch",
  "lowPowerStatic",
];

export const coreCatStatePriority: Record<CoreCatAnimationState, number> =
  CORE_CAT_ANIMATION_CONFIG.statePriority;

export function mapCatStateToCoreCatState(
  catState: CatState,
): CoreCatAnimationState {
  switch (catState) {
    case "TemperatureCheck":
      return "temperatureCheck";
    case "MemoryCrowded":
      return "memoryCrowded";
    case "DataSorting":
      return "dataSorting";
    case "Sleep":
    case "Hidden":
    case "Fatigued":
      // No dedicated tired animation yet; reuse sleep and let the speech bubble
      // carry the "take a break" message. Art can replace this later.
      return "sleep";
    case "NeedsBreak":
      // Reuse idle; the bubble nudges the user to step away.
      return "idle";
    case "Celebrate":
      return "celebrate";
    case "RepairHeavy":
    case "RepairLight":
      return "repairing";
    case "DeepWork":
      // Heads-down focus: reuse the repairing animation (busy tinkering).
      return "repairing";
    case "Distracted":
      // Off-task: reuse idle; the bubble carries the nudge.
      return "idle";
    case "Interactive":
    case "Idle":
    default:
      return "idle";
  }
}
