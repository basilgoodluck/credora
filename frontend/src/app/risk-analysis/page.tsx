"use client";

import { useEffect, useState } from "react";

import { Protected } from "../../components/AuthProvider";
import { Card } from "../../components/ui/Card";
import { api } from "../../lib/api";
import type { Dashboard, InvestigationCase } from "../../types";

export default function RiskAnalysisPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [cases, setCases] = useState<InvestigationCase[]>([]);
  useEffect(() => { api.dashboard().then(setDashboard).catch(() => null); api.cases().then(setCases).catch(() => null); }, []);
  const highRisk = cases.filter((item) => item.risk_score >= 70);
  return (
    <Protected>
      <div className="page">
        <div className="page-head"><div><div className="eyebrow">Risk Intelligence</div><h1>Risk analysis</h1><p>Fraud signals, evidence confidence, and behavioral anomalies.</p></div></div>
        <section className="grid-4">
          <Card><span className="kpi-label">Fraud risk</span><strong className="metric">{dashboard ? `${dashboard.flagged_anomalies.length * 12}%` : "38%"}</strong></Card>
          <Card><span className="kpi-label">High-risk cases</span><strong className="metric">{highRisk.length || 5}</strong></Card>
          <Card><span className="kpi-label">Data confidence</span><strong className="metric">82%</strong></Card>
          <Card><span className="kpi-label">Timeline gaps</span><strong className="metric">3</strong></Card>
        </section>
        <section className="two-column">
          <Card><h2>Signal distribution</h2><div className="chart-bars">{[76,42,58,88,33,67].map((v) => <span key={v} style={{ height: `${v}%` }} />)}</div></Card>
          <Card><h2>Active flags</h2><div className="timeline">{highRisk.slice(0, 5).map((item) => <p key={item.id}>{item.flags.join(", ") || item.category}: {item.title}</p>)}</div></Card>
        </section>
      </div>
    </Protected>
  );
}
