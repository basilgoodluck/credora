"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { api } from "../lib/api";
import type { User } from "../types";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const nav = [
  ["Dashboard", "/dashboard", "⌘"],
  ["Cases", "/cases", "◇"],
  ["Upload Evidence", "/upload", "↑"],
  ["Risk Analysis", "/risk-analysis", "△"],
  ["Reports", "/reports", "▣"],
  ["Users", "/users", "◐"],
  ["Settings", "/settings", "⚙"],
];

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.me().then((next) => active && setUser(next)).catch(() => active && setUser(null)).finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      setUser,
      logout: async () => {
        await api.logout();
        setUser(null);
        router.push("/login");
      },
    }),
    [router, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function Protected({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { loading, user } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, router, user]);

  if (loading) {
    return (
      <div className="status-page">
        <div className="skeleton-panel" />
      </div>
    );
  }
  if (!user) return null;
  return <>{children}</>;
}

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const authPath = ["/signup", "/login", "/verify-otp", "/set-password", "/set-pin"].some((path) => pathname.startsWith(path));

  if (!user || authPath) return <main className="auth-main">{children}</main>;

  return (
    <div className="app-frame">
      <aside className="sidebar">
        <button className="brand-block" onClick={() => router.push("/dashboard")}>
          <span>CQ</span>
          <strong>Credit Quotient</strong>
        </button>
        <nav>
          {nav.map(([label, href, icon]) => (
            <button key={href} className={pathname === href ? "active" : ""} onClick={() => router.push(href)}>
              <span>{icon}</span>
              {label}
            </button>
          ))}
        </nav>
      </aside>
      <section className="workspace">
        <header className="workspace-topbar">
          <div className="search-box">Search cases, evidence, reports</div>
          <div className="top-actions">
            <button onClick={() => router.push("/upload")}>Quick upload</button>
            <button aria-label="Notifications">●</button>
            <button className="profile-chip">{user.full_name || user.phone_number}</button>
          </div>
        </header>
        <main>{children}</main>
      </section>
    </div>
  );
}
