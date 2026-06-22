/**
 * Sprite-sheet asset loader and state-to-spritesheet mapping.
 *
 * Uses Vite `import.meta.glob` to eagerly import all animation sprite-sheet
 * WebPs (as URLs) and JSONs (as metadata objects) from the animation directory,
 * then builds a lookup table keyed by `CoreCatAnimationState`.
 */

import type { CoreCatAnimationState } from "./animationTypes";
import type { SpriteSheetMeta } from "./spriteSheetTypes";

// ---------------------------------------------------------------------------
// Vite eager imports
// ---------------------------------------------------------------------------

const sheetImageModules = import.meta.glob(
  "../../../assets/pets/animation/*.webp",
  { eager: true, import: "default", query: "?url" },
) as Record<string, string>;

const sheetMetaModules = import.meta.glob(
  "../../../assets/pets/animation/*.json",
  { eager: true, import: "default" },
) as Record<string, SpriteSheetMeta>;

// ---------------------------------------------------------------------------
// Build normalised lookup maps  (filename stem → url / meta)
// ---------------------------------------------------------------------------

function extractStem(globPath: string): string {
  // globPath looks like "../../../assets/pets/animation/Idle.webp"
  const filename = globPath.split("/").pop() ?? "";
  return filename.replace(/\.(webp|json)$/i, "");
}

const imageUrlByStem = Object.fromEntries(
  Object.entries(sheetImageModules).map(([path, url]) => [
    extractStem(path),
    url,
  ]),
) as Record<string, string>;

const metaByStem = Object.fromEntries(
  Object.entries(sheetMetaModules).map(([path, meta]) => [
    extractStem(path),
    meta,
  ]),
) as Record<string, SpriteSheetMeta>;

if (typeof window !== "undefined") {
  Object.values(imageUrlByStem).forEach((url) => {
    const image = new Image();
    image.decoding = "async";
    image.src = url;
  });
}

// ---------------------------------------------------------------------------
// State → spritesheet file-stem mapping
// ---------------------------------------------------------------------------

/**
 * Maps every `CoreCatAnimationState` to the file stem(s) of its sprite-sheet
 * asset(s). Most states have a single sprite-sheet; `click` has two variants.
 */
const STATE_TO_STEM: Record<CoreCatAnimationState, string> = {
  idle: "Idle",
  hover: "Hover",
  click: "Click_Action",
  bootWake: "BootWake",
  dragging: "Dragging",
  dropLanding: "DropLanding",
  panelOpen: "PanelOpen",
  panelClose: "PanelClose",
  temperatureCheck: "Temperature_Check",
  memoryCrowded: "Memory_Crowded",
  repairing: "Repairing",
  dataSorting: "dataSorting",
  sleep: "Sleep_Low_Power",
  celebrate: "Celebrate",
  workshopUpgrade: "Workshop_Upgrade",
  moduleUpgrade: "Module_Upgrade",
  updateInstalling: "UpdateInstalling",
  achievementPop: "AchievementPop",
  errorGlitch: "ErrorGlitch",
  lowPowerStatic: "Sleep_Low_Power",
};

/** File stem for the rapid-click dizzy variant. */
const CLICK_DIZZY_STEM = "Click_Dizzy";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface SpriteSheetAsset {
  sheetUrl: string;
  meta: SpriteSheetMeta;
}

/** Whether a looping or one-shot playback mode should be used. */
const ONE_SHOT_STATES = new Set<CoreCatAnimationState>([
  "bootWake",
  "click",
  "dropLanding",
  "panelOpen",
  "panelClose",
  "celebrate",
  "workshopUpgrade",
  "moduleUpgrade",
  "achievementPop",
  "errorGlitch",
]);

/**
 * Returns true if the animation state should play once and hold the last frame,
 * false if it should loop continuously.
 */
export function isSpriteSheetOneShot(state: CoreCatAnimationState): boolean {
  return ONE_SHOT_STATES.has(state);
}

export function getSpriteSheetOneShotDurationMs(
  state: CoreCatAnimationState,
): number | null {
  if (!isSpriteSheetOneShot(state)) {
    return null;
  }

  const asset = getSpriteSheetForState(state);
  const frames = asset?.meta.frames ?? [];
  const durationSec = frames[frames.length - 1]?.t ?? 0;
  return durationSec > 0 ? durationSec * 1000 : null;
}

/**
 * Resolve the sprite-sheet asset for a given animation state.
 *
 * @param state       The current animation state.
 * @param useClickDizzy  When true and state is `click`, use the Click_Dizzy
 *                       variant instead of Click_Action.
 * @returns The asset (URL + meta) or null if not found.
 */
export function getSpriteSheetForState(
  state: CoreCatAnimationState,
  useClickDizzy = false,
): SpriteSheetAsset | null {
  const stem =
    state === "click" && useClickDizzy ? CLICK_DIZZY_STEM : STATE_TO_STEM[state];

  const sheetUrl = imageUrlByStem[stem];
  const meta = metaByStem[stem];

  if (!sheetUrl || !meta) {
    return null;
  }

  return { sheetUrl, meta };
}

/**
 * Get all loaded sprite-sheet stems for debugging / asset panel.
 */
export function getLoadedSpriteSheetStems(): string[] {
  return Object.keys(imageUrlByStem).filter((stem) => metaByStem[stem]);
}
