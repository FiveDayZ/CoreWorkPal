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
  cpuPhysicalCoreCount: number | null;
  cpuLogicalCoreCount: number | null;
  deviceInventory: HardwareDeviceInventory;
}

export interface HardwareDeviceInventory {
  motherboard: HardwareDeviceInfo[];
  memoryModules: MemoryModuleInfo[];
  gpus: HardwareDeviceInfo[];
  displays: HardwareDeviceInfo[];
  disks: HardwareDeviceInfo[];
  audioDevices: HardwareDeviceInfo[];
  networkAdapters: HardwareDeviceInfo[];
}

export interface HardwareDeviceInfo {
  name: string;
  detail: string | null;
  vendor: string | null;
  capacityBytes: number | null;
}

export interface MemoryModuleInfo {
  manufacturer: string | null;
  partNumber: string | null;
  capacityBytes: number | null;
  speedMhz: number | null;
}
