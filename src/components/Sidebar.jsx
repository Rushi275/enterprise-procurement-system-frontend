import { NavLink } from "react-router-dom";
import { LayoutGrid, Home, ClipboardList, Truck, CreditCard, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/orders", label: "Orders", icon: ClipboardList },
  { to: "/track", label: "Track order", icon: Truck },
  { to: "/payment", label: "Payment", icon: CreditCard },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="w-60 shrink-0 bg-ink text-white/90 flex flex-col h-screen sticky top-0">
      <div className="px-6 py-6 border-b border-ink-border/60">
        <div className="font-display font-semibold text-lg tracking-tight text-white">
          Procure<span className="text-signal">.</span>
        </div>
        <div className="text-xs text-white/40 mt-0.5">Enterprise Procurement</div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-signal text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-ink-border/60">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="h-8 w-8 rounded-full bg-signal/20 text-signal flex items-center justify-center text-sm font-semibold font-display">
            {user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0">
            <div className="text-sm text-white truncate">{user?.name ?? user?.email}</div>
            <div className="text-[11px] text-white/40">{user?.role}</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/60 hover:bg-white/5 hover:text-white transition-colors"
        >
          <LogOut size={17} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
