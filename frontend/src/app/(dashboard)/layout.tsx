"use client";

import { type ReactNode, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Protected, useAuth } from "../../components/AuthProvider";
import {
  FaTh, FaFolderOpen, FaExclamationTriangle, FaChartBar,
  FaUsers, FaCog, FaSearch, FaBell, FaChevronLeft, FaChevronRight,
  FaSignOutAlt, FaPlus
} from "react-icons/fa";
import { MdCloudUpload } from "react-icons/md";

const BG_MAIN = "#28ebc0";
const BG_SIDEBAR = "#ffffff";
const TEXT_MAIN = "#0B1220";
const TEXT_MUTED = "#2c4a3e";
const ACCENT = "#0B1220";
const BORDER = "rgba(0,0,0,0.08)";
const EASE = "cubic-bezier(0.25,0.46,0.45,0.94)";

const nav = [
  { label: "Dashboard",       href: "/dashboard",     icon: FaTh },
  { label: "Cases",           href: "/cases",         icon: FaFolderOpen },
  { label: "Upload Evidence", href: "/upload",        icon: MdCloudUpload },
  { label: "Risk Analysis",   href: "/risk-analysis", icon: FaExclamationTriangle },
  { label: "Reports",         href: "/reports",       icon: FaChartBar },
  { label: "Settings",        href: "/settings",      icon: FaCog },
];

// Inject global keyframes once
const KEYFRAMES = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');

