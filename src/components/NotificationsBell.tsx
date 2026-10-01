import { useEffect, useRef, useState } from "react";
import { Bell, RotateCcw, ShoppingCart, Users, Zap, type LucideIcon } from "lucide-react";
import { useLive } from "../live/LiveContext";
import type { NotificationKind } from "../live/engine";

const KIND_ICON: Record<NotificationKind, LucideIcon> = {
  order: ShoppingCart,
  refund: RotateCcw,
  system: Zap,
  team: Users,
};

const KIND_STYLE: Record<NotificationKind, string> = {
  order: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300",
  refund: "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300",
  system: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300",
  team: "bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300",
};

export function NotificationsBell() {
  const { notifications, unreadCount, markAllRead } = useLive();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open ]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        title="Notifications"
        className="relative rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notifications</p>
            <button
              onClick={markAllRead}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
            >
              Mark all read
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="px-4 py-10 text-center text-sm text-slate-500">
                Nothing yet — turn on the live stream and events will appear here.
              </p>
            )}
            {notifications.map((n) => {
              const Icon = KIND_ICON[n.kind];
              return (
                <div
                  key={n.id}
                  className={`flex gap-3 border-b border-slate-50 px-4 py-3 last:border-0 dark:border-slate-800/60 ${
                    n.read ? "opacity-60" : ""
                  }`}
                >
                  <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${KIND_STYLE[n.kind]}`}>
                    <Icon size={15} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{n.title}</p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">{n.body}</p>
                    <p className="mt-0.5 text-[10px] text-slate-400">{n.time}</p>
                  </div>
                  {!n.read && <span className="ml-auto mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-600" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
