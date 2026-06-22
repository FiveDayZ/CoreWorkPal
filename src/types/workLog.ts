export interface WorkLogScoreDimension {
  key: string;
  title: string;
  score: number;
  maxScore: number;
  value: string;
  explanation: string;
  facts?: WorkLogMetricFact[];
}

export interface WorkLogMetricFact {
  label: string;
  value: string;
}

export interface WorkLogReport {
  date: string;
  totalScore: number;
  summary: string;
  activeSeconds: number;
  sampleCount: number;
  dimensions: WorkLogScoreDimension[];
}
