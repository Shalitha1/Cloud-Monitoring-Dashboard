export type AlarmState = "OK" | "WARNING" | "ALARM";

export interface MetricSnapshot {
  cpuUsagePercent: number;
  cpuUserPercent: number;
  cpuSystemPercent: number;
  cpuCoreCount: number;
  memoryUsagePercent: number;
  memoryUsedBytes: number;
  memoryAvailableBytes: number;
  memoryTotalBytes: number;
  diskUsagePercent: number;
  diskUsedBytes: number;
  diskAvailableBytes: number;
  diskTotalBytes: number;
  diskMount: string;
  networkReceiveBytesPerSecond: number;
  networkTransmitBytesPerSecond: number;
  networkMegabytesPerSecond: number;
  uptimeSeconds: number;
  health: "healthy" | "degraded";
}

export interface HistoryPoint {
  timestamp: string;
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  diskUsagePercent: number;
  networkMegabytesPerSecond: number;
}

export interface LocalSystemInfo {
  hostname: string;
  platform: string;
  distribution: string;
  release: string;
  kernel: string;
  architecture: string;
  cpuManufacturer: string;
  cpuBrand: string;
  physicalCores: number;
  logicalCores: number;
}

export interface Alarm {
  id: string;
  name: string;
  detail: string;
  state: AlarmState;
  updatedAt: string;
}
