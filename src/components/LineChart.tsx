import type { ChartPoint } from "../types";

interface LineChartProps {
  data: ChartPoint[];
  color: string;
  suffix: string;
  maxValue?: number;
}

export function LineChart({ data, color, suffix, maxValue }: LineChartProps) {
  const width = 600;
  const height = 190;
  const paddingX = 14;
  const paddingY = 18;
  const max = Math.max(maxValue ?? 100, 0.01);
  const pointDivisor = Math.max(data.length - 1, 1);
  const points = data
    .map((point, index) => {
      const x = paddingX + (index / pointDivisor) * (width - paddingX * 2);
      const y = height - paddingY - (point.value / max) * (height - paddingY * 2);
      return `${x},${y}`;
    })
    .join(" ");
  const area = `${paddingX},${height - paddingY} ${points} ${width - paddingX},${height - paddingY}`;
  const gradientId = `area-${color.replace("#", "")}`;
  const axisLabels = [1, 0.75, 0.5, 0.25, 0].map((ratio) => {
    const value = max * ratio;
    return `${Number(value.toFixed(max < 10 ? 2 : 0))}${suffix}`;
  });

  return (
    <div className="chart-wrap">
      <div className="y-labels" aria-hidden="true">
        {axisLabels.map((label) => <span key={label}>{label}</span>)}
      </div>
      <svg
        aria-label={`Metric history ending at ${data[data.length - 1].value}${suffix}`}
        className="line-chart"
        preserveAspectRatio="none"
        role="img"
        viewBox={`0 0 ${width} ${height}`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity=".24" />
            <stop offset="100%" stopColor={color} stopOpacity=".01" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3, 4].map((line) => (
          <line
            className="grid-line"
            key={line}
            x1="0"
            x2={width}
            y1={paddingY + line * ((height - paddingY * 2) / 4)}
            y2={paddingY + line * ((height - paddingY * 2) / 4)}
          />
        ))}
        <polygon fill={`url(#${gradientId})`} points={area} />
        <polyline fill="none" points={points} stroke={color} strokeWidth="3" vectorEffect="non-scaling-stroke" />
        {data.map((point, index) => {
          const x = paddingX + (index / pointDivisor) * (width - paddingX * 2);
          const y = height - paddingY - (point.value / max) * (height - paddingY * 2);
          return <circle cx={x} cy={y} fill="#111c2d" key={point.label} r="4" stroke={color} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />;
        })}
      </svg>
      <div className="x-labels">
        {data.map((point) => <span key={point.label}>{point.label}</span>)}
      </div>
    </div>
  );
}
