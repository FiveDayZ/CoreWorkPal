import type { WorkLogScoreDimension } from "./workLog";

export type WorkDayType =
  | "deepFocus"
  | "buildBurst"
  | "archiveFlow"
  | "pressureRepair"
  | "stableMaintenance"
  | "fragmentedSwitching"
  | "lowLoadCompanion"
  | "unknown";

export type InsightSeverity = "positive" | "neutral" | "warning";

export type WorkTimelineSegmentKind =
  | "idleCompanion"
  | "steadyProgress"
  | "deepFocus"
  | "buildPeak"
  | "archiveFlow"
  | "memoryCrowded"
  | "temperatureWarning"
  | "pressureRepair";

export interface WorkprintSummary {
  label: string;
  description: string;
  pixelGrid: number[];
  width: number;
  height: number;
  loadShape: number;
  inputRhythm: number;
  ioIntensity: number;
  thermalPressure: number;
  continuity: number;
}

export interface WorkTimelineSegment {
  startTime: string;
  endTime: string;
  kind: WorkTimelineSegmentKind;
  intensity: number;
  label: string;
  description: string;
}

export interface BaselineComparison {
  sampleDays: number;
  activeSecondsDeltaRatio: number;
  loadDeltaRatio: number;
  ioDeltaRatio: number;
  thermalDeltaRatio: number;
  inputDeltaRatio: number;
  summary: string;
}

export interface AssessmentInsight {
  title: string;
  body: string;
  severity: InsightSeverity;
  metricValue?: string | null;
}

export interface DailyWorkAssessment {
  date: string;
  dayType: WorkDayType;
  dayTypeTitle: string;
  workprint: WorkprintSummary;
  baseline: BaselineComparison;
  timeline: WorkTimelineSegment[];
  highlights: AssessmentInsight[];
  risks: AssessmentInsight[];
  suggestions: AssessmentInsight[];
  dimensions: WorkLogScoreDimension[];
  score: number;
  corecatSummary: string;
  badgeIds: string[];
}

export interface DailyWorkAssessmentSummary {
  date: string;
  dayType: WorkDayType;
  dayTypeTitle: string;
  score: number;
  corecatSummary: string;
  badgeIds: string[];
  hasTimeline: boolean;
  hasData: boolean;
}

export interface DailyWorkAssessmentTrend {
  sampleDays: number;
  averageScore: number;
  bestDate: string | null;
  bestScore: number | null;
  bestDayType: WorkDayType;
  bestDayTypeTitle: string;
  dominantDayType: WorkDayType;
  dominantDayTypeTitle: string;
  timelineDays: number;
  scoreDelta: number;
  summary: string;
  insights: AssessmentInsight[];
}
