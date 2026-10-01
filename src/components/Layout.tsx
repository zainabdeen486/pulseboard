import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, ShoppingCart, Users, Gauge } from "lucide-react";
import { ROLE_BADGE, ROLE_LABELS, useAuth, type Permission } from "../auth/AuthContext";

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
];

export function Layout() {
  const { user, logout, can } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen">
      {/* sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-slate-900 md:flex">
        <div className="flex items-center gap-2.5 px-5 py-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Gauge size={20} />
          </span>
          <span className="text-lg font-bold tracking-tight text-white">PulseBoard</span>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {NAV.filter((item) => !item.permission || can(item.permission)).map((item) => (
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
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <span className="flex items-center gap-2 font-bold text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Gauge size={18} />
            </span>
            PulseBoard
          </span>
          <nav className="flex gap-1">
            {NAV.filter((item) => !item.permission || can(item.permission)).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `rounded-lg p-2 ${isActive ? "bg-indigo-100 text-indigo-700" : "text-slate-500"}`
                }
                aria-label={item.label}
              >
                <item.icon size={18} />
              </NavLink>
            ))}
          </nav>
        </div>

        {/* header */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-6 py-3.5 backdrop-blur">
          <p className="text-sm text-slate-500">
            Welcome back, <span className="font-semibold text-slate-800">{user?.name?.split(" ")[0]}</span>
          </p>
          <div className="flex items-center gap-3">
            {user && (
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ROLE_BADGE[user.role]}`}>
                {ROLE_LABELS[user.role]}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <LogOut size={15} /> Sign out
            </button>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