@keyframes pulse-ring {
  0%   { transform: scale(1);   opacity: 0.6; }
  50%  { transform: scale(1.18); opacity: 0.2; }
  100% { transform: scale(1);   opacity: 0.6; }
}
@keyframes float-up {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-3px); }
}
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes slide-in {
  from { opacity: 0; transform: translateX(-12px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes badge-pop {
  0%   { transform: scale(0.7); }
  60%  { transform: scale(1.2); }
  100% { transform: scale(1); }
}
`;

function GlobalStyles() {
  useEffect(() => {
    if (document.getElementById("credora-styles")) return;
    const s = document.createElement("style");
    s.id = "credora-styles";
    s.textContent = KEYFRAMES;
    document.head.appendChild(s);
  }, []);
  return null;
}

/* ── Nav Item ─────────────────────────────────────────────── */
function NavItem({ label, href, Icon, active, onClick, collapsed }: {
  label: string; href: string; Icon: any; active: boolean;
  onClick: () => void; collapsed: boolean;
}) {
  const [hover, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      title={collapsed ? label : undefined}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-start",
        gap: collapsed ? 0 : "0.75rem",
        padding: collapsed ? "0.7rem" : "0.7rem 0.9rem",
        borderRadius: 12,
        border: "none",
        background: active
          ? "rgba(40,235,192,0.18)"
          : hover
          ? "rgba(0,0,0,0.045)"
          : "transparent",
        color: active ? "#0B1220" : hover ? TEXT_MAIN : TEXT_MUTED,
        fontSize: "0.875rem",
        fontWeight: active ? 700 : 500,
        fontFamily: "'Montserrat', sans-serif",
        cursor: "pointer",
        transition: `all 0.17s ${EASE}`,
        position: "relative",
        transform: pressed ? "scale(0.97)" : "scale(1)",
        boxShadow: active ? "0 2px 12px rgba(40,235,192,0.25)" : "none",
      }}
    >
      {/* Active indicator bar */}
      {active && (
        <div style={{
          position: "absolute", left: 0, top: "18%", height: "64%",
          width: 3.5, borderRadius: "0 4px 4px 0",
          background: "linear-gradient(180deg, #28ebc0, #0fa882)",
          boxShadow: "2px 0 8px rgba(40,235,192,0.5)",
        }} />
      )}

      {/* Icon wrapper with subtle animation when active */}
      <span style={{
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 22,
        height: 22,
        animation: active ? `float-up 2.5s ${EASE} infinite` : "none",
        color: active ? BG_MAIN : "inherit",
        filter: active ? "drop-shadow(0 0 4px rgba(40,235,192,0.7))" : "none",
        transition: `color 0.17s ${EASE}, filter 0.17s ${EASE}`,
      }}>
        <Icon size={18} />
      </span>

      {!collapsed && (
        <span style={{
          animation: "slide-in 0.22s ease both",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {label}
        </span>
      )}

      {/* Hover glow ripple */}
      {hover && !active && (
        <span style={{
          position: "absolute", inset: 0, borderRadius: 12,
          background: "radial-gradient(circle at 30% 50%, rgba(40,235,192,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
      )}
    </button>
  );
}

/* ── Sidebar ──────────────────────────────────────────────── */
function Sidebar({ pathname, collapsed, setCollapsed }: {
  pathname: string; collapsed: boolean; setCollapsed: (v: boolean) => void;
}) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutHover, setLogoutHover] = useState(false);

  return (
    <aside style={{
      width: collapsed ? 72 : 244,
      flexShrink: 0,
      background: BG_SIDEBAR,
      borderRight: `1px solid ${BORDER}`,
      display: "flex",
      flexDirection: "column",
      padding: "1rem 0.6rem",
      height: "100vh",
      position: "sticky",
      top: 0,
      transition: `width 0.25s ${EASE}`,
      overflow: "hidden",
      boxShadow: "2px 0 16px rgba(0,0,0,0.04)",
    }}>

      {/* Logo row */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between",
        marginBottom: "1.6rem", padding: "0 0.3rem",
        minHeight: 40,
      }}>
        {!collapsed && (
          <button onClick={() => router.push("/dashboard")} style={{
            display: "flex", alignItems: "center", gap: "0.65rem",
            background: "none", border: "none", cursor: "pointer",
            animation: "slide-in 0.2s ease both",
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: "linear-gradient(135deg, #28ebc0 0%, #0fa882 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.78rem", fontWeight: 800, color: TEXT_MAIN,
              boxShadow: "0 4px 12px rgba(40,235,192,0.4)",
            }}>CR</div>
            <strong style={{ fontSize: "1rem", fontWeight: 800, color: TEXT_MAIN, letterSpacing: "-0.3px" }}>
              Credora
            </strong>
          </button>
        )}

        {collapsed && (
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: "linear-gradient(135deg, #28ebc0 0%, #0fa882 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.78rem", fontWeight: 800, color: TEXT_MAIN,
            boxShadow: "0 4px 12px rgba(40,235,192,0.4)",
            margin: "0 auto",
          }}>CR</div>
        )}

        {!collapsed && (
          <button onClick={() => setCollapsed(true)} style={{
            background: "none", border: "none", cursor: "pointer",
            color: TEXT_MUTED, padding: "0.3rem", borderRadius: 7,
            transition: `color 0.15s, background 0.15s`,
          }}
            onMouseEnter={e => { e.currentTarget.style.color = TEXT_MAIN; e.currentTarget.style.background = "rgba(0,0,0,0.05)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = TEXT_MUTED; e.currentTarget.style.background = "none"; }}>
            <FaChevronLeft size={13} />
          </button>
        )}

        {collapsed && (
          <button onClick={() => setCollapsed(false)} style={{
            position: "absolute", right: -12, top: 22,
            background: BG_SIDEBAR, border: `1px solid ${BORDER}`,
            borderRadius: "50%", width: 24, height: 24,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: TEXT_MUTED, boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            transition: `color 0.15s`,
            zIndex: 10,
          }}
            onMouseEnter={e => e.currentTarget.style.color = TEXT_MAIN}
            onMouseLeave={e => e.currentTarget.style.color = TEXT_MUTED}>
            <FaChevronRight size={11} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "0.2rem", flex: 1 }}>
        {nav.map((item) => (
          <NavItem
            key={item.href}
            label={item.label}
            href={item.href}
            Icon={item.icon}
            active={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))}
            onClick={() => router.push(item.href)}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* User + logout */}
      <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: "1rem" }}>
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: collapsed ? 0 : "0.65rem",
          padding: collapsed ? "0.5rem" : "0.6rem 0.75rem",
          borderRadius: 12,
          background: "rgba(40,235,192,0.06)",
          marginBottom: "0.4rem",
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(40,235,192,0.25), rgba(40,235,192,0.08))",
            border: `2px solid ${BG_MAIN}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.78rem", fontWeight: 700, color: "#0fa882",
            flexShrink: 0,
          }}>
            {(user?.full_name || user?.phone_number || "?")[0].toUpperCase()}
          </div>
          {!collapsed && (
            <div style={{ overflow: "hidden", flex: 1, animation: "slide-in 0.2s ease both" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 600, color: TEXT_MAIN, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.full_name || user?.phone_number}
              </div>
              <div style={{ fontSize: "0.7rem", color: TEXT_MUTED, fontWeight: 500 }}>Agent</div>
            </div>
          )}
        </div>

        <button
          onClick={async () => { setLoggingOut(true); await logout(); }}
          onMouseEnter={() => setLogoutHover(true)}
          onMouseLeave={() => setLogoutHover(false)}
          style={{
            width: "100%",
            display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start",
            gap: collapsed ? 0 : "0.6rem",
            padding: collapsed ? "0.55rem" : "0.55rem 0.75rem",
            background: logoutHover ? "rgba(255,80,80,0.08)" : "none",
            border: "none", borderRadius: 10,
            color: logoutHover ? "#ff5555" : TEXT_MUTED,
            fontSize: "0.85rem", fontWeight: 500,
            cursor: "pointer",
            transition: `color 0.18s ${EASE}, background 0.18s ${EASE}`,
            fontFamily: "'Montserrat', sans-serif",
          }}>
          <FaSignOutAlt size={15} style={{ flexShrink: 0 }} />
          {!collapsed && (loggingOut ? "Signing out…" : "Sign out")}
        </button>
      </div>
    </aside>
  );
}

