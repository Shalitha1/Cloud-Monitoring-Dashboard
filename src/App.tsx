import { useState } from "react";
import { alarms, cpuHistory, instance, networkHistory, summaryMetrics } from "./mockData";
import { Icon } from "./components/Icons";
import { LineChart } from "./components/LineChart";
import { MetricCard } from "./components/MetricCard";
import { Sidebar } from "./components/Sidebar";

function App() {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = () => {
    setIsRefreshing(true);
    window.setTimeout(() => {
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 550);
  };

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
            <button className="icon-button" aria-label="View alerts"><Icon name="bell" /><span className="notification-dot" /></button>
            <button className="refresh-button" disabled={isRefreshing} onClick={refresh}>
              <span className={isRefreshing ? "spinning" : ""}><Icon name="refresh" /></span>
              {isRefreshing ? "Refreshing" : "Refresh"}
            </button>
          </div>
        </header>

        <div className="dashboard">
          <section className="instance-banner">
            <div className="instance-main">
              <span className="server-avatar"><Icon name="server" /></span>
              <div>
                <div className="instance-title">
                  <h2>{instance.name}</h2>
                  <span className="status-pill"><span />Running</span>
                </div>
                <p>{instance.id} · {instance.type} · {instance.availabilityZone}</p>
              </div>
            </div>
            <div className="last-updated">
              <span>Last updated</span>
              <strong>{lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</strong>
            </div>
          </section>

          <section className="metric-grid" aria-label="Instance metrics">
            {summaryMetrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)}
          </section>

          <section className="chart-grid">
            <article className="panel chart-panel">
              <div className="panel-heading">
                <div><h3>CPU utilization</h3><p>Average utilization over the last hour</p></div>
                <strong>38.6%</strong>
              </div>
              <LineChart color="#4c9aff" data={cpuHistory} suffix="%" />
            </article>
            <article className="panel chart-panel">
              <div className="panel-heading">
                <div><h3>Network traffic</h3><p>Combined inbound and outbound traffic</p></div>
                <strong>5.2 MB/s</strong>
              </div>
              <LineChart color="#a47bff" data={networkHistory} suffix="" />
            </article>
          </section>

          <section className="lower-grid">
            <article className="panel">
              <div className="panel-heading"><div><h3>Instance details</h3><p>Configuration and runtime information</p></div></div>
              <dl className="details-grid">
                <div><dt>Instance type</dt><dd>{instance.type}</dd></div>
                <div><dt>Operating system</dt><dd>{instance.operatingSystem}</dd></div>
                <div><dt>Region</dt><dd>{instance.region}</dd></div>
                <div><dt>Availability zone</dt><dd>{instance.availabilityZone}</dd></div>
                <div><dt>Private IPv4</dt><dd>{instance.privateIp}</dd></div>
                <div><dt>Public IPv4</dt><dd>{instance.publicIp}</dd></div>
                <div><dt>Uptime</dt><dd>{instance.uptime}</dd></div>
                <div><dt>Monitoring</dt><dd><span className="inline-status" />Enabled</dd></div>
              </dl>
            </article>

            <article className="panel">
              <div className="panel-heading">
                <div><h3>Health & alarms</h3><p>Current monitoring checks</p></div>
                <span className="all-clear">2 healthy · 1 warning</span>
              </div>
              <div className="alarm-list">
                {alarms.map((alarm) => (
                  <div className="alarm-row" key={alarm.name}>
                    <span className={`alarm-icon ${alarm.state.toLowerCase()}`}>{alarm.state === "OK" ? "✓" : "!"}</span>
                    <div><strong>{alarm.name}</strong><p>{alarm.detail}</p></div>
                    <span className={`alarm-state ${alarm.state.toLowerCase()}`}>{alarm.state}</span>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <p className="mock-notice">
            Demo mode · Metrics shown here are local mock data
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
