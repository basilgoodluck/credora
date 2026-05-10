"use client";

import { useEffect, useState } from "react";

import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { api } from "../../../lib/api";
import type { HistoryResponse } from "../../../types";

const TEAL = "#28ebc0";
const MUTED = "#6b8f80";

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.history().then(setHistory).catch((err) => setError(err instanceof Error ? err.message : "Unable to load history"));
  }, []);

  return (
    <div style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: TEAL, marginBottom: "0.5rem" }}>
          Evidence Ledger
        </div>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#fff", margin: "0 0 0.25rem 0", letterSpacing: "-0.02em" }}>History</h1>
        <p style={{ color: MUTED, margin: 0, fontSize: "0.9rem" }}>Your evidence, extracted activity, and score changes.</p>
      </div>

      {error && <p style={{ color: "#ff6b6b", marginBottom: "1rem" }}>{error}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <Card>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#fff", margin: "0 0 1rem 0" }}>Evidence</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {(history?.evidence ?? []).map((item) => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "0.5rem" }}>
                <div>
                  <div style={{ fontWeight: 500, color: "#fff" }}>{item.detected_source ?? "Processing"}</div>
                  <small style={{ color: MUTED, fontSize: "0.7rem" }}>{new Date(item.created_at).toLocaleString()}</small>
                </div>
                <Badge tone={item.flags.length ? "warn" : "good"}>{item.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#fff", margin: "0 0 1rem 0" }}>Extracted activity</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {(history?.events ?? []).map((item) => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "0.5rem" }}>
                <div>
                  <div style={{ fontWeight: 500, color: "#fff" }}>{item.event_type}</div>
                  <small style={{ color: MUTED, fontSize: "0.7rem" }}>{item.occurred_at ? new Date(item.occurred_at).toLocaleDateString() : "Date not found"}</small>
                </div>
                <strong style={{ color: "#fff" }}>{item.amount ? `${item.currency} ${item.amount}` : ""}</strong>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}