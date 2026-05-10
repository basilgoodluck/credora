"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AMBER = "#FFB020";
const DARK  = "#0B1220";
const BG    = "#28ebc0";
const TEXT  = "#052e24";
const TEXT2 = "#084534";
const EASE  = "cubic-bezier(0.25,0.46,0.45,0.94)";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogin = () => router.push("/login");

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
          
          {/* GitHub link */}
          <a
            href="https://github.com/basilgoodluck/credora"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              background: "rgba(0,0,0,0.05)",
              padding: "0.35rem 0.85rem",
              borderRadius: 99,
              border: "1px solid rgba(0,0,0,0.13)",
              fontSize: "0.78rem",
              fontWeight: 600,
              color: TEXT2,
              textDecoration: "none",
              transition: `background 0.15s ${EASE}, transform 0.15s ${EASE}`,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(0,0,0,0.1)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(0,0,0,0.05)";
              e.currentTarget.style.transform = "none";
            }}
          >
            <svg height="14" width="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            GitHub
          </a>

          <button
            onClick={handleLogin}
            style={{
              background: DARK, color: "#fff",
              fontSize: "0.88rem", fontWeight: 600,
              padding: "0.5rem 1.1rem", borderRadius: 10,
              border: "none",
              cursor: "pointer",
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