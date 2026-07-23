export type MetricTone = "green" | "blue" | "orange" | "purple";

export interface SummaryMetric {
  label: string;
  value: string;
  detail: string;
  icon: string;
  tone: MetricTone;
  percent?: number;
}

export interface ChartPoint {
  label: string;
  value: number;
}

export interface Alarm {
  name: string;
  detail: string;
  state: "OK" | "WARNING";
}
