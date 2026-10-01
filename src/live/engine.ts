// Simulated real-time event stream: new orders, revenue ticks, notifications.
// Framework-free data generation; the React binding lives in LiveContext.tsx.
import type { Order, OrderStatus } from "../data/mock";

export type NotificationKind = "order" | "refund" | "system" | "team";

export interface Notification {
  id: number;
  kind: NotificationKind;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const FIRST = ["Ayesha", "Bilal", "Chen", "Dania", "Ethan", "Fatima", "Hina", "Ivan", "Lena", "Maria", "Noman", "Olivia", "Rania", "Tania", "Yusuf", "Zara"];
const LAST = ["Khan", "Ahmed", "Malik", "Raza", "Sheikh", "Butt", "Hussain", "Farooq", "Ali", "Iqbal", "Nawaz", "Javed", "Aziz", "Siddiqui"];
const PRODUCTS: Array<[string, string]> = [
  ["Aurora Laptop 14", "Hardware"],
  ["Nimbus Keyboard", "Accessories"],
  ["Vertex Monitor 27", "Hardware"],
  ["Pulse Headphones", "Accessories"],
  ["Cloud Suite Pro", "Software"],
  ["Forge IDE License", "Software"],
  ["Atlas Desk Chair", "Furniture"],
  ["Orbit Desk Lamp", "Furniture"],
];
const REGIONS = ["North America", "Europe", "Middle East", "Asia Pacific", "Latin America"];

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

function weightedStatus(): OrderStatus {
  const r = Math.random();
  if (r < 0.45) return "pending";
  if (r < 0.7) return "approved";
  return "shipped";
}

export function makeLiveOrder(seq: number): Order {
  const first = pick(FIRST);
  const last = pick(LAST);
  const [product, category] = pick(PRODUCTS);
  return {
    id: `ORD-${seq}`,
    customer: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
    product,
    category,
    region: pick(REGIONS),
    amount: Math.round((49 + Math.random() * 2400) * 100) / 100,
    status: weightedStatus(),
    date: new Date().toISOString().slice(0, 10),
  };
}

export function nowTime(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function summarizeOrders(fresh: Order[], seq: { notif: number }): Notification {
  const total = fresh.reduce((s, o) => s + o.amount, 0);
  const big = fresh.some((o) => o.amount > 1800);
  return {
    id: seq.notif++,
    kind: big ? "system" : "order",
    title: big ? "High-value order flagged" : `${fresh.length} new order${fresh.length > 1 ? "s" : ""} received`,
    body: big
      ? `${fresh.find((o) => o.amount > 1800)?.id} for $${total.toLocaleString("en-US", { maximumFractionDigits: 0 })} needs review.`
      : `Total $${total.toLocaleString("en-US", { maximumFractionDigits: 0 })} across ${fresh.length} order${fresh.length > 1 ? "s" : ""}.`,
    time: nowTime(),
    read: false,
  };
}

export function randomAmbient(seq: { notif: number }): Notification | null {
  const r = Math.random();
  if (r < 0.12) {
    return { id: seq.notif++, kind: "refund", title: "Refund issued", body: `ORD-${50000 - Math.floor(Math.random() * 9000)} was refunded by a manager.`, time: nowTime(), read: false };
  }
  if (r < 0.2) {
    return { id: seq.notif++, kind: "team", title: "Teammate active", body: `${pick(FIRST)} ${pick(LAST)} is reviewing pending orders.`, time: nowTime(), read: false };
  }
  return null;
}
