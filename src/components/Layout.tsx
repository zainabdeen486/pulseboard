import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, ScrollText, ShoppingCart, Users, Gauge, Command } from "lucide-react";
import { ROLE_BADGE, ROLE_LABELS, useAuth, type Permission } from "../auth/AuthContext";
import { ThemeToggle } from "../theme";
import { NotificationsBell } from "./NotificationsBell";
import { CommandPalette } from "./CommandPalette";
import { logAudit } from "../live/audit";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  permission?: Permission;
}

const NAV: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, permission: "view_reports" },
  { to: "/orders", label: "Orders", icon: ShoppingCart, permission: "view_reports" },
  { to: "/team", label: "Team", icon: Users, permission: "manage_team" },
  { to: "/audit", label: "Audit Log", icon: ScrollText },
];

export function Layout() {
  const { user, logout, can } = useAuth();
  const navigate = useNavigate();
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleLogout = () => {
    if (user) logAudit(user.name, "Signed out", `Role: ${ROLE_LABELS[user.role]}`);
    logout();
    navigate("/login");
  };

  const visibleNav = NAV.filter((item) => !item.permission || can(item.permission));

  return (
    <div className="flex min-h-screen">
      {/* sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-slate-900 md:flex dark:bg-black">
        <div className="flex items-center gap-2.5 px-5 py-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Gauge size={20} />
          </span>
          <span className="text-lg font-bold tracking-tight text-white">PulseBoard</span>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {visibleNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-800 p-4">
          <p className="truncate text-sm font-medium text-white">{user?.name}</p>
          <p className="truncate text-xs text-slate-400">{user?.email}</p>
        </div>
      </aside>

      {/* main */}
      <div className="flex min-h-screen flex-1 flex-col md:pl-60">
        {/* mobile top bar */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden dark:border-slate-800 dark:bg-slate-950">
          <span className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Gauge size={18} />
            </span>
            PulseBoard
          </span>
          <nav className="flex gap-1">
            {visibleNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `rounded-lg p-2 ${isActive ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300" : "text-slate-500 dark:text-slate-400"}`
                }
                aria-label={item.label}
              >
                <item.icon size={18} />
              </NavLink>
            ))}
          </nav>
        </div>

        {/* header */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6 dark:border-slate-800 dark:bg-slate-950/90">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Welcome back, <span className="font-semibold text-slate-800 dark:text-slate-100">{user?.name?.split(" ")[0]}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPaletteOpen(true)}
              className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-400 transition hover:bg-slate-50 hover:text-slate-600 sm:flex dark:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              title="Open command palette"
            >
              <Command size={14} />
              <span className="flex gap-0.5">
                <kbd className="rounded border border-slate-200 bg-slate-50 px-1 font-sans font-semibold dark:border-slate-700 dark:bg-slate-800">⌘</kbd>
                <kbd className="rounded border border-slate-200 bg-slate-50 px-1 font-sans font-semibold dark:border-slate-700 dark:bg-slate-800">K</kbd>
              </span>
            </button>
            <NotificationsBell />
            <ThemeToggle />
            {user && (
              <span className={`hidden rounded-full px-2.5 py-1 text-xs font-semibold sm:inline ${ROLE_BADGE[user.role]}`}>
                {ROLE_LABELS[user.role]}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <LogOut size={15} /> <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
