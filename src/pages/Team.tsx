import { useState } from "react";
import { team as seedTeam, MEMBER_STATUS_STYLES, type TeamMember, type TeamRole } from "../data/mock";
import { useAuth } from "../auth/AuthContext";
import { logAudit } from "../live/audit";
import { AccessDenied, Badge, Card, PageHeader } from "../components/ui";
import { DataTable } from "../components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";

const ROLE_OPTIONS: TeamRole[] = ["admin", "manager", "support"];

export function Team() {
  const { user, can } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>(seedTeam);

  if (!can("manage_team")) {
    return <AccessDenied what="Team management" />;
  }

  const setRole = (id: string, role: TeamRole) => {
    const member = members.find((m) => m.id === id);
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));
    if (user && member && member.role !== role)
      logAudit(user.name, `Role changed: ${member.name}`, `${member.role} → ${role}`);
  };

  const toggleSuspend = (id: string) => {
    const member = members.find((m) => m.id === id);
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, status: m.status === "suspended" ? "active" : "suspended" } : m,
      ),
    );
    if (user && member)
      logAudit(
        user.name,
        member.status === "suspended" ? `Reactivated ${member.name}` : `Suspended ${member.name}`,
        `Team member ${member.email}`,
      );
  };

  const columns: ColumnDef<TeamMember>[] = [
    {
      accessorKey: "name",
      header: "Member",
      cell: (c) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
            {c.getValue<string>().split(" ").map((w) => w[0]).slice(0, 2).join("")}
          </span>
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-100">{c.getValue<string>()}</p>
            <p className="text-xs text-slate-400">{c.row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: (c) => (
        <select
          value={c.getValue<TeamRole>()}
          onChange={(e) => setRole(c.row.original.id, e.target.value as TeamRole)}
          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium capitalize text-slate-700 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r} className="capitalize">{r}</option>
          ))}
        </select>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (c) => <Badge className={MEMBER_STATUS_STYLES[c.getValue<TeamMember["status"]>()]}>{c.getValue<string>()}</Badge>,
    },
    { accessorKey: "lastActive", header: "Last active" },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: (c) => {
        const m = c.row.original;
        const suspended = m.status === "suspended";
        return (
          <button
            onClick={() => toggleSuspend(m.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
              suspended
                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300"
                : "bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/40 dark:text-rose-300"
            }`}
          >
            {suspended ? "Reactivate" : "Suspend"}
          </button>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader title="Team" subtitle="Manage roles and access. Admins only." />
      <Card>
        <DataTable data={members} columns={columns} searchPlaceholder="Search team members…" />
      </Card>
    </div>
  );
}
