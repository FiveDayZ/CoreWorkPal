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
      return "sleep";
    case "Celebrate":
      return "celebrate";
    case "RepairHeavy":
    case "RepairLight":
      return "repairing";
    case "Interactive":
    case "Idle":
    default:
      return "idle";
  }
}
