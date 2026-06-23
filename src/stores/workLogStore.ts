import { create } from "zustand";
import {
  getDailyWorkAssessment,
  getDailyWorkAssessmentHistory,
  getDailyWorkAssessmentTrend,
  getWorkLogReport,
} from "../services/tauriCommands";
import type {
  DailyWorkAssessment,
  DailyWorkAssessmentSummary,
  DailyWorkAssessmentTrend,
} from "../types/dailyWorkAssessment";
import type { WorkLogReport } from "../types/workLog";

export interface WorkLogStore {
  report: WorkLogReport | null;
  assessment: DailyWorkAssessment | null;
  assessmentHistory: DailyWorkAssessmentSummary[];
  assessmentTrend: DailyWorkAssessmentTrend | null;
  selectedDate: string;
  setReport: (report: WorkLogReport) => void;
  setAssessment: (assessment: DailyWorkAssessment) => void;
  setSelectedDate: (date: string) => void;
  loadAssessmentHistory: (limit?: number) => Promise<void>;
  loadAssessmentTrend: (limit?: number) => Promise<void>;
  loadWorkLogReport: (date?: string) => Promise<void>;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export const useWorkLogStore = create<WorkLogStore>((set, get) => ({
  report: null,
  assessment: null,
  assessmentHistory: [],
  assessmentTrend: null,
  selectedDate: todayKey(),
  setReport: (report) => set({ report }),
  setAssessment: (assessment) => set({ assessment }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  loadAssessmentHistory: async (limit) => {
    const assessmentHistory = await getDailyWorkAssessmentHistory(limit);
    set({ assessmentHistory });
  },
  loadAssessmentTrend: async (limit) => {
    const assessmentTrend = await getDailyWorkAssessmentTrend(limit);
    set({ assessmentTrend });
  },
  loadWorkLogReport: async (date) => {
    const selectedDate = date ?? get().selectedDate;
    const [report, assessment] = await Promise.all([
      getWorkLogReport(selectedDate),
      getDailyWorkAssessment(selectedDate),
    ]);
    set({ assessment, report, selectedDate: report.date });
  },
}));
