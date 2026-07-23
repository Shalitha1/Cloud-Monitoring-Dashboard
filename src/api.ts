export type ApiAlarmState = "OK" | "WARNING" | "ALARM";

export interface SystemInfo {
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

export interface InstanceInfo {
  name: string;
  id: string;
  type: string;
  state: string;
  region: string;
  availabilityZone: string;
  privateIp: string;
  publicIp: string;
  operatingSystem: string;
  monitoringEnabled: boolean;
  uptimeSeconds: number;
}

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

export interface MetricHistoryPoint {
  timestamp: string;
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  diskUsagePercent: number;
  networkMegabytesPerSecond: number;
}

export interface ApiAlarm {
  id: string;
  name: string;
  detail: string;
  state: ApiAlarmState;
  updatedAt: string;
}

export interface AlarmSummary {
  ok: number;
  warning: number;
  alarm: number;
}

export interface DashboardData {
  system: SystemInfo;
  instance: InstanceInfo;
  metrics: MetricSnapshot;
  history: MetricHistoryPoint[];
  alarms: ApiAlarm[];
  alarmSummary: AlarmSummary;
  receivedAt: string;
}

interface DataResponse<T> {
  data: T;
  timestamp: string;
}

interface AlarmResponse extends DataResponse<ApiAlarm[]> {
  summary: AlarmSummary;
}

interface ApiErrorResponse {
  error?: {
    message?: string;
  };
}

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const body = (await response.json()) as ApiErrorResponse;
      if (body.error?.message) message = body.error.message;
    } catch {
      // Keep the status-based message when the response is not JSON.
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function fetchDashboardData(
  signal?: AbortSignal
): Promise<DashboardData> {
  const [system, instance, metrics, history, alarms] = await Promise.all([
    fetchJson<DataResponse<SystemInfo>>("/api/system", signal),
    fetchJson<DataResponse<InstanceInfo>>("/api/instance", signal),
    fetchJson<DataResponse<MetricSnapshot>>("/api/metrics/summary", signal),
    fetchJson<DataResponse<MetricHistoryPoint[]>>(
      "/api/metrics/history?range=1h",
      signal
    ),
    fetchJson<AlarmResponse>("/api/alarms", signal)
  ]);

  return {
    system: system.data,
    instance: instance.data,
    metrics: metrics.data,
    history: history.data,
    alarms: alarms.data,
    alarmSummary: alarms.summary,
    receivedAt: metrics.timestamp
  };
}
