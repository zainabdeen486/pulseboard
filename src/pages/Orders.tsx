import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Check, RotateCcw } from "lucide-react";
import { formatMoney, orders as seedOrders, STATUS_STYLES, type Order, type OrderStatus } from "../data/mock";
import { useAuth } from "../auth/AuthContext";
import { Badge, Card, PageHeader } from "../components/ui";
import { DataTable } from "../components/DataTable";

const STATUS_OPTIONS: Array<OrderStatus | "all"> = ["all", "pending", "approved", "shipped", "refunded", "cancelled"];

export function Orders() {
  const { can } = useAuth();
  const [orders, setOrders] = useState<Order[]>(seedOrders);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const canEdit = can("edit_orders");

  const setStatus = (id: string, status: OrderStatus) =>
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));

  const filtered = useMemo(
    () => (statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter)),
    [orders, statusFilter],
  );

  const columns = useMemo<ColumnDef<Order>[]>(() => {
    const cols: ColumnDef<Order>[] = [
      { accessorKey: "id", header: "Order ID", cell: (c) => <span className="font-medium text-slate-900">{c.getValue<string>()}</span> },
      {
        accessorKey: "customer",
        header: "Customer",
        cell: (c) => (
          <div>
            <p className="font-medium text-slate-800">{c.getValue<string>()}</p>
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
        cell: (c) => <span className="font-semibold text-slate-900">{formatMoney(c.getValue<number>())}</span>,
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
                  className="rounded-md bg-emerald-100 p-1.5 text-emerald-700 hover:bg-emerald-200"
                >
                  <Check size={15} />
                </button>
              )}
              {order.status !== "refunded" && order.status !== "cancelled" && (
                <button
                  onClick={() => setStatus(order.id, "refunded")}
                  title="Refund order"
                  className="rounded-md bg-rose-100 p-1.5 text-rose-700 hover:bg-rose-200"
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
        subtitle={canEdit ? "Search, filter and manage orders." : "Read-only view — sign in as manager or admin to take actions."}
        action={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 outline-none focus:border-indigo-400"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s === "all" ? "All statuses" : s}
              </option>
            ))}
          </select>
        }
      />
      <Card>
        <DataTable data={filtered} columns={columns} searchPlaceholder="Search orders, customers, products…" />
      </Card>
    </div>
  );
}
