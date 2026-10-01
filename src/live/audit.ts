// Tiny external store for the audit trail (admin actions). Persisted to localStorage,
// consumed via useSyncExternalStore so every subscriber re-renders on change.
import { useSyncExternalStore } from "react";

export interface AuditEntry {
  id: number;
  time: string;
  actor: string;
  action: string;
  details: string;
}

const KEY = "pulseboard-audit";
const MAX = 200;

function load(): AuditEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AuditEntry[]) : [];
  } catch {
    return [];
  }
}

let entries: AuditEntry[] = load();
const listeners = new Set<() => void>();

function emit() {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function logAudit(actor: string, action: string, details: string) {
  entries = [
    {
      id: Date.now() + Math.random(),
      time: new Date().toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      actor,
      action,
      details,
    },
    ...entries,
  ].slice(0, MAX);
  emit();
}

export function clearAudit() {
  entries = [];
  emit();
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function getSnapshot(): AuditEntry[] {
  return entries;
}

export function useAuditLog(): AuditEntry[] {
  return useSyncExternalStore(subscribe, getSnapshot);
}
