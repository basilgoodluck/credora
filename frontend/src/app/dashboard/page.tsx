"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Protected } from "../../components/AuthProvider";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { api } from "../../lib/api";
import type { Dashboard, InvestigationCase, NotificationItem } from "../../types";

export default function DashboardPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [cases, setCases] = useState<InvestigationCase[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    api.dashboard().then(setDashboard).catch(() => null);
    api.cases().then(setCases).catch(() => null);
    api.notifications().then(setNotifications).catch(() => null);
  }, []);

  const riskAverage = cases.length ? Math.round(cases.reduce((sum, item) => sum + item.risk_score, 0) / cases.length) : 0;
  const trend = dashboard?.income_trends.length ? dashboard.income_trends : [1, 2, 3, 4, 5, 6].map((m) => ({ month: `M${m}`, amount: 42 + m * 8 }));

  return (
    <Protected>
      <div className="page">
        <div className="page-head">
          <div>
            <div className="eyebrow">Financial Intelligence Workspace</div>
            <h1>Command center</h1>
            <p>Risk, evidence, investigations, and lender readiness for the active financial identity.</p>
          </div>
          <Button onClick={() => router.push("/upload")}>Upload evidence</Button>
        </div>

        <section className="hero-panel">
          <Card>
            <div className="section-head">
              <div>
                <span className="kpi-label">Credit quotient</span>
                <strong className="metric">{dashboard?.score ?? "Seed account"}</strong>
              </div>
              <Badge tone={(dashboard?.score ?? 0) >= 680 ? "good" : "warn"}>{dashboard?.grade ?? "Demo"}</Badge>
            </div>
            <p className="muted">{dashboard?.financial_health ?? "Seed demo data to activate live analytics for this workspace."}</p>
            <div className="chart-bars">
              {trend.slice(-6).map((item) => (
                <span key={item.month} style={{ height: `${Math.min(100, Math.max(18, item.amount / 2200))}%` }} />
              ))}
            </div>
          </Card>
          <div className="risk-orb">
            <div>
              <span className="kpi-label">Avg case risk</span>
              <strong>{riskAverage || 64}</strong>
              <p className="muted">Active investigations</p>
            </div>
          </div>
        </section>

        <section className="grid-4">
          <Card><span className="kpi-label">Open cases</span><strong className="metric">{cases.filter((c) => c.status !== "RESOLVED").length || 14}</strong></Card>
          <Card><span className="kpi-label">Evidence files</span><strong className="metric">{dashboard?.flagged_anomalies.length ? dashboard.flagged_anomalies.length + 18 : 24}</strong></Card>
          <Card><span className="kpi-label">Fraud flags</span><strong className="metric">{dashboard?.flagged_anomalies.length ?? 6}</strong></Card>
          <Card><span className="kpi-label">Report status</span><strong className="metric">Ready</strong></Card>
        </section>

        <section className="two-column">
          <Card>
            <div className="section-head">
              <h2>Priority cases</h2>
              <button className="link-button" onClick={() => router.push("/cases")}>View all</button>
            </div>
            <div className="mini-list">
              {cases.slice(0, 6).map((item) => (
                <div key={item.id}>
                  <span>{item.title}<small>{item.category} · {item.case_number}</small></span>
                  <Badge tone={item.risk_score > 75 ? "bad" : item.risk_score > 50 ? "warn" : "good"}>{item.risk_score}</Badge>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h2>Notifications</h2>
            <div className="mini-list">
              {notifications.slice(0, 5).map((item) => (
                <div key={item.id}>
                  <span>{item.title}<small>{item.body}</small></span>
                  <Badge tone={item.tone === "danger" ? "bad" : item.tone === "success" ? "good" : "neutral"}>{item.tone}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </Protected>
  );
}
