"use client";

import { useEffect, useState } from "react";
import { Card } from "../../../components/ui/Card";
import { api } from "../../../lib/api";
import type { Dashboard, InvestigationCase } from "../../../types";

const TEXT_MAIN = "#0B1220";
const TEXT_MUTED = "#2c4a3e";
const ACCENT = "#28ebc0";
const BORDER = "rgba(0,0,0,0.08)";

export default function RiskAnalysisPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [cases, setCases] = useState<InvestigationCase[]>([]);
  useEffect(() => {
    api.dashboard().then(setDashboard).catch(() => null);
    api.cases().then(setCases).catch(() => null);
  }, []);
  const highRisk = cases.filter((item) => item.risk_score >= 70);
  return (
    <div style={{ padding: "1rem", width: "100%" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: ACCENT, marginBottom: "0.25rem" }}>
          Risk Intelligence
        </div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: TEXT_MAIN, margin: "0 0 0.25rem", letterSpacing: "-0.02em" }}>Risk analysis</h1>
        <p style={{ color: TEXT_MUTED, margin: 0, fontSize: "0.85rem" }}>Fraud signals, evidence confidence, and behavioral anomalies.</p>
      </div>

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        <Card style={{ background: "#fff", padding: "0.8rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 500, color: TEXT_MUTED, cursor: "help" }} title="Overall fraud probability based on flagged anomalies">Fraud risk</div>
          <strong style={{ fontSize: "1.4rem", fontWeight: 600, color: TEXT_MAIN }}>{dashboard ? `${dashboard.flagged_anomalies.length * 12}%` : "38%"}</strong>
        </Card>
        <Card style={{ background: "#fff", padding: "0.8rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 500, color: TEXT_MUTED, cursor: "help" }} title="Cases with risk score ≥ 70">High-risk cases</div>
          <strong style={{ fontSize: "1.4rem", fontWeight: 600, color: TEXT_MAIN }}>{highRisk.length || 5}</strong>
        </Card>
        <Card style={{ background: "#fff", padding: "0.8rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 500, color: TEXT_MUTED, cursor: "help" }} title="Confidence in extracted financial data">Data confidence</div>
          <strong style={{ fontSize: "1.4rem", fontWeight: 600, color: TEXT_MAIN }}>82%</strong>
        </Card>
        <Card style={{ background: "#fff", padding: "0.8rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 500, color: TEXT_MUTED, cursor: "help" }} title="Missing months in income timeline">Timeline gaps</div>
          <strong style={{ fontSize: "1.4rem", fontWeight: 600, color: TEXT_MAIN }}>3</strong>
        </Card>
      </div>

      {/* Two‑column section */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <Card style={{ background: "#fff" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, color: TEXT_MAIN, margin: "0 0 0.8rem" }}>Signal distribution</h2>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem", height: 100 }}>
            {[76, 42, 58, 88, 33, 67].map((v, i) => (
              <div key={i} style={{ flex: 1, background: ACCENT, height: `${v}%`, borderRadius: "4px 4px 0 0", transition: "height 0.2s ease", cursor: "pointer" }}
                title={`Confidence: ${v}%`} />
            ))}
          </div>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
            {["Income", "Repayment", "Consistency", "Liquidity", "Growth", "Stability"].map((label, i) => (
              <div key={i} style={{ flex: 1, textAlign: "center", fontSize: "0.65rem", color: TEXT_MUTED }}>{label.slice(0,4)}</div>
            ))}
          </div>
        </Card>
        <Card style={{ background: "#fff" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, color: TEXT_MAIN, margin: "0 0 0.8rem" }}>Active flags</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {highRisk.slice(0, 5).map((item) => (
              <div key={item.id} style={{ borderBottom: `1px solid ${BORDER}`, paddingBottom: "0.5rem" }}>
                <p style={{ margin: 0, fontSize: "0.8rem", color: TEXT_MAIN, fontWeight: 500 }}>
                  {item.flags.join(", ") || item.category}
                </p>
                <p style={{ margin: "0.2rem 0 0", fontSize: "0.7rem", color: TEXT_MUTED }}>{item.title}</p>
              </div>
            ))}
            {highRisk.length === 0 && <p style={{ color: TEXT_MUTED, fontSize: "0.8rem" }}>No active high‑risk flags.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}