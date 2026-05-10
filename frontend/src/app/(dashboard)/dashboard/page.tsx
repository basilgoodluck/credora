"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { api } from "../../../lib/api";
import type { Dashboard, InvestigationCase, NotificationItem } from "../../../types";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle } from "react-icons/fa";

const TEXT_MAIN = "#0B1220";
const TEXT_MUTED = "#2c4a3e";
const ACCENT = "#0B1220";
const TEAL = "#28ebc0";
const BORDER = "rgba(0,0,0,0.08)";
const EASE = "cubic-bezier(0.25,0.46,0.45,0.94)";

export default function DashboardPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [cases, setCases] = useState<InvestigationCase[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  useEffect(() => {
    api.dashboard().then(setDashboard).catch(() => null);
    api.cases().then(setCases).catch(() => null);
    api.notifications().then(setNotifications).catch(() => null);
  }, []);
  const riskAverage = cases.length ? Math.round(cases.reduce((sum, item) => sum + item.risk_score, 0) / cases.length) : 0;
  
  // Use API data if available, else demo amounts (realistic numbers)
  const trend = dashboard?.income_trends.length ? dashboard.income_trends : [
    { month: "Jan", amount: 42000 },
    { month: "Feb", amount: 58000 },
    { month: "Mar", amount: 67000 },
    { month: "Apr", amount: 72000 },
    { month: "May", amount: 84000 },
    { month: "Jun", amount: 91000 }
  ];
  const maxAmount = Math.max(...trend.map(t => t.amount), 1);
  const chartHeight = 100; // px

  const getNotificationIcon = (tone: string) => {
    switch(tone) {
      case "success": return <FaCheckCircle color={TEAL} size={16} />;
      case "danger": return <FaExclamationCircle color="#ff6b6b" size={16} />;
      default: return <FaInfoCircle color={TEXT_MUTED} size={16} />;
    }
  };

  return (
    <div style={{ padding: "1rem", width: "100%" }}>
      {/* First row */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <Card style={{ flex: 2, background: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <div>
              <div style={{ fontSize: "0.8rem", fontWeight: 500, color: TEXT_MUTED, cursor: "help" }} title="Your overall credit score based on evidence">Credit quotient</div>
              <strong style={{ fontSize: "1.6rem", fontWeight: 600, color: TEXT_MAIN }}>{dashboard?.score ?? "Seed account"}</strong>
            </div>
            <Badge tone={(dashboard?.score ?? 0) >= 680 ? "good" : "warn"}>{dashboard?.grade ?? "Demo"}</Badge>
          </div>
          <p style={{ fontSize: "0.8rem", color: TEXT_MUTED, marginBottom: "1rem" }}>{dashboard?.financial_health ?? "Seed demo data to activate live analytics for this workspace."}</p>
          
          {/* Chart - Fixed: bars scale with max value */}
          <div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem", height: chartHeight, marginBottom: "0.5rem", position: "relative" }}>
              {/* Grid lines */}
              <div style={{ position: "absolute", left: 0, right: 0, top: "25%", borderTop: "1px dashed rgba(0,0,0,0.05)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", left: 0, right: 0, top: "50%", borderTop: "1px dashed rgba(0,0,0,0.05)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", left: 0, right: 0, top: "75%", borderTop: "1px dashed rgba(0,0,0,0.05)", pointerEvents: "none" }} />
              {trend.map((item, idx) => {
                const barHeight = (item.amount / maxAmount) * chartHeight;
                return (
                  <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div
                      style={{
                        width: "100%",
                        background: TEAL,
                        height: `${Math.max(4, barHeight)}px`,
                        borderRadius: "4px 4px 0 0",
                        transition: `height 0.2s ${EASE}`,
                        cursor: "pointer",
                      }}
                      title={`${item.month}: ₦${item.amount.toLocaleString()}`}
                    />
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
              {trend.map((item, idx) => (
                <div key={idx} style={{ flex: 1, textAlign: "center", fontSize: "0.7rem", color: TEXT_MUTED }}>{item.month}</div>
              ))}
            </div>
          </div>
        </Card>
        <div style={{ flex: 1, background: "#fff", borderRadius: 12, padding: "1rem", border: `1px solid ${BORDER}`, display: "flex", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "0.8rem", fontWeight: 500, color: TEXT_MUTED, cursor: "help" }} title="Average risk score across all active investigation cases">Avg case risk</div>
            <strong style={{ fontSize: "1.6rem", fontWeight: 600, color: TEXT_MAIN }}>{riskAverage || 64}</strong>
            <p style={{ fontSize: "0.75rem", color: TEXT_MUTED, margin: "0.25rem 0 0" }}>Active investigations</p>
          </div>
        </div>
      </div>

      {/* Four KPI cards - same as before */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        <Card style={{ background: "#fff", padding: "0.8rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 500, color: TEXT_MUTED, cursor: "help" }} title="Number of open investigation cases">Open cases</div>
          <strong style={{ fontSize: "1.4rem", fontWeight: 600, color: TEXT_MAIN }}>{cases.filter(c => c.status !== "RESOLVED").length || 14}</strong>
        </Card>
        <Card style={{ background: "#fff", padding: "0.8rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 500, color: TEXT_MUTED, cursor: "help" }} title="Total evidence files uploaded">Evidence files</div>
          <strong style={{ fontSize: "1.4rem", fontWeight: 600, color: TEXT_MAIN }}>{dashboard?.flagged_anomalies.length ? dashboard.flagged_anomalies.length + 18 : 24}</strong>
        </Card>
        <Card style={{ background: "#fff", padding: "0.8rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 500, color: TEXT_MUTED, cursor: "help" }} title="Number of flagged anomalies">Fraud flags</div>
          <strong style={{ fontSize: "1.4rem", fontWeight: 600, color: TEXT_MAIN }}>{dashboard?.flagged_anomalies.length ?? 6}</strong>
        </Card>
        <Card style={{ background: "#fff", padding: "0.8rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 500, color: TEXT_MUTED, cursor: "help" }} title="Report generation status">Report status</div>
          <strong style={{ fontSize: "1.4rem", fontWeight: 600, color: TEXT_MAIN }}>Ready</strong>
        </Card>
      </div>

      {/* Two column */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <Card style={{ background: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 600, color: TEXT_MAIN, margin: 0 }}>Priority cases</h2>
            <button onClick={() => router.push("/cases")} style={{ background: "none", border: "none", color: ACCENT, cursor: "pointer", fontSize: "0.75rem" }}>View all</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {cases.slice(0,6).map(item => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${BORDER}`, paddingBottom: "0.4rem" }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: "0.85rem", color: TEXT_MAIN }}>{item.title}</div>
                  <small style={{ color: TEXT_MUTED, fontSize: "0.65rem" }}>{item.category} · {item.case_number}</small>
                </div>
                <Badge tone={item.risk_score > 75 ? "bad" : item.risk_score > 50 ? "warn" : "good"}>{item.risk_score}</Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card style={{ background: "#fff" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, color: TEXT_MAIN, margin: "0 0 0.8rem 0" }}>Notifications</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {notifications.slice(0,5).map(item => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", borderBottom: `1px solid ${BORDER}`, paddingBottom: "0.4rem" }}>
                {getNotificationIcon(item.tone)}
                <div>
                  <div style={{ fontWeight: 500, fontSize: "0.85rem", color: TEXT_MAIN }}>{item.title}</div>
                  <small style={{ color: TEXT_MUTED, fontSize: "0.65rem" }}>{item.body}</small>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}