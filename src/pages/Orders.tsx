import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Check, RotateCcw } from "lucide-react";
import { bigOrders, formatMoney, STATUS_STYLES, type Order, type OrderStatus } from "../data/mock";
import { useAuth } from "../auth/AuthContext";
import { useLive } from "../live/LiveContext";
import { logAudit } from "../live/audit";
import { Badge, Card, PageHeader } from "../components/ui";
import { VirtualDataTable } from "../components/VirtualDataTable";

const STATUS_OPTIONS: Array<OrderStatus | "all"> = ["all", "pending", "approved", "shipped", "refunded", "cancelled"];

export function Orders() {
  const { user, can } = useAuth();
  const { live, liveOrders, toggleLive, notify } = useLive();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [overrides, setOverrides] = useState<Record<string, OrderStatus>>({});
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const canEdit = can("edit_orders");

  const setStatus = (id: string, status: OrderStatus) => {
    setOverrides((prev) => ({ ...prev, [id]: status }));
    if (user) logAudit(user.name, `Order ${id} → ${status}`, "Changed via the Orders table");
    notify(
      status === "refunded" ? "refund" : "order",
      `Order ${id} ${status}`,
      status === "refunded" ? "Refund processed and logged." : "Status updated and logged to the audit trail.",
    );
  };

  const data = useMemo(() => {
    const base = [...liveOrders, ...bigOrders];
    const applied =
      Object.keys(overrides).length > 0
        ? base.map((o) => (overrides[o.id] ? { ...o, status: overrides[o.id] } : o))
        : base;
    return statusFilter === "all" ? applied : applied.filter((o) => o.status === statusFilter);
  }, [liveOrders, overrides, statusFilter]);

  const columns = useMemo<ColumnDef<Order>[]>(() => {
    const cols: ColumnDef<Order>[] = [
      { accessorKey: "id", header: "Order ID", cell: (c) => <span className="font-medium text-slate-900 dark:text-slate-100">{c.getValue<string>()}</span> },
      {
        accessorKey: "customer",
        header: "Customer",
        cell: (c) => (
          <div>
            <p className="font-medium text-slate-800 dark:text-slate-200">{c.getValue<string>()}</p>
            <p className="text-xs text-slate-400">{c.row.original.email}</p>
          </div>
        ),
      },
      { accessorKey: "product", header: "Product" },
      { accessorKey: "category", header: "Category" },
      { accessorKey: "region", header: "Region" },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: (c) => <span className="font-semibold text-slate-900 dark:text-slate-100">{formatMoney(c.getValue<number>())}</span>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (c) => <Badge className={STATUS_STYLES[c.getValue<OrderStatus>()]}>{c.getValue<string>()}</Badge>,
      },
      { accessorKey: "date", header: "Date" },
    ];
    if (canEdit) {
      cols.push({
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: (c) => {
          const order = c.row.original;
          return (
            <div className="flex gap-1.5">
              {order.status === "pending" && (
                <button
                  onClick={() => setStatus(order.id, "approved")}
                  title="Approve order"
                  className="rounded-md bg-emerald-100 p-1.5 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300"
                >
                  <Check size={15} />
                </button>
              )}
              {order.status !== "refunded" && order.status !== "cancelled" && (
                <button
                  onClick={() => setStatus(order.id, "refunded")}
                  title="Refund order"
                  className="rounded-md bg-rose-100 p-1.5 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/40 dark:text-rose-300"
                >
                  <RotateCcw size={15} />
                </button>
              )}
            </div>
          );
        },
      });
    }
    return cols;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canEdit]);

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle={
          canEdit
            ? "50,000 orders · virtualized for instant scroll — new live orders stream in on top."
            : "Read-only view — sign in as manager or admin to take actions."
        }
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLive}
              title={live ? "Pause the live order stream" : "Resume the live order stream"}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                live
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              <span className="relative flex h-2 w-2">
                {live && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />}
                <span className={`relative inline-flex h-2 w-2 rounded-full ${live ? "bg-emerald-500" : "bg-slate-400"}`} />
              </span>
              {live ? "Live" : "Paused"}
            </button>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s} className="capitalize">
                  {s === "all" ? "All statuses" : s}
                </option>
              ))}
            </select>
          </div>
        }
      />
      <Card>
        <VirtualDataTable
          key={initialQuery}
          data={data}
          columns={columns}
          searchPlaceholder="Search 50,000 orders, customers, products…"
          initialGlobalFilter={initialQuery}
        />
      </Card>
    </div>
  );
}
