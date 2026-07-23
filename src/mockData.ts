import type { Alarm, ChartPoint, SummaryMetric } from "./types";

export const instance = {
  name: "production-web-01",
  id: "i-0a12bc345de678f90",
  type: "t3.small",
  region: "ap-south-1",
  availabilityZone: "ap-south-1a",
  privateIp: "10.0.1.24",
  publicIp: "13.232.84.117",
  operatingSystem: "Ubuntu 24.04 LTS",
  uptime: "12d 8h 34m"
};

export const summaryMetrics: SummaryMetric[] = [
  {
    label: "CPU usage",
    value: "38.6%",
    detail: "8% below last hour",
    icon: "⌁",
    tone: "blue",
    percent: 38.6
  },
  {
    label: "Memory",
    value: "62.4%",
    detail: "1.28 GB of 2.0 GB",
    icon: "▤",
    tone: "purple",
    percent: 62.4
  },
  {
    label: "Disk usage",
    value: "54.1%",
    detail: "8.7 GB available",
    icon: "◫",
    tone: "orange",
    percent: 54.1
  },
  {
    label: "Instance health",
    value: "Healthy",
    detail: "All checks passed",
    icon: "✓",
    tone: "green",
    percent: 100
  }
];

export const cpuHistory: ChartPoint[] = [
  { label: "09:00", value: 25 },
  { label: "09:10", value: 34 },
  { label: "09:20", value: 30 },
  { label: "09:30", value: 52 },
  { label: "09:40", value: 41 },
  { label: "09:50", value: 46 },
  { label: "10:00", value: 39 }
];

export const networkHistory: ChartPoint[] = [
  { label: "09:00", value: 28 },
  { label: "09:10", value: 42 },
  { label: "09:20", value: 36 },
  { label: "09:30", value: 58 },
  { label: "09:40", value: 45 },
  { label: "09:50", value: 68 },
  { label: "10:00", value: 52 }
];

export const alarms: Alarm[] = [
  {
    name: "Instance status check",
    detail: "2/2 checks passed",
    state: "OK"
  },
  {
    name: "CPU utilization",
    detail: "Threshold: CPU > 80% for 5 minutes",
    state: "OK"
  },
  {
    name: "Disk utilization",
    detail: "Approaching 60% warning threshold",
    state: "WARNING"
  }
];
