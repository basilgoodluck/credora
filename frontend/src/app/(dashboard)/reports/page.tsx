"use client";

import { useEffect, useState } from "react";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { api } from "../../../lib/api";
import type { Dashboard } from "../../../types";

const TEXT_MAIN = "#0B1220";
const TEXT_MUTED = "#2c4a3e";
const ACCENT = "#28ebc0";
const BORDER = "rgba(0,0,0,0.08)";

export default function ReportsPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  useEffect(() => { api.dashboard().then(setDashboard).catch(() => null); }, []);
  return (
    <div style={{ padding: "1rem", width: "100%" }}>
      {/* Page header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: ACCENT, marginBottom: "0.25rem" }}>
            Lender-Ready Output
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: TEXT_MAIN, margin: "0 0 0.25rem", letterSpacing: "-0.02em" }}>Reports</h1>
          <p style={{ color: TEXT_MUTED, margin: 0, fontSize: "0.85rem" }}>Credibility summaries, risk memos, and evidence-backed recommendations.</p>
        </div>
        <Button variant="primary">Export report</Button>
      </div>

      {/* Reports grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
        {["Credit credibility report", "Fraud investigation memo", "Evidence audit packet"].map((title, idx) => (
          <Card key={title} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 600, color: TEXT_MAIN, margin: 0 }}>{title}</h2>
              <Badge tone="good">Ready</Badge>
            </div>
            <p style={{ fontSize: "0.8rem", color: TEXT_MUTED, lineHeight: 1.5, marginBottom: "0.75rem" }}>
              {idx === 0 ? dashboard?.lender_readiness : "Generated from uploaded evidence, case history, and score snapshots."}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", borderTop: `1px solid ${BORDER}`, paddingTop: "0.6rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: TEXT_MUTED, fontSize: "0.7rem" }}>Last generated</span>
                <strong style={{ color: TEXT_MAIN, fontSize: "0.7rem", fontWeight: 600 }}>Today</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: TEXT_MUTED, fontSize: "0.7rem" }}>Pages</span>
                <strong style={{ color: TEXT_MAIN, fontSize: "0.7rem", fontWeight: 600 }}>{8 + idx * 3}</strong>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}