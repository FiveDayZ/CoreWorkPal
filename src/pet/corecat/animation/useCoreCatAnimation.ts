import { useEffect, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import type { CatState } from "../../../types/pet";
import type {
  CoreCatAnimationContext,
  CoreCatAnimationState,
  CoreCatEyeState,
  CoreCatPose,
  CoreCatStarParticle,
} from "./animationTypes";
import {
  getCoreCatOneShotDurationMs,
  getCoreCatTransitionMs,
  resolveCoreCatAnimationState,
} from "./animationStateMachine";
import { mixTransitionPose } from "./animationMixer";
import {
  applyCoreCatActionOverlay,
  sampleCoreCatPose,
} from "./animationRuntime";
import { CORE_CAT_ANIMATION_CONFIG } from "./animationConfig";
import {
  createCoreCatActionControllerState,
  updateCoreCatActionController,
} from "./animationActionController";
import { coreCatVfxBus } from "../vfx/vfxBus";
import { getCoreCatStateVfxEvents } from "../vfx/vfxRuntime";
import type { CoreCatVfxEvent } from "../vfx/vfxTypes";

export interface UseCoreCatAnimationOptions {
  catState: CatState;
  debugStateOverride?: CoreCatAnimationState | null;
  getOneShotDurationMs?: (state: CoreCatAnimationState) => number | null;
  interactionStateOverride?: CoreCatAnimationState | null;
  interactionStateRequestId?: number;
  pointerInside: boolean;
  pointerOffset: { x: number; y: number };
  isClicking: boolean;
  isDragging: boolean;
  staticMode: boolean;
  lowPowerMode: boolean;
  updateProgress?: number;
}

export interface CoreCatAnimationFrame {
  animationState: CoreCatAnimationState;
  eyeState: CoreCatEyeState;
  isGoggleShimmering: boolean;
  pose: CoreCatPose;
  previousAnimationState: CoreCatAnimationState;
  reducedMotion: boolean;
  sleepBreath: number;
  stars: CoreCatStarParticle[];
  stateElapsedMs: number;
  transitionDurationMs: number;
}

const initialFrame: CoreCatAnimationFrame = {
  animationState: "idle",
  eyeState: "normal",
  isGoggleShimmering: false,
  pose: {},
  previousAnimationState: "idle",
  reducedMotion: false,
  sleepBreath: 0,
  stars: [],
  stateElapsedMs: 0,
  transitionDurationMs: 0,
};

interface StandbyLoopState {
  state: "idle" | "dataSorting";
  until: number;
}

export function useCoreCatAnimation(options: UseCoreCatAnimationOptions) {
  const [frame, setFrame] = useState<CoreCatAnimationFrame>(initialFrame);
  const optionsRef = useRef(options);
  const currentPoseRef = useRef<CoreCatPose>({});
  const transitionFromPoseRef = useRef<CoreCatPose>({});
  const transitionStartedAtRef = useRef(0);
  const transitionDurationRef = useRef(0);
  const stateStartedAtRef = useRef(performance.now());
  const stateRef = useRef<CoreCatAnimationState>("idle");
  const blinkUntilRef = useRef(0);
  const earTwitchRef = useRef<{
    side: "left" | "right";
    startedAt: number;
    until: number;
  } | null>(null);
  const shimmerUntilRef = useRef(0);
  const starsRef = useRef<CoreCatStarParticle[]>([]);
  const actionControllerRef = useRef(createCoreCatActionControllerState());
  const reducedMotionRef = useRef(false);
  const completedOneShotStateRef = useRef<CoreCatAnimationState | null>(null);
  const pendingStateRef = useRef<CoreCatAnimationState | null>(null);
  const previousCatStateRef = useRef<CatState>(options.catState);
  const previousDebugStateRef = useRef<CoreCatAnimationState | null>(
    options.debugStateOverride ?? null,
  );
  const previousInteractionStateRef = useRef<CoreCatAnimationState | null>(
    options.interactionStateOverride ?? null,
  );
  const previousInteractionRequestIdRef = useRef(
    options.interactionStateRequestId ?? 0,
  );
  const previousAnimationStateRef = useRef<CoreCatAnimationState>("idle");
  const standbyLoopRef = useRef<StandbyLoopState>({
    state: "idle",
    until: 0,
  });
  const wasPointerInsideRef = useRef(false);
  const loopCueBucketsRef = useRef<Record<string, number>>({});

  optionsRef.current = options;

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mediaQuery.matches;

    const handleReducedMotionChange = (event: MediaQueryListEvent) => {
      reducedMotionRef.current = event.matches;
    };

    mediaQuery.addEventListener("change", handleReducedMotionChange);
    return () => mediaQuery.removeEventListener("change", handleReducedMotionChange);
  }, []);

  useEffect(() => {
    let disposed = false;
    let blinkTimer: number | undefined;
    let earTimer: number | undefined;

    function scheduleBlink() {
      blinkTimer = window.setTimeout(
        () => {
          if (disposed) {
            return;
          }
          blinkUntilRef.current =
            performance.now() + CORE_CAT_ANIMATION_CONFIG.idle.blinkDurationMs;
          scheduleBlink();
        },
        randomInRange(
          CORE_CAT_ANIMATION_CONFIG.idle.blinkMinMs,
          CORE_CAT_ANIMATION_CONFIG.idle.blinkMaxMs,
        ),
      );
    }

    function scheduleEarTwitch() {
      earTimer = window.setTimeout(
        () => {
          if (disposed) {
            return;
          }
          const now = performance.now();
          earTwitchRef.current = {
            side: Math.random() > 0.5 ? "left" : "right",
            startedAt: now,
            until: now + CORE_CAT_ANIMATION_CONFIG.idle.earTwitchDurationMs,
          };
          scheduleEarTwitch();
        },
        randomInRange(
          CORE_CAT_ANIMATION_CONFIG.idle.earTwitchMinMs,
          CORE_CAT_ANIMATION_CONFIG.idle.earTwitchMaxMs,
        ),
      );
    }

    scheduleBlink();
    scheduleEarTwitch();

    return () => {
      disposed = true;
      if (blinkTimer != null) {
        window.clearTimeout(blinkTimer);
      }
      if (earTimer != null) {
        window.clearTimeout(earTimer);
      }
    };
  }, []);

  useEffect(() => {
    let animationFrame = 0;
    let disposed = false;

    function tick(now: number) {
      if (disposed) {
        return;
      }

      const nextFrame = sampleFrame(now);
      setFrame(nextFrame);
      animationFrame = window.requestAnimationFrame(tick);
    }

    animationFrame = window.requestAnimationFrame(tick);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  function sampleFrame(now: number): CoreCatAnimationFrame {
    const currentOptions = optionsRef.current;
    const currentInteraction = currentOptions.interactionStateOverride ?? null;
    const currentInteractionRequestId =
      currentOptions.interactionStateRequestId ?? 0;
    const prevInteraction = previousInteractionStateRef.current;
    const prevInteractionRequestId = previousInteractionRequestIdRef.current;
    const catStateChanged =
      previousCatStateRef.current !== currentOptions.catState;
    const debugStateChanged =
      previousDebugStateRef.current !== (currentOptions.debugStateOverride ?? null);
    const interactionStarted =
      currentInteraction !== null &&
      (prevInteraction !== currentInteraction ||
        prevInteractionRequestId !== currentInteractionRequestId);
    const interactionEnded =
      prevInteraction !== null && currentInteraction === null;

    if (catStateChanged || debugStateChanged || interactionStarted) {
      // catState/debug 变化，或新的 interaction 动画开始 → 完全重置
      completedOneShotStateRef.current = null;
      pendingStateRef.current = null;
    } else if (interactionEnded) {
      // interaction 计时器正常结束（从有值变为 null）→ 只更新追踪引用，
      // 不清 completedOneShotState / pendingState，让排队中的下一状态继续等待
    }

    if (
      catStateChanged ||
      debugStateChanged ||
      prevInteraction !== currentInteraction ||
      prevInteractionRequestId !== currentInteractionRequestId
    ) {
      previousCatStateRef.current = currentOptions.catState;
      previousDebugStateRef.current = currentOptions.debugStateOverride ?? null;
      previousInteractionStateRef.current = currentInteraction;
      previousInteractionRequestIdRef.current = currentInteractionRequestId;
    }

    const actionUpdate = updateCoreCatActionController(
      actionControllerRef.current,
      currentOptions.isClicking,
      now,
    );
    actionControllerRef.current = actionUpdate.state;

    const activeState = stateRef.current;
    const activeStateElapsedMs = now - stateStartedAtRef.current;
    const activeOneShotDurationMs = getResolvedOneShotDurationMs(
      currentOptions,
      activeState,
    );

    if (
      activeOneShotDurationMs != null &&
      activeStateElapsedMs >= activeOneShotDurationMs &&
      completedOneShotStateRef.current !== activeState &&
      currentInteraction !== activeState
    ) {
      completedOneShotStateRef.current = activeState;
    }

    const resolvedState = resolveStandbyLoopState(
      resolveCoreCatAnimationState({
        catState: currentOptions.catState,
        completedOneShotState: completedOneShotStateRef.current,
        debugStateOverride: currentOptions.debugStateOverride ?? null,
        interactionStateOverride: currentOptions.interactionStateOverride ?? null,
        pointerInside: currentOptions.pointerInside,
        isClicking: actionUpdate.isClicking,
        isDragging: currentOptions.isDragging,
        staticMode: currentOptions.staticMode,
        lowPowerMode: currentOptions.lowPowerMode,
      }),
      currentOptions,
      actionUpdate.isClicking,
      now,
      standbyLoopRef,
    );
    const nextState = resolveQueuedCoreCatState(
      activeState,
      resolvedState,
      activeStateElapsedMs,
      activeOneShotDurationMs,
      pendingStateRef,
    );

    if (currentOptions.pointerInside && !wasPointerInsideRef.current) {
      shimmerUntilRef.current = now + CORE_CAT_ANIMATION_CONFIG.hover.shimmerMs;
      coreCatVfxBus.emit({ type: "goggleShimmer" });
    }
    wasPointerInsideRef.current = currentOptions.pointerInside;

    if (actionUpdate.didStartClick && currentOptions.catState !== "Hidden") {
      starsRef.current = createClickStars();
      coreCatVfxBus.emit({
        count: starsRef.current.length,
        type: "clickStars",
      });
    }

    if (nextState !== stateRef.current) {
      previousAnimationStateRef.current = stateRef.current;
      transitionFromPoseRef.current = currentPoseRef.current;
      transitionStartedAtRef.current = now;
      transitionDurationRef.current = getCoreCatTransitionMs(
        stateRef.current,
        nextState,
      );
      stateStartedAtRef.current = now;
      stateRef.current = nextState;
      getCoreCatStateVfxEvents(nextState).forEach((event) =>
        coreCatVfxBus.emit(event),
      );
    }

    const stateElapsedMs = now - stateStartedAtRef.current;
    emitLoopVfxCues(
      nextState,
      stateElapsedMs,
      loopCueBucketsRef.current,
    );

    const oneShotDurationMs = getResolvedOneShotDurationMs(
      currentOptions,
      nextState,
    );
    if (
      oneShotDurationMs != null &&
      stateElapsedMs >= oneShotDurationMs &&
      currentInteraction !== nextState
    ) {
      completedOneShotStateRef.current = nextState;
    }

    if (earTwitchRef.current && now > earTwitchRef.current.until) {
      earTwitchRef.current = null;
    }

    const context: CoreCatAnimationContext = {
      now,
      state: nextState,
      stateElapsedMs,
      pointer: {
        isInside: currentOptions.pointerInside,
        x: currentOptions.pointerOffset.x,
        y: currentOptions.pointerOffset.y,
      },
      blinkActive: now < blinkUntilRef.current && nextState === "idle",
      earTwitch: earTwitchRef.current?.side ?? null,
      reducedMotion: reducedMotionRef.current,
      staticMode: currentOptions.staticMode,
      lowPowerMode: currentOptions.lowPowerMode,
      isDragging: currentOptions.isDragging,
      isClicking: actionUpdate.isClicking,
      updateProgress: currentOptions.updateProgress ?? 0,
    };

    const targetPose = sampleCoreCatPose(nextState, context);

    const transitionElapsed = now - transitionStartedAtRef.current;
    const transitionPose = mixTransitionPose(
      transitionFromPoseRef.current,
      targetPose,
      transitionElapsed,
      transitionDurationRef.current,
    );
    const pose = applyCoreCatActionOverlay(nextState, transitionPose, context);
    currentPoseRef.current = pose;

    return {
      animationState: nextState,
      eyeState: resolveEyeState(nextState, now < blinkUntilRef.current),
      isGoggleShimmering: now < shimmerUntilRef.current,
      pose,
      previousAnimationState: previousAnimationStateRef.current,
      reducedMotion: reducedMotionRef.current,
      sleepBreath: getSleepBreath(now),
      stars:
        nextState === "sleep" || nextState === "lowPowerStatic"
          ? []
          : starsRef.current,
      stateElapsedMs,
      transitionDurationMs: transitionDurationRef.current,
    };
  }

  return frame;
}

function resolveQueuedCoreCatState(
  activeState: CoreCatAnimationState,
  resolvedState: CoreCatAnimationState,
  activeStateElapsedMs: number,
  activeOneShotDurationMs: number | null,
  pendingStateRef: MutableRefObject<CoreCatAnimationState | null>,
) {
  if (
    activeOneShotDurationMs != null &&
    activeStateElapsedMs < activeOneShotDurationMs
  ) {
    if (resolvedState !== activeState) {
      pendingStateRef.current = resolvedState;
    }

    return activeState;
  }

  const pendingState = pendingStateRef.current;
  if (pendingState && pendingState !== activeState) {
    pendingStateRef.current = null;
    return pendingState;
  }

  pendingStateRef.current = null;
  return resolvedState;
}

function getResolvedOneShotDurationMs(
  options: UseCoreCatAnimationOptions,
  state: CoreCatAnimationState,
) {
  return (
    options.getOneShotDurationMs?.(state) ?? getCoreCatOneShotDurationMs(state)
  );
}

function resolveStandbyLoopState(
  resolvedState: CoreCatAnimationState,
  options: UseCoreCatAnimationOptions,
  isClicking: boolean,
  now: number,
  standbyLoopRef: MutableRefObject<StandbyLoopState>,
): CoreCatAnimationState {
  if (
    resolvedState !== "idle" ||
    options.catState !== "Idle" ||
    options.debugStateOverride ||
    options.interactionStateOverride ||
    options.pointerInside ||
    isClicking ||
    options.isDragging ||
    options.staticMode ||
    options.lowPowerMode
  ) {
    standbyLoopRef.current = { state: "idle", until: 0 };
    return resolvedState;
  }

  if (now >= standbyLoopRef.current.until) {
    standbyLoopRef.current = {
      state: Math.random() < 0.5 ? "idle" : "dataSorting",
      until: now + randomInRange(5000, 10000),
    };
  }

  return standbyLoopRef.current.state;
}

function resolveEyeState(
  state: CoreCatAnimationState,
  blinkActive: boolean,
): CoreCatEyeState {
  if (state === "sleep" || state === "lowPowerStatic") {
    return "sleepy";
  }

  if (state === "click") {
    return "focused";
  }

  if (state === "memoryCrowded") {
    return "dizzy";
  }

  if (state === "errorGlitch") {
    return "dizzy";
  }

  if (
    state === "temperatureCheck" ||
    state === "celebrate" ||
    state === "workshopUpgrade" ||
    state === "moduleUpgrade" ||
    state === "achievementPop"
  ) {
    return "glowing";
  }

  if (
    state === "repairing" ||
    state === "dataSorting" ||
    state === "panelOpen" ||
    state === "panelClose" ||
    state === "updateInstalling"
  ) {
    return "focused";
  }

  return blinkActive ? "blink" : "normal";
}

function getSleepBreath(now: number) {
  const durationMs = CORE_CAT_ANIMATION_CONFIG.sleep.breathMs;
  return 0.5 - Math.cos(((now % durationMs) / durationMs) * Math.PI * 2) / 2;
}

function createClickStars(): CoreCatStarParticle[] {
  const config = CORE_CAT_ANIMATION_CONFIG.click;
  const count =
    config.starMinCount +
    Math.floor(Math.random() * (config.starMaxCount - config.starMinCount + 1));

  return Array.from({ length: count }, (_, index) => ({
    id: `${Date.now()}-${index}`,
    dx: 18 + Math.random() * 18,
    dy: -20 - Math.random() * 18,
    delayMs: index * config.starDelayStepMs,
  }));
}

function randomInRange(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function emitLoopVfxCues(
  state: CoreCatAnimationState,
  stateElapsedMs: number,
  buckets: Record<string, number>,
) {
  if (state === "repairing") {
    emitEvery(state, stateElapsedMs, 160, { count: 4, type: "spark" }, buckets);
  }

  if (state === "memoryCrowded") {
    emitEvery(
      state,
      stateElapsedMs,
      800,
      { count: 3, type: "steamBurst" },
      buckets,
    );
  }

  if (state === "dataSorting") {
    emitEvery(
      state,
      stateElapsedMs,
      650,
      { count: 6, type: "dataCubeSpawn" },
      buckets,
    );
  }

  if (state === "updateInstalling") {
    emitEvery(
      state,
      stateElapsedMs,
      900,
      { type: "updateProgress" },
      buckets,
    );
  }
}

function emitEvery(
  state: CoreCatAnimationState,
  stateElapsedMs: number,
  intervalMs: number,
  event: CoreCatVfxEvent,
  buckets: Record<string, number>,
) {
  const key = `${state}:${event.type}`;
  const bucket = Math.floor(stateElapsedMs / intervalMs);
  if (buckets[key] === bucket) {
    return;
  }

  buckets[key] = bucket;
  coreCatVfxBus.emit(event);
}
