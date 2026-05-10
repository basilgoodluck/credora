"use client";

import { useAuth } from "../../../components/AuthProvider";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";

const TEAL = "#28ebc0";
const MUTED = "#6b8f80";

export default function UsersPage() {
  const { user } = useAuth();
  return (
    <div style={{ padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: TEAL, marginBottom: "0.5rem" }}>
          Workspace Identity
        </div>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#fff", margin: "0 0 0.25rem 0", letterSpacing: "-0.02em" }}>Users</h1>
        <p style={{ color: MUTED, margin: 0, fontSize: "0.9rem" }}>Current account access and verified identity status.</p>
      </div>

      <Card>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "0.75rem" }}>
            <div>
              <div style={{ fontWeight: 600, color: "#fff" }}>{user?.full_name || "Amina Balogun"}</div>
              <small style={{ color: MUTED }}>{user?.phone_number}</small>
            </div>
            <Badge tone="good">KYC verified</Badge>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: MUTED }}>Role</span>
            <strong style={{ color: "#fff" }}>Account owner</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: MUTED }}>Country</span>
            <strong style={{ color: "#fff" }}>Nigeria</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: MUTED }}>Account state</span>
            <strong style={{ color: "#fff" }}>Active</strong>
          </div>
        </div>
      </Card>
    </div>
  );
}