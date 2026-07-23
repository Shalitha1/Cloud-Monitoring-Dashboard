import { Icon } from "./Icons";

const navigation = [
  { label: "Overview", icon: "overview" as const, active: true },
  { label: "Metrics", icon: "metrics" as const },
  { label: "Alarms", icon: "alarms" as const },
  { label: "Logs", icon: "logs" as const },
  { label: "Settings", icon: "settings" as const }
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <a className="brand" href="#" aria-label="EC2 Monitor home">
        <span className="brand-mark"><Icon name="server" /></span>
        <span>EC2 Monitor</span>
      </a>

      <nav aria-label="Dashboard navigation">
        {navigation.map((item) => (
          <a
            className={`nav-link ${item.active ? "active" : ""}`}
            href={`#${item.label.toLowerCase()}`}
            key={item.label}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </a>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className="live-dot" />
        <div>
          <strong>System operational</strong>
          <span>Updated just now</span>
        </div>
      </div>
    </aside>
  );
}
