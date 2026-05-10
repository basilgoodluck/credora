"use client";

import { useEffect, useState } from "react";

import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { api } from "../../../lib/api";
import type { HistoryResponse } from "../../../types";

const TEXT_MAIN = "#0B1220";
const TEXT_MUTED = "#2c4a3e";
const BORDER = "rgba(0,0,0,0.08)";

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.history().then(setHistory).catch((err) => setError(err instanceof Error ? err.message : "Unable to load history"));
  }, []);

  return (
    <div style={{ padding: "1rem", width: "100%" }}>
      {error && <p style={{ color: "#ff6b6b", marginBottom: "1rem" }}>{error}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <Card style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12 }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, color: TEXT_MAIN, margin: "0 0 1rem 0" }}>Evidence</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {(history?.evidence ?? []).map((item) => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${BORDER}`, paddingBottom: "0.5rem" }}>
                <div>
                  <div style={{ fontWeight: 500, color: TEXT_MAIN }}>{item.detected_source ?? "Processing"}</div>
                  <small style={{ color: TEXT_MUTED, fontSize: "0.7rem" }}>{new Date(item.created_at).toLocaleString()}</small>
                </div>
                <Badge tone={item.flags.length ? "warn" : "good"}>{item.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12 }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, color: TEXT_MAIN, margin: "0 0 1rem 0" }}>Extracted activity</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {(history?.events ?? []).map((item) => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${BORDER}`, paddingBottom: "0.5rem" }}>
                <div>
                  <div style={{ fontWeight: 500, color: TEXT_MAIN }}>{item.event_type}</div>
                  <small style={{ color: TEXT_MUTED, fontSize: "0.7rem" }}>{item.occurred_at ? new Date(item.occurred_at).toLocaleDateString() : "Date not found"}</small>
                </div>
                <strong style={{ color: TEXT_MAIN }}>{item.amount ? `${item.currency} ${item.amount}` : ""}</strong>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}