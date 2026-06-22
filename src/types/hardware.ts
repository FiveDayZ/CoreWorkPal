export interface HardwareSnapshot {
  timestamp: number;
  cpuUsagePercent: number | null;
  gpuUsagePercent: number | null;
  memoryUsagePercent: number | null;
  cpuTemperatureCelsius: number | null;
  gpuTemperatureCelsius: number | null;
  diskReadBytesPerSecond: number | null;
  diskWriteBytesPerSecond: number | null;
  networkDownloadBytesPerSecond: number | null;
  networkUploadBytesPerSecond: number | null;
  cpuName: string | null;
  gpuName: string | null;
  gpuMemoryUsedBytes: number | null;
  gpuMemoryTotalBytes: number | null;
  totalMemoryBytes: number | null;
  usedMemoryBytes: number | null;
}
