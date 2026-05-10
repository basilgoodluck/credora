"use client";

import { useEffect, useState } from "react";

import { Card } from "../../../components/ui/Card";
import { api } from "../../../lib/api";
import type { Dashboard } from "../../../types";

const TEXT_MAIN = "#0B1220";
const TEXT_MUTED = "#2c4a3e";
const BORDER = "rgba(0,0,0,0.08)";

export default function InsightsPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.dashboard().then(setDashboard).catch((err) => setError(err instanceof Error ? err.message : "Unable to load insights"));
  }, []);

  return (
    <div style={{ padding: "1rem", width: "100%" }}>
      {error && <p style={{ color: "#ff6b6b", marginBottom: "1rem" }}>{error}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
        <Card style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12 }}>
          <div style={{ fontSize: "0.75rem", color: TEXT_MUTED }}>Income months</div>
          <strong style={{ fontSize: "1.8rem", color: TEXT_MAIN }}>{dashboard?.income_trends.length ?? 0}</strong>
        </Card>
        <Card style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12 }}>
          <div style={{ fontSize: "0.75rem", color: TEXT_MUTED }}>Anomalies</div>
          <strong style={{ fontSize: "1.8rem", color: TEXT_MAIN }}>{dashboard?.flagged_anomalies.length ?? 0}</strong>
        </Card>
      </div>

      <Card style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12 }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, color: TEXT_MAIN, margin: "0 0 0.8rem 0" }}>Recommendations</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {(dashboard?.recommendations ?? []).map((item) => (
            <p key={item} style={{ color: TEXT_MUTED, fontSize: "0.9rem", margin: 0 }}>{item}</p>
          ))}
          {!dashboard?.recommendations.length && <p style={{ color: TEXT_MUTED, fontSize: "0.9rem", margin: 0 }}>Upload evidence to generate insights.</p>}
        </div>
      </Card>
    </div>
  );
}