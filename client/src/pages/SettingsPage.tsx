import { useLocation } from "wouter";
import {
  IconLogo, IconArrowLeft, IconAlert, IconLock, IconInfo
} from "../components/Icons";
import { loadActiveProfile, clearActiveProfile, deriveConfidenceState } from "../lib/profileStorage";

export default function SettingsPage() {
  const [, navigate] = useLocation();
  const profile = loadActiveProfile();
  const confidenceLevel = profile ? deriveConfidenceState(profile) : "unverified";

  const handleResetEngine = () => {
    if (confirm("Reset local Soul Codex profile?\n\nThis clears profile data stored on this device and returns you to onboarding. Server account data is not deleted.")) {
      clearActiveProfile();
      localStorage.clear();
      window.location.href = "/";
    }
  };

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
          {/* Local profile data */}
          <div className="glassmorphism" style={{ padding: "2rem", borderRadius: "24px", marginBottom: "1.5rem", borderLeft: "4px solid var(--sc-danger)" }}>
            <h2 className="section-label" style={{ marginBottom: "1rem", color: "var(--sc-danger)" }}>Profile Data</h2>
            <p style={{ fontSize: "0.9rem", color: "var(--sc-stone)", marginBottom: "1.5rem" }}>
              Clear the profile stored on this device and begin calibration again. This does not delete server account data.
            </p>
            <button
              onClick={handleResetEngine}
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
              Reset Local Profile
            </button>
          </div>

          {/* Profile State */}
          <div className="glassmorphism" style={{ padding: "2rem", borderRadius: "24px", marginBottom: "1.5rem" }}>
            <h2 className="section-label" style={{ marginBottom: "1.5rem" }}>Active Profile</h2>
            {profile ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <p style={{ fontSize: "0.85rem", color: "var(--sc-stone)", marginBottom: "0.25rem" }}>Birth Date</p>
                    <p style={{ fontSize: "1rem", color: "var(--sc-ivory)" }}>{profile.birthDate || "—"}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "0.85rem", color: "var(--sc-stone)", marginBottom: "0.25rem" }}>Confidence</p>
                    <p style={{ fontSize: "1rem", color: "var(--sc-ivory)", textTransform: "capitalize" }}>{confidenceLevel}</p>
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: "0.85rem", color: "var(--sc-stone)", marginBottom: "0.5rem" }}>Archetype</p>
                  <p style={{ fontSize: "1rem", color: "var(--sc-gold)" }}>{profile.archetype || profile.codename || "Calibrating..."}</p>
                </div>
                <button
                  onClick={() => navigate("/start")}
                  style={{
                    padding: "1rem",
                    background: "rgba(212, 168, 95, 0.1)",
                    border: "1px solid var(--sc-gold)",
                    borderRadius: "12px",
                    color: "var(--sc-gold)",
                    cursor: "pointer",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.background = "rgba(212, 168, 95, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.background = "rgba(212, 168, 95, 0.1)";
                  }}
                >
                  Recalibrate Profile
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center", textAlign: "center", padding: "2rem 0" }}>
                <p style={{ fontSize: "1rem", color: "var(--sc-stone)" }}>No active profile</p>
                <button
                  onClick={() => navigate("/start")}
                  style={{
                    padding: "1rem 2rem",
                    background: "rgba(212, 168, 95, 0.15)",
                    border: "1px solid var(--sc-gold)",
                    borderRadius: "12px",
                    color: "var(--sc-gold)",
                    cursor: "pointer",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.background = "rgba(212, 168, 95, 0.25)";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.background = "rgba(212, 168, 95, 0.15)";
                  }}
                >
                  Start Calibration
                </button>
              </div>
            )}
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
              <button
                onClick={() => navigate("/support")}
                style={{
                  padding: "1rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "12px", color: "var(--sc-ivory)", cursor: "pointer", textAlign: "left",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <IconInfo size={16} /> Support
                </span>
                <span style={{ opacity: 0.4 }}>›</span>
              </button>
              <button
                onClick={() => navigate("/account-deletion")}
                style={{
                  padding: "1rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.28)",
                  borderRadius: "12px", color: "var(--sc-danger)", cursor: "pointer", textAlign: "left",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <IconAlert size={16} /> Delete Account & Data
                </span>
                <span style={{ opacity: 0.6 }}>›</span>
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
