import { createContext, useContext, useState, type ReactNode } from "react";

export type Role = "admin" | "manager" | "viewer";

export interface DemoUser {
  name: string;
  email: string;
  role: Role;
}

export type Permission = "manage_team" | "edit_orders" | "view_reports";

const ROLE_USERS: Record<Role, DemoUser> = {
  admin: { name: "Zain Ul Abdeen", email: "zain@example.com", role: "admin" },
  manager: { name: "Sara Mehmood", email: "sara@example.com", role: "manager" },
  viewer: { name: "Guest Viewer", email: "guest@example.com", role: "viewer" },
};

interface AuthContextValue {
  user: DemoUser | null;
  login: (role: Role) => void;
  logout: () => void;
  can: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(() => {
    try {
      const raw = sessionStorage.getItem("pulseboard-user");
      return raw ? (JSON.parse(raw) as DemoUser) : null;
    } catch {
      return null;
    }
  });

  const login = (role: Role) => {
    const u = ROLE_USERS[role];
    setUser(u);
    sessionStorage.setItem("pulseboard-user", JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("pulseboard-user");
  };

  const can = (permission: Permission): boolean => {
    if (!user) return false;
    if (user.role === "admin") return true;
    if (user.role === "manager") return permission === "edit_orders" || permission === "view_reports";
    return permission === "view_reports";
  };

  return <AuthContext.Provider value={{ user, login, logout, can }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrator",
  manager: "Manager",
  viewer: "Viewer",
};

export const ROLE_BADGE: Record<Role, string> = {
  admin: "bg-indigo-100 text-indigo-800",
  manager: "bg-sky-100 text-sky-800",
  viewer: "bg-slate-200 text-slate-700",
};
