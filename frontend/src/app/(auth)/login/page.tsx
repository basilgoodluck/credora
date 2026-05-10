"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "../../../components/AuthProvider";
import { api } from "../../../lib/api";

const TEAL   = "#28ebc0";
const DARK   = "#0B1220";
const AMBER  = "#FFB020";
const MUTED  = "#6b8f80";
const EASE   = "cubic-bezier(0.25,0.46,0.45,0.94)";

/* Eye icon */
function EyeOpen() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12S5 5 12 5s11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EyeOff() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19C5 19 1 12 1 12a18.09 18.09 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

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
      {/* Background glow blobs */}
      <div style={{ position: "absolute", top: "-120px", left: "-80px", width: 400, height: 400, borderRadius: "50%", background: "rgba(40,235,192,0.07)", filter: "blur(60px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-100px", right: "-60px", width: 320, height: 320, borderRadius: "50%", background: "rgba(255,176,32,0.06)", filter: "blur(50px)", pointerEvents: "none" }} />
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

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  pattern?: string;
  minLength?: number;
  showToggle?: boolean;
}
function Field({ label, value, onChange, type = "text", autoComplete, required, inputMode, pattern, minLength, showToggle }: FieldProps) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (visible ? "text" : "password") : type;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", animation: "fadeIn 0.5s ease both" }}>
      <label style={{ fontSize: "0.82rem", fontWeight: 700, color: MUTED, letterSpacing: "0.06em", textTransform: "uppercase" }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={inputType}
          value={value}
          onChange={e => onChange(e.target.value)}
          autoComplete={autoComplete}
          required={required}
          inputMode={inputMode}
          pattern={pattern}
          minLength={minLength}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            padding: showToggle ? "0.9rem 3rem 0.9rem 1rem" : "0.9rem 1rem",
            background: focused ? "rgba(40,235,192,0.06)" : "rgba(255,255,255,0.04)",
            border: `1.5px solid ${focused ? TEAL : "rgba(255,255,255,0.1)"}`,
            borderRadius: 12,
            color: "#fff",
            fontSize: "1rem",
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 500,
            outline: "none",
            transition: `border-color 0.2s ${EASE}, background 0.2s ${EASE}, box-shadow 0.2s ${EASE}`,
            boxShadow: focused ? `0 0 0 3px rgba(40,235,192,0.12)` : "none",
            boxSizing: "border-box",
          }}
        />
        {showToggle && (
          <button
            type="button"
            onClick={() => setVisible(v => !v)}
            style={{
              position: "absolute",
              right: "0.9rem",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: visible ? TEAL : MUTED,
              display: "flex",
              alignItems: "center",
              padding: 0,
              transition: `color 0.18s ${EASE}`,
            }}
          >
            {visible ? <EyeOff /> : <EyeOpen />}
          </button>
        )}
      </div>
    </div>
  );
}

function PrimaryBtn({ children, type = "submit" }: { children: React.ReactNode; type?: "submit" | "button" }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type={type}
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

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.login(phone, password);
      setUser(await api.me());
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <Card>
        {/* Logo */}
        <div style={{ marginBottom: "2rem", animation: "fadeIn 0.4s ease both" }}>
          <div style={{ fontSize: "1.3rem", fontWeight: 800, color: TEAL, letterSpacing: "-0.02em", marginBottom: "0.25rem" }}>Credora</div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", margin: 0, marginBottom: "0.4rem" }}>Welcome back</h1>
          <p style={{ fontSize: "0.95rem", color: MUTED, margin: 0 }}>Sign in with your phone number and password.</p>
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          <Field label="Phone number" value={phone} onChange={setPhone} type="tel" autoComplete="tel" required />
          <Field label="Password" value={password} onChange={setPassword} type="password" autoComplete="current-password" required showToggle />

          {error && (
            <div style={{ background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.25)", borderRadius: 10, padding: "0.75rem 1rem", color: "#ff6b6b", fontSize: "0.9rem", fontWeight: 500, animation: "fadeIn 0.2s ease both" }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", marginTop: "0.4rem" }}>
            <PrimaryBtn type="submit">{loading ? "Signing in..." : "Enter dashboard"}</PrimaryBtn>
            <SecondaryBtn onClick={() => router.push("/signup")}>Create account</SecondaryBtn>
          </div>
        </form>
      </Card>
    </AuthShell>
  );
}