"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Protected } from "../../../components/AuthProvider";
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
      <div style={{ position: "absolute", top: "-100px", left: "-60px", width: 360, height: 360, borderRadius: "50%", background: "rgba(40,235,192,0.07)", filter: "blur(65px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-80px", right: "-40px", width: 300, height: 300, borderRadius: "50%", background: "rgba(255,176,32,0.06)", filter: "blur(55px)", pointerEvents: "none" }} />
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
        @keyframes dotBounce {
          0%, 80%, 100% { transform: scale(1); opacity: 0.3; }
          40% { transform: scale(1.4); opacity: 1; }
        }
      `}</style>
      {children}
    </div>
  );
}

/* Visual PIN dots display */
function PinDots({ pin }: { pin: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "0.8rem", padding: "1rem 0 0.5rem" }}>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <div
          key={i}
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: i < pin.length ? TEAL : "rgba(255,255,255,0.12)",
            border: `2px solid ${i < pin.length ? TEAL : "rgba(255,255,255,0.18)"}`,
            transition: `background 0.15s ${EASE}, border-color 0.15s ${EASE}, transform 0.15s ${EASE}`,
            transform: i < pin.length ? "scale(1.15)" : "scale(1)",
          }}
        />
      ))}
    </div>
  );
}

function PinField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <label style={{ fontSize: "0.82rem", fontWeight: 700, color: MUTED, letterSpacing: "0.06em", textTransform: "uppercase" }}>
        4 to 6 digit PIN
      </label>
      <input
        type="password"
        value={value}
        onChange={e => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
        inputMode="numeric"
        pattern="[0-9]{4,6}"
        autoComplete="new-password"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          padding: "0.9rem 1rem",
          background: focused ? "rgba(40,235,192,0.06)" : "rgba(255,255,255,0.04)",
          border: `1.5px solid ${focused ? TEAL : "rgba(255,255,255,0.1)"}`,
          borderRadius: 12,
          color: "#fff",
          fontSize: "1.6rem",
          fontFamily: "'Montserrat', monospace",
          fontWeight: 700,
          outline: "none",
          letterSpacing: "0.35em",
          textAlign: "center",
          transition: `border-color 0.2s ${EASE}, background 0.2s ${EASE}, box-shadow 0.2s ${EASE}`,
          boxShadow: focused ? "0 0 0 3px rgba(40,235,192,0.12)" : "none",
          boxSizing: "border-box",
        }}
      />
      <PinDots pin={value} />
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

function SkipBtn({ onClick }: { onClick: () => void }) {
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
        color: hov ? "#fff" : "rgba(255,255,255,0.45)",
        fontSize: "0.95rem",
        fontWeight: 600,
        fontFamily: "'Montserrat', sans-serif",
        borderRadius: 12,
        border: "1.5px solid rgba(255,255,255,0.08)",
        cursor: "pointer",
        transition: `background 0.18s ${EASE}, color 0.18s ${EASE}`,
      }}
    >
      Skip for now
    </button>
  );
}

export default function SetPinPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (pin) await api.setPin(pin, true);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to set PIN");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Protected>
      <AuthShell>
        <Card>
          <div style={{ marginBottom: "2rem", animation: "fadeIn 0.4s ease both" }}>
            <div style={{ fontSize: "1.3rem", fontWeight: 800, color: TEAL, letterSpacing: "-0.02em", marginBottom: "0.25rem" }}>Credora</div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", margin: 0, marginBottom: "0.4rem" }}>Set a device PIN</h1>
            <p style={{ fontSize: "0.95rem", color: MUTED, margin: 0 }}>Add a 4 to 6 digit PIN for faster access on this device.</p>
          </div>

          {/* Security badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", background: "rgba(255,176,32,0.07)", border: "1px solid rgba(255,176,32,0.18)", borderRadius: 10, padding: "0.65rem 0.9rem", marginBottom: "1.5rem", animation: "fadeIn 0.5s ease 0.1s both" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={AMBER} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 1L2 4v4c0 3.5 2.7 6.7 6 7.5C11.3 14.7 14 11.5 14 8V4L8 1z" />
            </svg>
            <span style={{ fontSize: "0.88rem", color: AMBER, fontWeight: 600 }}>PIN is stored on this device only</span>
          </div>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            <PinField value={pin} onChange={setPin} />

            {error && (
              <div style={{ background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.25)", borderRadius: 10, padding: "0.75rem 1rem", color: "#ff6b6b", fontSize: "0.9rem", fontWeight: 500, animation: "fadeIn 0.2s ease both" }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", marginTop: "0.4rem" }}>
              <PrimaryBtn loading={loading}>{loading ? "Saving..." : "Finish setup"}</PrimaryBtn>
              <SkipBtn onClick={() => router.push("/dashboard")} />
            </div>
          </form>
        </Card>
      </AuthShell>
    </Protected>
  );
}