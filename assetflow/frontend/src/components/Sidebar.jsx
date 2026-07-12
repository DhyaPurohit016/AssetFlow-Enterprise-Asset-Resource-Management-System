import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Building2, Boxes, ArrowLeftRight, CalendarClock,
  Wrench, ClipboardCheck, BarChart3, Bell, HelpCircle,
} from "lucide-react";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/organization", label: "Organization Setup", icon: Building2 },
  { to: "/assistant", label: "AI Assistant", icon: HelpCircle },
  { to: "/assets", label: "Assets", icon: Boxes },
  { to: "/allocation", label: "Allocation & Transfer", icon: ArrowLeftRight },
  { to: "/booking", label: "Resource Booking", icon: CalendarClock },
  { to: "/maintenance", label: "Maintenance", icon: Wrench },
  { to: "/audit", label: "Audit", icon: ClipboardCheck },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/notifications", label: "Notifications", icon: Bell },
];

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 border-r border-surface-700 bg-surface-900/60 flex flex-col">
      <div className="px-5 py-5 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-sage-500 flex items-center justify-center text-surface-950 font-display font-bold text-sm">
          AF
        </div>
        <span className="font-display font-semibold text-ink-50">AssetFlow</span>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${isActive
                ? "bg-sage-900 text-sage-400 font-medium"
                : "text-ink-400 hover:text-ink-50 hover:bg-surface-800"
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 text-xs text-ink-600 border-t border-surface-700">AssetFlow v1.0 — MVP build</div>
    </aside>
  );
}
