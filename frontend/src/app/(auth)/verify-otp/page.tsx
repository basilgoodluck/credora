"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "../../../lib/api";

const TEAL   = "#28ebc0";
const DARK   = "#0B1220";
const AMBER  = "#FFB020";
const MUTED  = "#6b8f80";
const EASE   = "cubic-bezier(0.25,0.46,0.45,0.94)";

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: DARK,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem 1rem",
      fontFamily: "'Montserrat', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: "-100px", left: "10%", width: 360, height: 360, borderRadius: "50%", background: "rgba(40,235,192,0.06)", filter: "blur(70px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-80px", right: "5%", width: 280, height: 280, borderRadius: "50%", background: "rgba(255,176,32,0.06)", filter: "blur(50px)", pointerEvents: "none" }} />
      {children}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      width: "100%",
      maxWidth: 440,
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 20,
      padding: "2.5rem 2rem",
      backdropFilter: "blur(12px)",
      animation: "slideUp 0.45s cubic-bezier(0.25,0.46,0.45,0.94) both",
    }}>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", autoComplete, required, inputMode }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; autoComplete?: string; required?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <label style={{ fontSize: "0.82rem", fontWeight: 700, color: MUTED, letterSpacing: "0.06em", textTransform: "uppercase" }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        autoComplete={autoComplete}
        required={required}
        inputMode={inputMode}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          padding: "0.9rem 1rem",
          background: focused ? "rgba(40,235,192,0.06)" : "rgba(255,255,255,0.04)",
          border: `1.5px solid ${focused ? TEAL : "rgba(255,255,255,0.1)"}`,
          borderRadius: 12,
          color: "#fff",
          fontSize: "1rem",
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 500,
          outline: "none",
          transition: `border-color 0.2s ${EASE}, background 0.2s ${EASE}, box-shadow 0.2s ${EASE}`,
          boxShadow: focused ? "0 0 0 3px rgba(40,235,192,0.12)" : "none",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

/* Large OTP-style input */
function OtpField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <label style={{ fontSize: "0.82rem", fontWeight: 700, color: MUTED, letterSpacing: "0.06em", textTransform: "uppercase" }}>
        Verification code
      </label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
        inputMode="numeric"
        required
        placeholder="000000"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          padding: "1rem 1rem",
          background: focused ? "rgba(40,235,192,0.06)" : "rgba(255,255,255,0.04)",
          border: `1.5px solid ${focused ? TEAL : "rgba(255,255,255,0.1)"}`,
          borderRadius: 12,
          color: TEAL,
          fontSize: "1.8rem",
          fontFamily: "'Montserrat', monospace",
          fontWeight: 700,
          outline: "none",
          letterSpacing: "0.4em",
          textAlign: "center",
          transition: `border-color 0.2s ${EASE}, background 0.2s ${EASE}, box-shadow 0.2s ${EASE}`,
          boxShadow: focused ? "0 0 0 3px rgba(40,235,192,0.12)" : "none",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

function PrimaryBtn({ children, loading }: { children: React.ReactNode; loading?: boolean }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type="submit"
      disabled={loading}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: "100%",
        padding: "1rem",
        background: hov ? "#1fd4ad" : TEAL,
        color: DARK,
        fontSize: "0.97rem",
        fontWeight: 700,
        fontFamily: "'Montserrat', sans-serif",
        borderRadius: 12,
        border: "none",
        cursor: loading ? "not-allowed" : "pointer",
        letterSpacing: "0.02em",
        transition: `background 0.18s ${EASE}, transform 0.18s ${EASE}, box-shadow 0.18s ${EASE}`,
        transform: hov && !loading ? "translateY(-2px)" : "none",
        boxShadow: hov && !loading ? "0 8px 24px rgba(40,235,192,0.25)" : "none",
        opacity: loading ? 0.7 : 1,
      }}
    >
      {children}
    </button>
  );
}

export default function VerifyOtpPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => setPhone(sessionStorage.getItem("cq_phone") || ""), []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.verifyOtp(phone, otp, "signup");
      router.push("/set-password");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to verify code");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <Card>
        <div style={{ marginBottom: "2rem", animation: "fadeIn 0.4s ease both" }}>
          <div style={{ fontSize: "1.3rem", fontWeight: 800, color: TEAL, letterSpacing: "-0.02em", marginBottom: "0.25rem" }}>Credora</div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", margin: 0, marginBottom: "0.4rem" }}>Verify your phone</h1>
          <p style={{ fontSize: "0.95rem", color: MUTED, margin: 0 }}>Enter the one-time code sent to your phone.</p>
        </div>

        {/* Sent-to indicator */}
        {phone && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(40,235,192,0.07)", border: "1px solid rgba(40,235,192,0.15)", borderRadius: 10, padding: "0.65rem 0.9rem", marginBottom: "1.5rem", animation: "fadeIn 0.4s ease both" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: TEAL, animation: "pulse 2s ease infinite" }} />
            <span style={{ fontSize: "0.9rem", color: TEAL, fontWeight: 600 }}>Code sent to {phone}</span>
          </div>
        )}

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          <Field label="Phone number" value={phone} onChange={setPhone} type="tel" required />
          <OtpField value={otp} onChange={setOtp} />

          {error && (
            <div style={{ background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.25)", borderRadius: 10, padding: "0.75rem 1rem", color: "#ff6b6b", fontSize: "0.9rem", fontWeight: 500, animation: "fadeIn 0.2s ease both" }}>
              {error}
            </div>
          )}

          <div style={{ marginTop: "0.4rem" }}>
            <PrimaryBtn loading={loading}>{loading ? "Verifying..." : "Verify"}</PrimaryBtn>
          </div>
        </form>
      </Card>
    </AuthShell>
  );
}