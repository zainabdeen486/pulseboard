import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { categoryShare, formatMoney, kpis, orders, regionRevenue, revenueTrend, STATUS_STYLES } from "../data/mock";
import { useLive } from "../live/LiveContext";
import { useTheme } from "../theme";
import { Badge, Card, CardHeader, KpiCard, PageHeader } from "../components/ui";

const PIE_COLORS = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#8b5cf6"];

function LiveToggle() {
  const { live, toggleLive } = useLive();
  return (
    <button
      onClick={toggleLive}
      title={live ? "Pause the live data stream" : "Resume the live data stream"}
      className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
        live
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300"
          : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
      }`}
    >
      <span className="relative flex h-2 w-2">
        {live && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${live ? "bg-emerald-500" : "bg-slate-400"}`} />
      </span>
      {live ? "Live" : "Paused"}
    </button>
  );
}

export function Dashboard() {
  const { live, liveOrders, revenueDelta, ordersDelta } = useLive();
  const { theme } = useTheme();
  const dark = theme === "dark";
  const grid = dark ? "#1e293b" : "#e2e8f0";
  const tick = dark ? "#64748b" : "#94a3b8";
  const tooltipStyle = dark
    ? { backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, fontSize: 12 }
    : { fontSize: 12 };

  const trend = useMemo(() => {
    if (!live || (revenueDelta === 0 && ordersDelta === 0)) return revenueTrend;
    const last = revenueTrend[revenueTrend.length - 1];
    return [
      ...revenueTrend,
      { month: "Now", revenue: last.revenue + Math.round(revenueDelta), orders: last.orders + ordersDelta },
    ];
  }, [live, revenueDelta, ordersDelta]);

  const recent = useMemo(() => [...liveOrders, ...orders].slice(0, 6), [liveOrders]);
  const liveIds = useMemo(() => new Set(liveOrders.map((o) => o.id)), [liveOrders]);

  const liveKpis = useMemo(
    () =>
      kpis.map((k) => {
        if (k.label === "Total Revenue" && revenueDelta > 0)
          return { ...k, value: formatMoney(284590 + revenueDelta) };
        if (k.label === "Orders" && ordersDelta > 0)
          return { ...k, value: (3842 + ordersDelta).toLocaleString("en-US") };
        return k;
      }),
    [revenueDelta, ordersDelta],
  );

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={live ? "Streaming live — new orders land every few seconds." : "Business performance at a glance — last 90 days."}
        action={<LiveToggle />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {liveKpis.map((k) => (
          <KpiCard key={k.label} label={k.label} value={k.value} delta={k.delta} spark={k.spark} />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Revenue trend" subtitle={live ? "Monthly revenue vs order volume — live tail" : "Monthly revenue vs order volume"} />
          <div className="h-72 px-2 py-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke={tick} />
                <YAxis tick={{ fontSize: 12 }} stroke={tick} tickFormatter={(v: number) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value, name) => [
                    name === "revenue" ? formatMoney(Number(value ?? 0)) : `${value ?? ""}`,
                    name === "revenue" ? "Revenue" : "Orders",
                  ]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2.5} fill="url(#rev)" />
                <Area type="monotone" dataKey="orders" stroke="#0ea5e9" strokeWidth={2} fill="none" strokeDasharray="5 5" />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Orders by category" subtitle="Distribution of the last 128 orders" />
          <div className="h-72 px-2 py-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryShare} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {categoryShare.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Recent orders" subtitle={live ? "Live feed — newest first" : "Latest activity across all regions"} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  <th className="px-5 py-3 font-semibold">Order</th>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((o) => {
                  const isLive = liveIds.has(o.id);
                  return (
                    <tr
                      key={o.id}
                      className={`border-t border-slate-100 transition dark:border-slate-800 ${
                        isLive ? "bg-emerald-50/70 dark:bg-emerald-950/25" : "hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <td className="px-5 py-3 font-medium text-slate-900 dark:text-slate-100">
                        <span className="flex items-center gap-2">
                          {isLive && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />}
                          {o.id}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{o.customer}</td>
                      <td className="px-5 py-3">
                        <Badge className={STATUS_STYLES[o.status]}>{o.status}</Badge>
                      </td>
                      <td className="px-5 py-3 text-right font-medium text-slate-900 dark:text-slate-100">{formatMoney(o.amount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader title="Revenue by region" subtitle="Top performing markets" />
          <div className="h-64 px-2 py-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionRevenue} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} horizontal={false} />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke={tick} width={95} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatMoney(Number(value ?? 0)), "Revenue"]} />
                <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                  {regionRevenue.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
