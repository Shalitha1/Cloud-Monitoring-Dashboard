import os from "node:os";
import si from "systeminformation";
import type {
  HistoryPoint,
  LocalSystemInfo,
  MetricSnapshot
} from "../types.js";

const bytesPerMegabyte = 1024 * 1024;
const cacheDurationMs = 2_000;
const maximumHistoryPoints = 2_016;

let cachedSnapshot: MetricSnapshot | undefined;
let cacheExpiresAt = 0;
let pendingCollection: Promise<MetricSnapshot> | undefined;
const metricHistory: HistoryPoint[] = [];

function round(value: number, decimalPlaces = 1): number {
  const multiplier = 10 ** decimalPlaces;
  return Math.round(value * multiplier) / multiplier;
}

function safeRate(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function selectPrimaryFilesystem(
  filesystems: Awaited<ReturnType<typeof si.fsSize>>
) {
  const usable = filesystems.filter(
    (filesystem) => filesystem.size > 0 && !filesystem.mount.startsWith("/snap/")
  );

  return (
    (os.platform() === "darwin"
      ? usable.find((filesystem) => filesystem.mount === "/System/Volumes/Data")
      : undefined) ??
    usable.find((filesystem) => filesystem.mount === "/") ??
    usable.find((filesystem) => filesystem.rw) ??
    usable[0]
  );
}

function recordHistory(snapshot: MetricSnapshot): void {
  metricHistory.push({
    timestamp: new Date().toISOString(),
    cpuUsagePercent: snapshot.cpuUsagePercent,
    memoryUsagePercent: snapshot.memoryUsagePercent,
    diskUsagePercent: snapshot.diskUsagePercent,
    networkMegabytesPerSecond: snapshot.networkMegabytesPerSecond
  });

  if (metricHistory.length > maximumHistoryPoints) {
    metricHistory.splice(0, metricHistory.length - maximumHistoryPoints);
  }
}

async function readSystemMetrics(): Promise<MetricSnapshot> {
  const [load, memory, filesystems, network] = await Promise.all([
    si.currentLoad(),
    si.mem(),
    si.fsSize(),
    si.networkStats()
  ]);

  const primaryFilesystem = selectPrimaryFilesystem(filesystems);
  const receiveBytesPerSecond = network.reduce(
    (total, item) => total + safeRate(item.rx_sec),
    0
  );
  const transmitBytesPerSecond = network.reduce(
    (total, item) => total + safeRate(item.tx_sec),
    0
  );
  const memoryUsedBytes = Math.max(0, memory.total - memory.available);
  const memoryUsagePercent =
    memory.total > 0 ? (memoryUsedBytes / memory.total) * 100 : 0;
  const diskUsagePercent = primaryFilesystem?.use ?? 0;
  const cpuUsagePercent = safeRate(load.currentLoad);

  return {
    cpuUsagePercent: round(cpuUsagePercent),
    cpuUserPercent: round(safeRate(load.currentLoadUser)),
    cpuSystemPercent: round(safeRate(load.currentLoadSystem)),
    cpuCoreCount: load.cpus.length || os.cpus().length,
    memoryUsagePercent: round(memoryUsagePercent),
    memoryUsedBytes,
    memoryAvailableBytes: memory.available,
    memoryTotalBytes: memory.total,
    diskUsagePercent: round(diskUsagePercent),
    diskUsedBytes: primaryFilesystem?.used ?? 0,
    diskAvailableBytes: primaryFilesystem?.available ?? 0,
    diskTotalBytes: primaryFilesystem?.size ?? 0,
    diskMount: primaryFilesystem?.mount ?? "unavailable",
    networkReceiveBytesPerSecond: Math.round(receiveBytesPerSecond),
    networkTransmitBytesPerSecond: Math.round(transmitBytesPerSecond),
    networkMegabytesPerSecond: round(
      (receiveBytesPerSecond + transmitBytesPerSecond) / bytesPerMegabyte,
      2
    ),
    uptimeSeconds: Math.floor(os.uptime()),
    health:
      cpuUsagePercent >= 90 ||
      memoryUsagePercent >= 90 ||
      diskUsagePercent >= 90
        ? "degraded"
        : "healthy"
  };
}

export async function collectSystemMetrics(): Promise<MetricSnapshot> {
  const now = Date.now();

  if (cachedSnapshot && now < cacheExpiresAt) {
    return cachedSnapshot;
  }

  if (pendingCollection) {
    return pendingCollection;
  }

  pendingCollection = readSystemMetrics()
    .then((snapshot) => {
      cachedSnapshot = snapshot;
      cacheExpiresAt = Date.now() + cacheDurationMs;
      recordHistory(snapshot);
      return snapshot;
    })
    .finally(() => {
      pendingCollection = undefined;
    });

  return pendingCollection;
}

export function getMetricHistory(range: string): HistoryPoint[] {
  const rangeDurations: Record<string, number> = {
    "1h": 60 * 60 * 1_000,
    "6h": 6 * 60 * 60 * 1_000,
    "24h": 24 * 60 * 60 * 1_000,
    "7d": 7 * 24 * 60 * 60 * 1_000
  };
  const minimumTimestamp = Date.now() - (rangeDurations[range] ?? rangeDurations["1h"]!);

  return metricHistory.filter(
    (point) => new Date(point.timestamp).getTime() >= minimumTimestamp
  );
}

export async function collectLocalSystemInfo(): Promise<LocalSystemInfo> {
  const [operatingSystem, cpu] = await Promise.all([si.osInfo(), si.cpu()]);

  return {
    hostname: operatingSystem.hostname || os.hostname(),
    platform: operatingSystem.platform,
    distribution: operatingSystem.distro,
    release: operatingSystem.release,
    kernel: operatingSystem.kernel,
    architecture: operatingSystem.arch,
    cpuManufacturer: cpu.manufacturer,
    cpuBrand: cpu.brand,
    physicalCores: cpu.physicalCores,
    logicalCores: cpu.cores
  };
}
