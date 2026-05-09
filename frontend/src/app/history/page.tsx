"use client";

import { useEffect, useState } from "react";

import { Protected } from "../../components/AuthProvider";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { api } from "../../lib/api";
import type { HistoryResponse } from "../../types";

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.history().then(setHistory).catch((err) => setError(err instanceof Error ? err.message : "Unable to load history"));
  }, []);

  return (
    <Protected>
      <div className="page mobile-page">
        <div className="page-head">
          <div>
            <div className="eyebrow">Evidence Ledger</div>
            <h1>History</h1>
            <p>Your evidence, extracted activity, and score changes.</p>
          </div>
        </div>
        {error ? <p className="error">{error}</p> : null}
        <div className="two-column">
          <Card>
            <h2>Evidence</h2>
            <div className="mini-list">
              {(history?.evidence ?? []).map((item) => (
                <div key={item.id}>
                  <span>
                    {item.detected_source ?? "Processing"}
                    <small>{new Date(item.created_at).toLocaleString()}</small>
                  </span>
                  <Badge tone={item.flags.length ? "warn" : "good"}>{item.status}</Badge>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h2>Extracted activity</h2>
            <div className="mini-list">
              {(history?.events ?? []).map((item) => (
                <div key={item.id}>
                  <span>
                    {item.event_type}
                    <small>{item.occurred_at ? new Date(item.occurred_at).toLocaleDateString() : "Date not found"}</small>
                  </span>
                  <strong>{item.amount ? `${item.currency} ${item.amount}` : ""}</strong>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Protected>
  );
}
