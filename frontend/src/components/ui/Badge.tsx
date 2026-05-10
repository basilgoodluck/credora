import type { PropsWithChildren } from "react";

const TEAL = "#28ebc0";
const DARK = "#0B1220";
const MUTED = "#6b8f80";

const toneStyles = {
  neutral: { background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" },
  good: { background: "rgba(40,235,192,0.15)", color: TEAL },
  warn: { background: "rgba(255,176,32,0.15)", color: "#FFB020" },
  bad: { background: "rgba(255,80,80,0.15)", color: "#ff6b6b" },
};

export function Badge({ children, tone = "neutral" }: PropsWithChildren<{ tone?: "neutral" | "good" | "warn" | "bad" }>) {
  const style = toneStyles[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "0.2rem 0.6rem",
        borderRadius: 99,
        fontSize: "0.7rem",
        fontWeight: 600,
        letterSpacing: "0.01em",
        ...style,
      }}
    >
      {children}
    </span>
  );
}