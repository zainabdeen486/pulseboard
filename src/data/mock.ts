// Deterministic mock data for the PulseBoard demo dashboard.

export type OrderStatus = "pending" | "approved" | "shipped" | "refunded" | "cancelled";

export interface Order {
  id: string;
  customer: string;
  email: string;
  product: string;
  category: string;
  region: string;
  amount: number;
  status: OrderStatus;
  date: string; // ISO
}

export type TeamRole = "admin" | "manager" | "support";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  status: "active" | "invited" | "suspended";
  lastActive: string;
}

export interface Kpi {
  label: string;
  value: string;
  delta: number; // % vs previous period
  spark: number[];
}

// --- seeded rng so the demo is stable between reloads -----------------------
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);
const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];

const FIRST = ["Ayesha", "Bilal", "Chen", "Dania", "Ethan", "Fatima", "George", "Hina", "Ivan", "Javeria", "Khalid", "Lena", "Maria", "Noman", "Olivia", "Pavel", "Qasim", "Rania", "Salman", "Tania"];
const LAST = ["Khan", "Ahmed", "Wei", "Malik", "Smith", "Raza", "Brown", "Sheikh", "Petrov", "Butt", "Hussain", "Garcia", "Farooq", "Ali", "Khan", "Sidorov", "Iqbal", "Nawaz", "Javed", "Aziz"];
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
const STATUSES: OrderStatus[] = ["pending", "approved", "shipped", "refunded", "cancelled"];

function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export const orders: Order[] = Array.from({ length: 128 }, (_, i) => {
  const first = pick(FIRST);
  const last = pick(LAST);
  const [product, category] = pick(PRODUCTS);
  const status = pick(STATUSES);
  return {
    id: `ORD-${(2401 + i).toString()}`,
    customer: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
    product,
    category,
    region: pick(REGIONS),
    amount: Math.round((49 + rand() * 2400) * 100) / 100,
    status,
    date: isoDaysAgo(Math.floor(rand() * 90)),
  };
}).sort((a, b) => (a.date < b.date ? 1 : -1));

export const team: TeamMember[] = [
  { id: "tm-1", name: "Zain Ul Abdeen", email: "zain@example.com", role: "admin", status: "active", lastActive: "2 min ago" },
  { id: "tm-2", name: "Sara Mehmood", email: "sara@example.com", role: "manager", status: "active", lastActive: "14 min ago" },
  { id: "tm-3", name: "Omar Farooq", email: "omar@example.com", role: "manager", status: "active", lastActive: "1 hr ago" },
  { id: "tm-4", name: "Lina Haddad", email: "lina@example.com", role: "support", status: "active", lastActive: "3 hrs ago" },
  { id: "tm-5", name: "David Chen", email: "david@example.com", role: "support", status: "invited", lastActive: "never" },
  { id: "tm-6", name: "Maya Iqbal", email: "maya@example.com", role: "support", status: "suspended", lastActive: "6 days ago" },
];

const spark = (base: number, vol: number, n = 12) =>
  Array.from({ length: n }, () => Math.round(base + (rand() - 0.45) * vol));

export const kpis: Kpi[] = [
  { label: "Total Revenue", value: "$284,590", delta: 12.4, spark: spark(20, 9) },
  { label: "Orders", value: "3,842", delta: 8.1, spark: spark(300, 120) },
  { label: "Active Customers", value: "12,460", delta: 4.7, spark: spark(1000, 260) },
  { label: "Conversion Rate", value: "3.28%", delta: -1.2, spark: spark(3.2, 0.9) },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const revenueTrend = MONTHS.map((m) => ({
  month: m,
  revenue: Math.round(18000 + rand() * 14000),
  orders: Math.round(220 + rand() * 160),
}));

export const categoryShare = ["Hardware", "Software", "Accessories", "Furniture"].map((c) => ({
  name: c,
  value: orders.filter((o) => o.category === c).length,
}));

export const regionRevenue = REGIONS.map((r) => ({
  name: r,
  revenue: Math.round(orders.filter((o) => o.region === r).reduce((s, o) => s + o.amount, 0)),
}));

export const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-blue-100 text-blue-800",
  shipped: "bg-emerald-100 text-emerald-800",
  refunded: "bg-violet-100 text-violet-800",
  cancelled: "bg-rose-100 text-rose-800",
};

export const MEMBER_STATUS_STYLES: Record<TeamMember["status"], string> = {
  active: "bg-emerald-100 text-emerald-800",
  invited: "bg-blue-100 text-blue-800",
  suspended: "bg-rose-100 text-rose-800",
};

export function formatMoney(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
