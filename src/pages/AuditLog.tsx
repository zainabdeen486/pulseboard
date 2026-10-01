import { ScrollText, Trash2 } from "lucide-react";
import { clearAudit, useAuditLog } from "../live/audit";
import { useAuth } from "../auth/AuthContext";
import { Card, CardHeader, EmptyState, PageHeader } from "../components/ui";

export function AuditLog() {
  const entries = useAuditLog();
  const { can } = useAuth();

  return (
    <div>
      <PageHeader
        title="Audit Log"
        subtitle="Every privileged action in this workspace — who did what, and when."
        action={
          can("manage_team") && entries.length > 0 ? (
            <button
              onClick={clearAudit}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Trash2 size={15} /> Clear log
            </button>
          ) : undefined
        }
      />
      <Card>
        <CardHeader title="Activity trail" subtitle={`${entries.length} recorded event${entries.length === 1 ? "" : "s"}`} />
        {entries.length === 0 ? (
          <EmptyState
            title="No audit events yet"
            hint="Approve an order, change a team role, or sign in again — actions are recorded here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="bg-slate-50/70 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
                  <th className="px-5 py-3 font-semibold">Time</th>
                  <th className="px-5 py-3 font-semibold">Actor</th>
                  <th className="px-5 py-3 font-semibold">Action</th>
                  <th className="px-5 py-3 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-t border-slate-100 hover:bg-slate-50/60 dark:border-slate-800 dark:hover:bg-slate-800/40">
                    <td className="whitespace-nowrap px-5 py-3 text-xs text-slate-500 dark:text-slate-400">{e.time}</td>
                    <td className="whitespace-nowrap px-5 py-3 font-medium text-slate-900 dark:text-slate-100">{e.actor}</td>
                    <td className="whitespace-nowrap px-5 py-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                        <ScrollText size={12} />
                        {e.action}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{e.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
