export type CatState =
  | "Idle"
  | "RepairLight"
  | "RepairHeavy"
  | "TemperatureCheck"
  | "MemoryCrowded"
  | "DataSorting"
  | "Sleep"
  | "Interactive"
  | "Celebrate"
  | "Hidden";

export interface CatStateChangedEvent {
  timestamp: number;
  catState: CatState;
  catMessage: string;
}
