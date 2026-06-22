import { useEffect, useRef, useState } from "react";
import type {
  CoreCatPerformanceFrameInput,
  CoreCatPerformanceReport,
} from "./coreCatPerformanceTypes";
import {
  createCoreCatPerformanceMonitor,
  createInitialCoreCatPerformanceReport,
} from "./coreCatPerformanceMonitor";

export function useCoreCatPerformance(input: CoreCatPerformanceFrameInput) {
  const monitorRef = useRef<ReturnType<
    typeof createCoreCatPerformanceMonitor
  > | null>(null);
  const [report, setReport] = useState<CoreCatPerformanceReport>(() =>
    createInitialCoreCatPerformanceReport(input),
  );

  if (monitorRef.current == null) {
    monitorRef.current = createCoreCatPerformanceMonitor(input);
  }

  useEffect(() => {
    const nextReport = monitorRef.current?.recordFrame(input);
    if (nextReport) {
      setReport(nextReport);
    }
  }, [
    input.activeVfxCount,
    input.animationState,
    input.isLowPower,
    input.isVfxAutoDegraded,
    input.isVfxPaused,
    input.previousAnimationState,
    input.reducedMotion,
    input.transitionDurationMs,
    input.vfxParticleCount,
  ]);

  return report;
}
