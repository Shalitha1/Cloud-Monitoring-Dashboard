import type { Alarm, MetricSnapshot } from "../types.js";

function stateFor(
  value: number,
  warningThreshold: number,
  alarmThreshold: number
): Alarm["state"] {
  if (value >= alarmThreshold) return "ALARM";
  if (value >= warningThreshold) return "WARNING";
  return "OK";
}

export function createLiveAlarms(snapshot: MetricSnapshot): Alarm[] {
  const updatedAt = new Date().toISOString();

  return [
    {
      id: "local-collector",
      name: "Local metrics collector",
      detail: "The API successfully collected system metrics",
      state: "OK",
      updatedAt
    },
    {
      id: "cpu-utilization",
      name: "CPU utilization",
      detail: `${snapshot.cpuUsagePercent}% used · warning at 70% · alarm at 85%`,
      state: stateFor(snapshot.cpuUsagePercent, 70, 85),
      updatedAt
    },
    {
      id: "memory-utilization",
      name: "Memory utilization",
      detail: `${snapshot.memoryUsagePercent}% used · warning at 75% · alarm at 90%`,
      state: stateFor(snapshot.memoryUsagePercent, 75, 90),
      updatedAt
    },
    {
      id: "disk-utilization",
      name: "Disk utilization",
      detail: `${snapshot.diskUsagePercent}% used · warning at 75% · alarm at 90%`,
      state: stateFor(snapshot.diskUsagePercent, 75, 90),
      updatedAt
    }
  ];
}
