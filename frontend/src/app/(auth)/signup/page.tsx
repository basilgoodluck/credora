"use client";

import { FormEvent, useState } from "react";
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
      <div style={{ position: "absolute", top: "-120px", right: "-80px", width: 400, height: 400, borderRadius: "50%", background: "rgba(40,235,192,0.07)", filter: "blur(60px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-100px", left: "-60px", width: 320, height: 320, borderRadius: "50%", background: "rgba(255,176,32,0.06)", filter: "blur(50px)", pointerEvents: "none" }} />
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
      `}</style>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", autoComplete, required }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; autoComplete?: string; required?: boolean;
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

function PrimaryBtn({ children, loading }: { children: React.ReactNode; loading?: boolean }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type="submit"
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
        cursor: "pointer",
        letterSpacing: "0.02em",
        transition: `background 0.18s ${EASE}, transform 0.18s ${EASE}, box-shadow 0.18s ${EASE}`,
        transform: hov ? "translateY(-2px)" : "none",
        boxShadow: hov ? "0 8px 24px rgba(40,235,192,0.25)" : "none",
        opacity: loading ? 0.7 : 1,
      }}
    >
      {children}
    </button>
  );
}

function SecondaryBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: "100%",
        padding: "0.95rem",
        background: hov ? "rgba(255,255,255,0.06)" : "transparent",
        color: hov ? "#fff" : "rgba(255,255,255,0.55)",
        fontSize: "0.95rem",
        fontWeight: 600,
        fontFamily: "'Montserrat', sans-serif",
        borderRadius: 12,
        border: "1.5px solid rgba(255,255,255,0.1)",
        cursor: "pointer",
        transition: `background 0.18s ${EASE}, color 0.18s ${EASE}`,
      }}
    >
      {children}
    </button>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.register(phone);
      sessionStorage.setItem("cq_phone", phone);
      router.push("/verify-otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start signup");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <Card>
        <div style={{ marginBottom: "2rem", animation: "fadeIn 0.4s ease both" }}>
          <div style={{ fontSize: "1.3rem", fontWeight: 800, color: TEAL, letterSpacing: "-0.02em", marginBottom: "0.25rem" }}>Credora</div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", margin: 0, marginBottom: "0.4rem" }}>Create your account</h1>
          <p style={{ fontSize: "0.95rem", color: MUTED, margin: 0 }}>Use the phone number connected to your daily financial activity.</p>
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          <Field label="Phone number" value={phone} onChange={setPhone} type="tel" autoComplete="tel" required />

          {error && (
            <div style={{ background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.25)", borderRadius: 10, padding: "0.75rem 1rem", color: "#ff6b6b", fontSize: "0.9rem", fontWeight: 500, animation: "fadeIn 0.2s ease both" }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", marginTop: "0.4rem" }}>
            <PrimaryBtn loading={loading}>{loading ? "Sending code..." : "Send verification code"}</PrimaryBtn>
            <SecondaryBtn onClick={() => router.push("/login")}>I already have an account</SecondaryBtn>
          </div>
        </form>
      </Card>
    </AuthShell>
  );
}