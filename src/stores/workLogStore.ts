import { create } from "zustand";
import { getWorkLogReport } from "../services/tauriCommands";
import type { WorkLogReport } from "../types/workLog";

export interface WorkLogStore {
  report: WorkLogReport | null;
  selectedDate: string;
  setReport: (report: WorkLogReport) => void;
  setSelectedDate: (date: string) => void;
  loadWorkLogReport: (date?: string) => Promise<void>;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export const useWorkLogStore = create<WorkLogStore>((set, get) => ({
  report: null,
  selectedDate: todayKey(),
  setReport: (report) => set({ report }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  loadWorkLogReport: async (date) => {
    const selectedDate = date ?? get().selectedDate;
    const report = await getWorkLogReport(selectedDate);
    set({ report, selectedDate: report.date });
  },
}));
