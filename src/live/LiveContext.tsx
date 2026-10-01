import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Order } from "../data/mock";
import { makeLiveOrder, nowTime, randomAmbient, summarizeOrders, type Notification, type NotificationKind } from "./engine";

interface LiveContextValue {
  live: boolean;
  toggleLive: () => void;
  liveOrders: Order[];
  notifications: Notification[];
  unreadCount: number;
  revenueDelta: number;
  ordersDelta: number;
  markAllRead: () => void;
  notify: (kind: NotificationKind, title: string, body: string) => void;
}

const LiveContext = createContext<LiveContextValue | null>(null);

const TICK_MS = 2500;

export function LiveProvider({ children }: { children: ReactNode }) {
  const [live, setLive] = useState(true);
  const [liveOrders, setLiveOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [revenueDelta, setRevenueDelta] = useState(0);
  const [ordersDelta, setOrdersDelta] = useState(0);
  const seq = useRef({ order: 60000, notif: 1 });

  useEffect(() => {
    if (!live) return;
    const timer = setInterval(() => {
      const n = 1 + Math.floor(Math.random() * 3);
      const fresh = Array.from({ length: n }, () => makeLiveOrder(seq.current.order++));
      setLiveOrders((prev) => [...fresh, ...prev].slice(0, 60));
      setRevenueDelta((d) => d + fresh.reduce((s, o) => s + o.amount, 0));
      setOrdersDelta((d) => d + fresh.length);
      setNotifications((prev) => {
        const ambient = randomAmbient(seq.current);
        const batch = [summarizeOrders(fresh, seq.current), ...(ambient ? [ambient] : [])];
        return [...batch, ...prev].slice(0, 30);
      });
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [live]);

  const toggleLive = useCallback(() => setLive((v) => !v), []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const notify = useCallback((kind: NotificationKind, title: string, body: string) => {
    setNotifications((prev) =>
      [{ id: seq.current.notif++, kind, title, body, time: nowTime(), read: false }, ...prev].slice(0, 30),
    );
  }, []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const value = useMemo(
    () => ({ live, toggleLive, liveOrders, notifications, unreadCount, revenueDelta, ordersDelta, markAllRead, notify }),
    [live, toggleLive, liveOrders, notifications, unreadCount, revenueDelta, ordersDelta, markAllRead, notify],
  );

  return <LiveContext.Provider value={value}>{children}</LiveContext.Provider>;
}

export function useLive(): LiveContextValue {
  const ctx = useContext(LiveContext);
  if (!ctx) throw new Error("useLive must be used inside LiveProvider");
  return ctx;
}
