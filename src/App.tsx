import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  fetchDashboardData,
  type DashboardData
} from "./api";
import { Icon } from "./components/Icons";
import { LineChart } from "./components/LineChart";
import { MetricCard } from "./components/MetricCard";
import { Sidebar } from "./components/Sidebar";
import type { Alarm, ChartPoint, SummaryMetric } from "./types";

const automaticRefreshMs = 15_000;

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / 1024 ** unitIndex;

  return `${value.toFixed(unitIndex >= 3 ? 1 : 0)} ${units[unitIndex]}`;
}

function formatUptime(totalSeconds: number): string {
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);

  return [
    days > 0 ? `${days}d` : "",
    hours > 0 ? `${hours}h` : "",
    `${minutes}m`
  ].filter(Boolean).join(" ");
}

function historyToChart(
  history: DashboardData["history"],
  value: (point: DashboardData["history"][number]) => number
): ChartPoint[] {
  return history.map((point) => ({
    label: new Date(point.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    }),
    value: value(point)
  }));
}

function DashboardLoading() {
  return (
    <div className="state-panel" role="status">
      <span className="state-spinner" />
      <h2>Loading live metrics</h2>
      <p>Connecting to the local Express monitoring API…</p>
    </div>
  );
}

function App() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const activeRequests = useRef(0);

  const loadDashboard = useCallback(async (signal?: AbortSignal) => {
    activeRequests.current += 1;
    setIsRefreshing(true);

    try {
      const nextData = await fetchDashboardData(signal);
      setData(nextData);
      setError(null);
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === "AbortError") {
        return;
      }

      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load monitoring data"
      );
    } finally {
      activeRequests.current -= 1;
      if (activeRequests.current === 0) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadDashboard(controller.signal);

    const refreshTimer = window.setInterval(() => {
      void loadDashboard();
    }, automaticRefreshMs);

    return () => {
      controller.abort();
      window.clearInterval(refreshTimer);
    };
  }, [loadDashboard]);

  const summaryMetrics = useMemo<SummaryMetric[]>(() => {
    if (!data) return [];

    const { metrics, system } = data;
    const isHealthy = metrics.health === "healthy";

    return [
      {
        label: "CPU usage",
        value: `${metrics.cpuUsagePercent.toFixed(1)}%`,
        detail: `${metrics.cpuUserPercent.toFixed(1)}% user · ${metrics.cpuSystemPercent.toFixed(1)}% system`,
        icon: "⌁",
        tone: "blue",
        percent: metrics.cpuUsagePercent
      },
      {
        label: "Memory",
        value: `${metrics.memoryUsagePercent.toFixed(1)}%`,
        detail: `${formatBytes(metrics.memoryUsedBytes)} of ${formatBytes(metrics.memoryTotalBytes)}`,
        icon: "▤",
        tone: "purple",
        percent: metrics.memoryUsagePercent
      },
      {
        label: "Disk usage",
        value: `${metrics.diskUsagePercent.toFixed(1)}%`,
        detail: `${formatBytes(metrics.diskAvailableBytes)} available on ${metrics.diskMount}`,
        icon: "◫",
        tone: "orange",
        percent: metrics.diskUsagePercent
      },
      {
        label: "System health",
        value: isHealthy ? "Healthy" : "Degraded",
        detail: `Live metrics from ${system.hostname}`,
        icon: isHealthy ? "✓" : "!",
        tone: isHealthy ? "green" : "orange",
        percent: 100
      }
    ];
  }, [data]);

  const cpuHistory = useMemo(
    () => data ? historyToChart(data.history, (point) => point.cpuUsagePercent) : [],
    [data]
  );
  const networkHistory = useMemo(
    () => data
      ? historyToChart(data.history, (point) => point.networkMegabytesPerSecond)
      : [],
    [data]
  );
  const networkChartMax = Math.max(
    1,
    ...networkHistory.map((point) => point.value * 1.2)
  );

  const alarms: Alarm[] = data?.alarms ?? [];
  const issueCount = data
    ? data.alarmSummary.warning + data.alarmSummary.alarm
    : 0;
  const lastUpdated = data ? new Date(data.receivedAt) : null;

  return (
    <div className="app-shell">
      <Sidebar />
      <main>
        <header className="topbar">
          <div>
            <p className="eyebrow">Infrastructure / EC2</p>
            <h1>Instance overview</h1>
          </div>
          <div className="topbar-actions">
            <button className="icon-button" aria-label="View alerts">
              <Icon name="bell" />
              {issueCount > 0 && <span className="notification-dot" />}
            </button>
            <button
              className="refresh-button"
              disabled={isRefreshing}
              onClick={() => void loadDashboard()}
            >
              <span className={isRefreshing ? "spinning" : ""}>
                <Icon name="refresh" />
              </span>
              {isRefreshing ? "Refreshing" : "Refresh"}
            </button>
          </div>
        </header>

        <div className="dashboard">
          {error && (
            <div className="error-banner" role="alert">
              <div>
                <strong>Monitoring API unavailable</strong>
                <span>{error}. Make sure `npm run dev:backend` is running.</span>
              </div>
              <button disabled={isRefreshing} onClick={() => void loadDashboard()}>
                Retry
              </button>
            </div>
          )}

          {!data ? (
            <DashboardLoading />
          ) : (
            <>
              <section className="instance-banner">
                <div className="instance-main">
                  <span className="server-avatar"><Icon name="server" /></span>
                  <div>
                    <div className="instance-title">
                      <h2>{data.instance.name}</h2>
                      <span className="status-pill">
                        <span />{data.instance.state}
                      </span>
                    </div>
                    <p>
                      {data.instance.id} · {data.instance.type} ·{" "}
                      {data.instance.availabilityZone}
                    </p>
                  </div>
                </div>
                <div className="last-updated">
                  <span>Last updated</span>
                  <strong>
                    {lastUpdated?.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit"
                    })}
                  </strong>
                </div>
              </section>

              <section className="metric-grid" aria-label="Instance metrics">
                {summaryMetrics.map((metric) => (
                  <MetricCard key={metric.label} metric={metric} />
                ))}
              </section>

              <section className="chart-grid">
                <article className="panel chart-panel">
                  <div className="panel-heading">
                    <div>
                      <h3>CPU utilization</h3>
                      <p>Live rolling history from the last hour</p>
                    </div>
                    <strong>{data.metrics.cpuUsagePercent.toFixed(1)}%</strong>
                  </div>
                  <LineChart
                    color="#4c9aff"
                    data={cpuHistory}
                    maxValue={100}
                    suffix="%"
                  />
                </article>

                <article className="panel chart-panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Network traffic</h3>
                      <p>Combined inbound and outbound throughput</p>
                    </div>
                    <strong>
                      {data.metrics.networkMegabytesPerSecond.toFixed(2)} MB/s
                    </strong>
                  </div>
                  <LineChart
                    color="#a47bff"
                    data={networkHistory}
                    maxValue={networkChartMax}
                    suffix=" MB/s"
                  />
                </article>
              </section>

              <section className="lower-grid">
                <article className="panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Instance details</h3>
                      <p>EC2 identity and live local system information</p>
                    </div>
                  </div>
                  <dl className="details-grid">
                    <div><dt>Instance type</dt><dd>{data.instance.type}</dd></div>
                    <div>
                      <dt>Operating system</dt>
                      <dd>{data.system.distribution} {data.system.release}</dd>
                    </div>
                    <div><dt>Region</dt><dd>{data.instance.region}</dd></div>
                    <div><dt>Availability zone</dt><dd>{data.instance.availabilityZone}</dd></div>
                    <div><dt>Private IPv4</dt><dd>{data.instance.privateIp}</dd></div>
                    <div><dt>Public IPv4</dt><dd>{data.instance.publicIp}</dd></div>
                    <div><dt>Uptime</dt><dd>{formatUptime(data.metrics.uptimeSeconds)}</dd></div>
                    <div>
                      <dt>Processor</dt>
                      <dd>{data.system.cpuManufacturer} {data.system.cpuBrand}</dd>
                    </div>
                  </dl>
                </article>

                <article className="panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Health & alarms</h3>
                      <p>Thresholds calculated from live metrics</p>
                    </div>
                    <span className={`all-clear ${issueCount === 0 ? "healthy" : ""}`}>
                      {data.alarmSummary.ok} healthy · {issueCount} issues
                    </span>
                  </div>
                  <div className="alarm-list">
                    {alarms.map((alarm) => (
                      <div className="alarm-row" key={alarm.id}>
                        <span className={`alarm-icon ${alarm.state.toLowerCase()}`}>
                          {alarm.state === "OK" ? "✓" : "!"}
                        </span>
                        <div><strong>{alarm.name}</strong><p>{alarm.detail}</p></div>
                        <span className={`alarm-state ${alarm.state.toLowerCase()}`}>
                          {alarm.state}
                        </span>
                      </div>
                    ))}
                  </div>
                </article>
              </section>

              <p className="data-source">
                Live mode · Auto-refreshes every 15 seconds · {data.system.hostname}
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