/* ── Upload Button ────────────────────────────────────────── */
function UploadButton({ onClick }: { onClick: () => void }) {
  const [hover, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        display: "flex", alignItems: "center", gap: "0.5rem",
        padding: "0.5rem 1rem",
        background: hover ? "#1c2e28" : ACCENT,
        color: "#fff",
        fontSize: "0.85rem", fontWeight: 700,
        borderRadius: 10, border: "none", cursor: "pointer",
        fontFamily: "'Montserrat', sans-serif",
        transition: `all 0.18s ${EASE}`,
        transform: pressed ? "scale(0.96)" : hover ? "scale(1.03)" : "scale(1)",
        boxShadow: hover ? "0 6px 20px rgba(11,18,32,0.35)" : "0 2px 8px rgba(11,18,32,0.2)",
        position: "relative",
        overflow: "hidden",
      }}>
      {/* shimmer sweep on hover */}
      {hover && (
        <span style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)",
          backgroundSize: "200% auto",
          animation: `shimmer 0.7s linear`,
          pointerEvents: "none",
        }} />
      )}

      {/* Animated cloud upload icon */}
      <span style={{
        display: "flex", alignItems: "center",
        animation: hover ? `float-up 0.9s ${EASE} infinite` : "none",
        position: "relative",
      }}>
        <MdCloudUpload size={18} />
        {hover && (
          <span style={{
            position: "absolute", inset: -4,
            borderRadius: "50%",
            background: "rgba(40,235,192,0.2)",
            animation: `pulse-ring 1s ${EASE} infinite`,
            pointerEvents: "none",
          }} />
        )}
      </span>

      <FaPlus size={9} style={{ opacity: 0.7, marginRight: -2 }} />
      Upload
    </button>
  );
}

