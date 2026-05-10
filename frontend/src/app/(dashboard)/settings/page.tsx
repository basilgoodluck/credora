"use client";

import { useAuth } from "../../../components/AuthProvider";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";

const TEXT_MAIN = "#0B1220";
const TEXT_MUTED = "#2c4a3e";
const ACCENT = "#28ebc0";
const BORDER = "rgba(0,0,0,0.08)";

export default function SettingsPage() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: "1rem", width: "100%", maxWidth: 800, margin: "0 auto" }}>
      {/* Page header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: ACCENT, marginBottom: "0.25rem" }}>
          Security & Identity
        </div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: TEXT_MAIN, margin: "0 0 0.25rem", letterSpacing: "-0.02em" }}>Settings</h1>
        <p style={{ color: TEXT_MUTED, margin: 0, fontSize: "0.85rem" }}>Account details, access controls, and verified identity status.</p>
      </div>

      <Card style={{ background: "#fff", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* User identity section (merged from Users page) */}
        <div>
          <h2 style={{ fontSize: "0.9rem", fontWeight: 600, color: TEXT_MAIN, margin: "0 0 1rem 0", borderBottom: `1px solid ${BORDER}`, paddingBottom: "0.5rem" }}>
            Account holder
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.5rem", borderBottom: `1px solid ${BORDER}` }}>
              <div>
                <div style={{ fontWeight: 600, color: TEXT_MAIN }}>{user?.full_name || "Amina Balogun"}</div>
                <small style={{ color: TEXT_MUTED }}>{user?.phone_number}</small>
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

        {/* Security section (original Settings content) */}
        <div>
          <h2 style={{ fontSize: "0.9rem", fontWeight: 600, color: TEXT_MAIN, margin: "0 0 1rem 0", borderBottom: `1px solid ${BORDER}`, paddingBottom: "0.5rem" }}>
            Security
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.5rem", borderBottom: `1px solid ${BORDER}` }}>
              <dt style={{ fontWeight: 500, color: TEXT_MUTED, margin: 0 }}>Phone number</dt>
              <dd style={{ fontWeight: 600, color: TEXT_MAIN, margin: 0 }}>{user?.phone_number}</dd>
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