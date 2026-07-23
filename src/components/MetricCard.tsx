import type { SummaryMetric } from "../types";

export function MetricCard({ metric }: { metric: SummaryMetric }) {
  return (
    <article className="metric-card">
      <div className={`metric-icon ${metric.tone}`}>{metric.icon}</div>
      <div className="metric-heading">
        <span>{metric.label}</span>
        <strong className={metric.tone === "green" ? "healthy-text" : ""}>
          {metric.value}
        </strong>
      </div>
      <div className="progress-track">
        <span
          className={`progress-value ${metric.tone}`}
          style={{ width: `${metric.percent ?? 0}%` }}
        />
      </div>
      <p>{metric.detail}</p>
    </article>
  );
}
