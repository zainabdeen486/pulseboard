import { useNavigate } from "react-router-dom";
import { Gauge, ShieldCheck, Briefcase, Eye } from "lucide-react";
import { ROLE_LABELS, useAuth, type Role } from "../auth/AuthContext";
import { logAudit } from "../live/audit";

const OPTIONS: Array<{ role: Role; icon: typeof ShieldCheck; blurb: string }> = [
  { role: "admin", icon: ShieldCheck, blurb: "Full access — manage orders, team and settings." },
  { role: "manager", icon: Briefcase, blurb: "Approve and refund orders. Team section is hidden." },
  { role: "viewer", icon: Eye, blurb: "Read-only — browse dashboards and reports." },
];

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const signIn = (role: Role) => {
    login(role);
    logAudit(ROLE_LABELS[role], "Signed in", `Demo session started as ${ROLE_LABELS[role]}`);
    navigate("/", { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Gauge size={24} />
          </span>
          <span className="text-2xl font-bold tracking-tight text-white">PulseBoard</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
          <h1 className="text-xl font-bold text-white">Demo sign in</h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Pick a role to explore the dashboard with different permission levels.
          </p>

          <div className="mt-6 space-y-3">
            {OPTIONS.map((opt) => (
              <button
                key={opt.role}
                onClick={() => signIn(opt.role)}
                className="group flex w-full items-center gap-4 rounded-xl border border-slate-700 bg-slate-800/60 p-4 text-left transition hover:border-indigo-500 hover:bg-slate-800"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600/15 text-indigo-400 transition group-hover:bg-indigo-600 group-hover:text-white">
                  <opt.icon size={20} />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-white">
                    Continue as {ROLE_LABELS[opt.role]}
                  </span>
                  <span className="block text-xs text-slate-400">{opt.blurb}</span>
                </span>
              </button>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            Portfolio demo — no real credentials, session stored locally only.
          </p>
        </div>
      </div>
    </div>
  );
}
