"use client";

import { useAuth } from "../../../components/AuthProvider";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";

const TEXT_MAIN = "#0B1220";
const TEXT_MUTED = "#2c4a3e";
const BORDER = "rgba(0,0,0,0.08)";

export default function SettingsPage() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: "1rem", width: "100%", maxWidth: 800, margin: "0 auto" }}>
      <Card style={{ background: "#fff", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* User identity section */}
        <div>
          <h2 style={{ fontSize: "0.9rem", fontWeight: 600, color: TEXT_MAIN, margin: "0 0 1rem 0", borderBottom: `1px solid ${BORDER}`, paddingBottom: "0.5rem" }}>
            Account holder
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.5rem", borderBottom: `1px solid ${BORDER}` }}>
              <div>
                <div style={{ fontWeight: 600, color: TEXT_MAIN }}>{user?.full_name ?? ""}</div>
                <small style={{ color: TEXT_MUTED }}>{user?.phone_number ?? ""}</small>
              </div>
              <Badge tone="good">KYC verified</Badge>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: TEXT_MUTED }}>Role</span>
              <strong style={{ color: TEXT_MAIN }}>Account owner</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: TEXT_MUTED }}>Country</span>
              <strong style={{ color: TEXT_MAIN }}>Nigeria</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: TEXT_MUTED }}>Account state</span>
              <strong style={{ color: TEXT_MAIN }}>Active</strong>
            </div>
          </div>
        </div>

        {/* Security section */}
        <div>
          <h2 style={{ fontSize: "0.9rem", fontWeight: 600, color: TEXT_MAIN, margin: "0 0 1rem 0", borderBottom: `1px solid ${BORDER}`, paddingBottom: "0.5rem" }}>
            Security
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.5rem", borderBottom: `1px solid ${BORDER}` }}>
              <dt style={{ fontWeight: 500, color: TEXT_MUTED, margin: 0 }}>Phone number</dt>
              <dd style={{ fontWeight: 600, color: TEXT_MAIN, margin: 0 }}>{user?.phone_number ?? ""}</dd>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.5rem", borderBottom: `1px solid ${BORDER}` }}>
              <dt style={{ fontWeight: 500, color: TEXT_MUTED, margin: 0 }}>Account</dt>
              <dd style={{ fontWeight: 600, color: TEXT_MAIN, margin: 0 }}>One financial identity</dd>
            </div>
          </div>
        </div>

        <Button variant="danger" onClick={logout} style={{ alignSelf: "flex-start" }}>
          Secure logout
        </Button>
      </Card>
    </div>
  );
}