import { useLocation } from "wouter";
import {
  IconLogo, IconArrowLeft, IconAlert, IconLock, IconInfo
} from "../components/Icons";

export default function SettingsPage() {
  const [, navigate] = useLocation();

  return (
    <div className="nebula-bg" style={{ minHeight: "100vh", padding: "var(--safe-top) 1.5rem var(--safe-bottom)" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", paddingBottom: "6rem" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.5rem 0", marginBottom: "2rem" }}>
          <button onClick={() => navigate("/")} className="btn btn-ghost" style={{ padding: "0.5rem" }}>
            <IconArrowLeft size={20} />
          </button>
          <h1 className="heading-display" style={{ fontSize: "1.8rem", margin: 0 }}>Settings</h1>
          <div style={{ width: 44 }} />
        </div>

        <div className="stagger">
          {/* Developer / Testing Section */}
          <div className="glassmorphism" style={{ padding: "2rem", borderRadius: "24px", marginBottom: "1.5rem", borderLeft: "4px solid var(--sc-danger)" }}>
            <h2 className="section-label" style={{ marginBottom: "1rem", color: "var(--sc-danger)" }}>Testing Controls</h2>
            <p style={{ fontSize: "0.9rem", color: "var(--sc-stone)", marginBottom: "1.5rem" }}>
              Development tools for testing. Not for daily use.
            </p>
            <button
              onClick={() => {
                if (confirm("Reset Soul Codex?\n\nThis will clear your current profile and all local data. You'll return to onboarding.\n\nUse only for testing new birth data or resetting the engine.")) {
                  localStorage.clear();
                  window.location.href = "/";
                }
              }}
              style={{
                width: "100%",
                padding: "1rem",
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid var(--sc-danger)",
                color: "var(--sc-danger)",
                borderRadius: "12px",
                cursor: "pointer",
                fontSize: "0.95rem",
                fontWeight: 600,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.background = "rgba(239, 68, 68, 0.25)";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.background = "rgba(239, 68, 68, 0.15)";
              }}
            >
              <IconAlert size={16} style={{ marginRight: "0.5rem", display: "inline" }} />
              Reset Engine
            </button>
          </div>

          {/* Privacy & Legal */}
          <div className="glassmorphism" style={{ padding: "2rem", borderRadius: "24px", marginBottom: "1.5rem" }}>
            <h2 className="section-label" style={{ marginBottom: "1.5rem" }}>Privacy & Legal</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <button
                onClick={() => navigate("/privacy")}
                style={{
                  padding: "1rem",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "12px",
                  color: "var(--sc-ivory)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <IconLock size={16} />
                  Privacy Policy
                </span>
                <span style={{ opacity: 0.4 }}>›</span>
              </button>
              <button
                onClick={() => navigate("/terms")}
                style={{
                  padding: "1rem",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "12px",
                  color: "var(--sc-ivory)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <IconInfo size={16} />
                  Terms of Service
                </span>
                <span style={{ opacity: 0.4 }}>›</span>
              </button>
            </div>
          </div>

          {/* App Info */}
          <div className="glassmorphism" style={{ padding: "2rem", borderRadius: "24px", marginBottom: "1.5rem", textAlign: "center", opacity: 0.6 }}>
            <p style={{ fontSize: "0.85rem", color: "var(--sc-stone)", margin: 0 }}>
              Soul Codex v1.0
            </p>
            <p style={{ fontSize: "0.8rem", color: "var(--sc-stone)", margin: "0.5rem 0 0 0" }}>
              Your identity engine
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
