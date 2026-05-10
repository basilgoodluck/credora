"use client";

import { useEffect, useState } from "react";

import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { api } from "../../../lib/api";
import type { InvestigationCase } from "../../../types";

const TEXT_MAIN = "#0B1220";
const TEXT_MUTED = "#2c4a3e";
const TEAL = "#28ebc0";
const BORDER = "rgba(0,0,0,0.08)";

export default function CasesPage() {
  const [cases, setCases] = useState<InvestigationCase[]>([]);
  useEffect(() => { api.cases().then(setCases).catch(() => null); }, []);
  return (
    <div style={{ padding: "1rem", width: "100%" }}>
      {/* Cases grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
        {cases.map((item) => (
          <Card key={item.id} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 600, color: TEXT_MAIN, margin: 0 }}>{item.title}</h2>
              <Badge tone={item.risk_score > 75 ? "bad" : item.risk_score > 50 ? "warn" : "good"}>{item.risk_score}</Badge>
            </div>
            <p style={{ fontSize: "0.8rem", color: TEXT_MUTED, marginBottom: "0.75rem", lineHeight: 1.5 }}>{item.summary}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", borderTop: `1px solid ${BORDER}`, paddingTop: "0.6rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: TEXT_MUTED, fontSize: "0.7rem" }}>{item.case_number} <span style={{ color: TEXT_MUTED }}>· {item.category}</span></span>
                <strong style={{ color: TEXT_MAIN, fontSize: "0.7rem", fontWeight: 600 }}>{item.status}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: TEXT_MUTED, fontSize: "0.7rem" }}>Priority</span>
                <strong style={{ color: TEXT_MAIN, fontSize: "0.7rem", fontWeight: 600 }}>{item.priority}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: TEXT_MUTED, fontSize: "0.7rem" }}>Exposure</span>
                <strong style={{ color: TEXT_MAIN, fontSize: "0.7rem", fontWeight: 600 }}>{item.amount ? `${item.currency} ${item.amount}` : "N/A"}</strong>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}