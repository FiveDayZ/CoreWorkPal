import { CORE_CAT_ANIMATION_CONFIG } from "./animationConfig";

export interface CoreCatActionControllerState {
  clickUntilMs: number;
  previousClickInput: boolean;
}

export interface CoreCatActionControllerResult {
  didStartClick: boolean;
  isClicking: boolean;
  state: CoreCatActionControllerState;
}

export function createCoreCatActionControllerState(): CoreCatActionControllerState {
  return {
    clickUntilMs: 0,
    previousClickInput: false,
  };
}

export function updateCoreCatActionController(
  state: CoreCatActionControllerState,
  clickInput: boolean,
  now: number,
): CoreCatActionControllerResult {
  const didStartClick =
    clickInput && !state.previousClickInput && now >= state.clickUntilMs;
  const clickUntilMs = didStartClick
    ? now + CORE_CAT_ANIMATION_CONFIG.click.totalMs
    : state.clickUntilMs;

  return {
    didStartClick,
    isClicking: now < clickUntilMs,
    state: {
      clickUntilMs,
      previousClickInput: clickInput,
    },
  };
}
