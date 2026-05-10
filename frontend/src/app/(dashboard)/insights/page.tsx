"use client";

import { useEffect, useState } from "react";

import { Card } from "../../../components/ui/Card";
import { api } from "../../../lib/api";
import type { Dashboard } from "../../../types";

const TEAL = "#28ebc0";
const MUTED = "#6b8f80";

export default function InsightsPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.dashboard().then(setDashboard).catch((err) => setError(err instanceof Error ? err.message : "Unable to load insights"));
  }, []);

  return (
    <div style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: TEAL, marginBottom: "0.5rem" }}>
          Decision Intelligence
        </div>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#fff", margin: "0 0 0.25rem 0", letterSpacing: "-0.02em" }}>Insights</h1>
        <p style={{ color: MUTED, margin: 0, fontSize: "0.9rem" }}>Plain-English explanations from your extracted evidence.</p>
      </div>

      {error && <p style={{ color: "#ff6b6b", marginBottom: "1rem" }}>{error}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
        <Card>
          <div style={{ fontSize: "0.75rem", color: MUTED }}>Income months</div>
          <strong style={{ fontSize: "1.8rem", color: "#fff" }}>{dashboard?.income_trends.length ?? 0}</strong>
        </Card>
        <Card>
          <div style={{ fontSize: "0.75rem", color: MUTED }}>Anomalies</div>
          <strong style={{ fontSize: "1.8rem", color: "#fff" }}>{dashboard?.flagged_anomalies.length ?? 0}</strong>
        </Card>
      </div>

      <Card>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#fff", margin: "0 0 1rem 0" }}>Recommendations</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {(dashboard?.recommendations ?? []).map((item) => (
            <p key={item} style={{ color: MUTED, fontSize: "0.9rem", margin: 0 }}>{item}</p>
          ))}
          {!dashboard?.recommendations.length && <p style={{ color: MUTED, fontSize: "0.9rem", margin: 0 }}>Upload evidence to generate insights.</p>}
        </div>
      </Card>
    </div>
  );
}