/* ── Topbar ───────────────────────────────────────────────── */
function Topbar() {
  const router = useRouter();
  const [searchFocused, setSearchFocused] = useState(false);
  const [bellHover, setBellHover] = useState(false);
  const [searchVal, setSearchVal] = useState("");

  return (
    <header style={{
      height: 60, borderBottom: `1px solid rgba(11,18,32,0.1)`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 1.5rem",
      background: `linear-gradient(135deg, #28ebc0 0%, #20d4ae 100%)`,
      flexShrink: 0, gap: "1rem",
      boxShadow: "0 2px 16px rgba(40,235,192,0.3)",
    }}>

      {/* Search */}
      <div style={{ position: "relative", flex: 1, maxWidth: 380 }}>
        <span style={{
          position: "absolute", left: "0.85rem", top: "50%",
          transform: "translateY(-50%)",
          color: searchFocused ? TEXT_MAIN : TEXT_MUTED,
          transition: `color 0.18s ${EASE}`,
          pointerEvents: "none",
        }}>
          <FaSearch size={14} />
        </span>
        <input
          type="text"
          value={searchVal}
          onChange={e => setSearchVal(e.target.value)}
          placeholder="Search cases, evidence, reports…"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          style={{
            width: "100%",
            padding: "0.55rem 1rem 0.55rem 2.4rem",
            background: searchFocused ? "rgba(255,255,255,0.97)" : "rgba(255,255,255,0.82)",
            border: `1.5px solid ${searchFocused ? ACCENT : "transparent"}`,
            borderRadius: 10, color: TEXT_MAIN,
            fontSize: "0.875rem", outline: "none",
            transition: `all 0.2s ${EASE}`,
            fontFamily: "'Montserrat', sans-serif",
            boxShadow: searchFocused ? "0 4px 16px rgba(11,18,32,0.15)" : "none",
          }}
        />
        {searchVal && (
          <button onClick={() => setSearchVal("")} style={{
            position: "absolute", right: "0.7rem", top: "50%",
            transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer",
            color: TEXT_MUTED, fontSize: "0.75rem", lineHeight: 1,
            padding: "0.15rem 0.25rem", borderRadius: 4,
          }}>✕</button>
        )}
      </div>

      {/* Right actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
        {/* Bell */}
        {/* <button
          onMouseEnter={() => setBellHover(true)}
          onMouseLeave={() => setBellHover(false)}
          style={{
            position: "relative",
            background: bellHover ? "rgba(11,18,32,0.1)" : "rgba(255,255,255,0.25)",
            border: "none", borderRadius: 9, width: 38, height: 38,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            transition: `all 0.18s ${EASE}`,
            transform: bellHover ? "scale(1.08)" : "scale(1)",
          }}>
          <FaBell size={16} color={TEXT_MAIN} style={{
            animation: bellHover ? `spin-slow 0.5s ease` : "none",
          }} />
          <span style={{
            position: "absolute", top: 7, right: 8,
            width: 7, height: 7, borderRadius: "50%",
            background: "#ff5555",
            border: "1.5px solid #28ebc0",
            animation: `badge-pop 0.3s ease both`,
          }} />
        </button> */}

        <UploadButton onClick={() => router.push("/upload")} />
      </div>
    </header>
  );
}

/* ── Layout ───────────────────────────────────────────────── */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Protected>
      <GlobalStyles />
      <div style={{
        display: "flex", minHeight: "100vh",
        background: "#f0fdf9",
        fontFamily: "'Montserrat', sans-serif",
        color: TEXT_MAIN,
      }}>
        <Sidebar pathname={pathname} collapsed={collapsed} setCollapsed={setCollapsed} />
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          minWidth: 0, height: "100vh", overflowY: "auto",
        }}>
          <Topbar />
          <main style={{ flex: 1, padding: 0, overflowY: "visible" }}>
            {children}
          </main>
        </div>
      </div>
    </Protected>
  );
}