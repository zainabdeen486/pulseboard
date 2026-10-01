import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CornerDownLeft,
  LayoutDashboard,
  LogOut,
  Moon,
  ScrollText,
  Search,
  ShoppingCart,
  Sun,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { useLive } from "../live/LiveContext";
import { useTheme } from "../theme";
import { bigOrders, formatMoney, type Order } from "../data/mock";

interface Item {
  id: string;
  section: string;
  label: string;
  hint?: string;
  icon: LucideIcon;
  run: () => void;
}

// Precomputed search index over the 50k-row dataset (built once).
const SEARCH_INDEX = bigOrders.map((o) => ({
  order: o,
  hay: `${o.id} ${o.customer} ${o.product} ${o.email}`.toLowerCase(),
}));

function searchOrders(q: string): Order[] {
  const needle = q.trim().toLowerCase();
  if (needle.length < 2) return [];
  const out: Order[] = [];
  for (const { order, hay } of SEARCH_INDEX) {
    if (hay.includes(needle)) {
      out.push(order);
      if (out.length >= 8) break;
    }
  }
  return out;
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const { can, logout, user } = useAuth();
  const { live, toggleLive } = useLive();
  const { theme, toggle } = useTheme();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open ]);

  const go = (to: string) => () => {
    onClose();
    navigate(to);
  };

  const items = useMemo<Item[]>(() => {
    const list: Item[] = [
      { id: "nav-dash", section: "Navigate", label: "Go to Dashboard", icon: LayoutDashboard, run: go("/") },
      { id: "nav-orders", section: "Navigate", label: "Go to Orders", icon: ShoppingCart, run: go("/orders") },
      { id: "nav-audit", section: "Navigate", label: "Go to Audit Log", icon: ScrollText, run: go("/audit") },
    ];
    if (can("manage_team")) {
      list.push({ id: "nav-team", section: "Navigate", label: "Go to Team", icon: Users, run: go("/team") });
    }
    list.push(
      {
        id: "act-live",
        section: "Actions",
        label: live ? "Pause live data stream" : "Resume live data stream",
        hint: live ? "On" : "Off",
        icon: Zap,
        run: () => {
          toggleLive();
          onClose();
        },
      },
      {
        id: "act-theme",
        section: "Actions",
        label: `Switch to ${theme === "dark" ? "light" : "dark"} mode`,
        icon: theme === "dark" ? Sun : Moon,
        run: () => {
          toggle();
          onClose();
        },
      },
      {
        id: "act-signout",
        section: "Actions",
        label: `Sign out (${user?.name ?? "guest"})`,
        icon: LogOut,
        run: () => {
          onClose();
          logout();
          navigate("/login");
        },
      },
    );

    const q = query.trim().toLowerCase();
    const filtered = list.filter((i) => !q || i.label.toLowerCase().includes(q));

    if (q.length >= 2) {
      for (const o of searchOrders(q)) {
        filtered.push({
          id: `order-${o.id}`,
          section: "Orders",
          label: `${o.id} — ${o.customer}`,
          hint: formatMoney(o.amount),
          icon: ShoppingCart,
          run: go(`/orders?q=${encodeURIComponent(o.id)}`),
        });
      }
    }
    return filtered;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, can, live, theme, user]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => (a + 1) % Math.max(items.length, 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => (a - 1 + items.length) % Math.max(items.length, 1));
      } else if (e.key === "Enter" && items[active]) {
        e.preventDefault();
        items[active].run();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, items, active, onClose]);

  if (!open) return null;

  let lastSection = "";
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-24" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 dark:border-slate-800">
          <Search size={17} className="shrink-0 text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, actions, orders…"
            className="w-full bg-transparent py-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
          />
          <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 dark:border-slate-700 dark:bg-slate-800">
            ESC
          </kbd>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {items.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-slate-500">No results for “{query}”.</p>
          )}
          {items.map((item, i) => {
            const header =
              item.section !== lastSection ? (
                <p key={`s-${item.section}`} className="px-3 pb-1 pt-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {item.section}
                </p>
              ) : null;
            lastSection = item.section;
            const Icon = item.icon;
            return (
              <div key={item.id}>
                {header}
                <button
                  onMouseEnter={() => setActive(i)}
                  onClick={() => item.run()}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                    i === active ? "bg-indigo-600 text-white" : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon size={16} className={i === active ? "text-white" : "text-slate-400"} />
                  <span className="flex-1 truncate font-medium">{item.label}</span>
                  {item.hint && (
                    <span className={`text-xs ${i === active ? "text-indigo-100" : "text-slate-400"}`}>{item.hint}</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 border-t border-slate-100 px-4 py-2.5 text-[11px] text-slate-400 dark:border-slate-800">
          <span className="flex items-center gap-1"><CornerDownLeft size={12} /> select</span>
          <span>↑↓ navigate</span>
          <span className="ml-auto">PulseBoard command palette</span>
        </div>
      </div>
    </div>
  );
}
