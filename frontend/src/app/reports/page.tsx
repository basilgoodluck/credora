"use client";

import { useEffect, useState } from "react";

import { Protected } from "../../components/AuthProvider";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { api } from "../../lib/api";
import type { Dashboard } from "../../types";

export default function ReportsPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  useEffect(() => { api.dashboard().then(setDashboard).catch(() => null); }, []);
  return (
    <Protected>
      <div className="page">
        <div className="page-head"><div><div className="eyebrow">Lender-Ready Output</div><h1>Reports</h1><p>Credibility summaries, risk memos, and evidence-backed recommendations.</p></div><Button>Export report</Button></div>
        <div className="grid-3">
          {["Credit credibility report", "Fraud investigation memo", "Evidence audit packet"].map((title, idx) => (
            <Card key={title}>
              <div className="section-head"><h2>{title}</h2><Badge tone="good">Ready</Badge></div>
              <p className="muted">{idx === 0 ? dashboard?.lender_readiness : "Generated from uploaded evidence, case history, and score snapshots."}</p>
              <div className="mini-list"><div><span>Last generated</span><strong>Today</strong></div><div><span>Pages</span><strong>{8 + idx * 3}</strong></div></div>
            </Card>
          ))}
        </div>
      </div>
    </Protected>
  );
}
