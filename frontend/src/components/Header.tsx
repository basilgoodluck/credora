"use client";

import { useState, useEffect } from "react";

const AMBER = "#FFB020";
const DARK  = "#0B1220";
const BG    = "#28ebc0";
const TEXT  = "#052e24";
const TEXT2 = "#084534";
const EASE  = "cubic-bezier(0.25,0.46,0.45,0.94)";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(40,235,192,0.88)",
      backdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(0,0,0,0.08)",
      boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.07)" : "none",
      transition: `box-shadow 0.3s ${EASE}`,
    }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        padding: "0 1.5rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 56,
      }}>
        <span style={{ fontSize: "1.05rem", fontWeight: 700, letterSpacing: "-0.02em", color: TEXT }}>
          Credora
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <span style={{
            fontSize: "0.78rem", fontWeight: 600, color: TEXT2,
            padding: "0.35rem 0.85rem", borderRadius: 99,
            border: "1px solid rgba(0,0,0,0.13)",
            background: "rgba(0,0,0,0.05)",
          }}>
            AMD Hackathon 2025
          </span>
          <button
            style={{
              background: DARK, color: "#fff",
              fontSize: "0.88rem", fontWeight: 600,
              padding: "0.5rem 1.1rem", borderRadius: 10,
              transition: `transform 0.18s ${EASE}, box-shadow 0.18s ${EASE}`,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 18px rgba(11,18,32,0.28)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = "none";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
            }}
          >
            Login
          </button>
        </div>
      </div>
    </nav>
  );
}