"use client";

import { useEffect, useState } from "react";

import { Protected } from "../../components/AuthProvider";
import { Card } from "../../components/ui/Card";
import { api } from "../../lib/api";
import type { Dashboard } from "../../types";

export default function InsightsPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.dashboard().then(setDashboard).catch((err) => setError(err instanceof Error ? err.message : "Unable to load insights"));
  }, []);

  return (
    <Protected>
      <div className="page mobile-page">
        <div className="page-head">
          <div>
            <div className="eyebrow">Decision Intelligence</div>
            <h1>Insights</h1>
            <p>Plain-English explanations from your extracted evidence.</p>
          </div>
        </div>
        {error ? <p className="error">{error}</p> : null}
        <div className="score-grid">
          <Card>
            <span className="kpi-label">Income months</span>
            <strong>{dashboard?.income_trends.length ?? 0}</strong>
          </Card>
          <Card>
            <span className="kpi-label">Anomalies</span>
            <strong>{dashboard?.flagged_anomalies.length ?? 0}</strong>
          </Card>
        </div>
        <Card>
          <h2>Recommendations</h2>
          <div className="reason-grid">
            {(dashboard?.recommendations ?? []).map((item) => (
              <p key={item}>{item}</p>
            ))}
            {!dashboard?.recommendations.length ? <p className="muted">Upload evidence to generate insights.</p> : null}
          </div>
        </Card>
      </div>
    </Protected>
  );
}
