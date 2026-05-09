"use client";

import { useEffect, useState } from "react";

import { Protected } from "../../components/AuthProvider";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { api } from "../../lib/api";
import type { InvestigationCase } from "../../types";

export default function CasesPage() {
  const [cases, setCases] = useState<InvestigationCase[]>([]);
  useEffect(() => { api.cases().then(setCases).catch(() => null); }, []);
  return (
    <Protected>
      <div className="page">
        <div className="page-head"><div><div className="eyebrow">Investigation Queue</div><h1>Cases</h1><p>Active fraud, dispute, KYC, and repayment investigations.</p></div></div>
        <div className="grid-3">
          {cases.map((item) => (
            <Card key={item.id}>
              <div className="section-head"><h2>{item.title}</h2><Badge tone={item.risk_score > 75 ? "bad" : item.risk_score > 50 ? "warn" : "good"}>{item.risk_score}</Badge></div>
              <p className="muted">{item.summary}</p>
              <div className="mini-list">
                <div><span>{item.case_number}<small>{item.category}</small></span><strong>{item.status}</strong></div>
                <div><span>Priority</span><strong>{item.priority}</strong></div>
                <div><span>Exposure</span><strong>{item.amount ? `${item.currency} ${item.amount}` : "N/A"}</strong></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Protected>
  );
}
