"use client";

const TEXT  = "#052e24";
const TEXT2 = "#084534";

export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid rgba(0,0,0,0.08)", padding: "1.75rem 1.5rem" }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: "0.95rem", fontWeight: 700, color: TEXT }}>Credora</span>
        <span style={{ fontSize: "0.88rem", color: TEXT2 }}>
          AMD Developer Hackathon 2025 Track 1: AI Agents
        </span>
      </div>
    </footer>
  );
}