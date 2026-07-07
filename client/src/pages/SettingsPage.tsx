import { useLocation } from "wouter";
import { IconArrowLeft, IconLogo } from "../components/Icons";

export default function SettingsPage() {
  const [, navigate] = useLocation();

  return (
    <div className="nebula-bg" style={{ minHeight: "100vh", padding: "var(--safe-top) 1.5rem var(--safe-bottom)" }}>
      <div style={{ maxWidth: 540, margin: "0 auto", paddingBottom: "6rem" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.5rem 0", marginBottom: "2rem" }}>
          <button onClick={() => navigate("/today")} className="btn btn-ghost" style={{ padding: "0.5rem" }}>
            <IconArrowLeft size={20} />
          </button>
          <IconLogo size={48} />
          <div style={{ width: 44 }} />
        </div>

        <h1 className="heading-display" style={{ fontSize: "1.8rem", marginBottom: "2rem", textAlign: "center" }}>Settings</h1>

        <div className="stagger">
          {/* Account */}
          <div className="glassmorphism" style={{ padding: "1.75rem", borderRadius: "20px", marginBottom: "1.25rem" }}>
            <h2 className="section-label" style={{ marginBottom: "1.25rem" }}>ACCOUNT</h2>
            <button
              className="btn btn-secondary"
              style={{ width: "100%", height: "3rem", marginBottom: "0.75rem" }}
              onClick={() => navigate("/start")}
            >
              Recalibrate Birth Data
            </button>
          </div>

          {/* Legal */}
          <div className="glassmorphism" style={{ padding: "1.75rem", borderRadius: "20px", marginBottom: "1.25rem" }}>
            <h2 className="section-label" style={{ marginBottom: "1.25rem" }}>LEGAL</h2>
            <div style={{ display: "grid", gap: "0.75rem" }}>
              <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "flex-start", padding: "0.75rem 1rem" }} onClick={() => navigate("/privacy")}>
                Privacy Policy
              </button>
              <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "flex-start", padding: "0.75rem 1rem" }} onClick={() => navigate("/terms")}>
                Terms of Service
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="glassmorphism" style={{ padding: "1.75rem", borderRadius: "20px", borderTop: "3px solid var(--sc-danger)" }}>
            <h2 className="section-label" style={{ color: "var(--sc-danger)", marginBottom: "1.25rem" }}>DANGER ZONE</h2>
            <p style={{ color: "var(--sc-stone)", fontSize: "0.85rem", marginBottom: "1rem", lineHeight: 1.6 }}>
              This permanently clears all profile data, readings, and settings from this device.
            </p>
            <button
              className="btn"
              style={{
                width: "100%",
                height: "3rem",
                background: "rgba(236, 72, 153, 0.1)",
                border: "1px solid rgba(236, 72, 153, 0.3)",
                color: "var(--sc-danger)",
              }}
              onClick={() => {
                if (confirm("Reset Soul Codex? This will permanently clear your profile, readings, and all saved data on this device.")) {
                  localStorage.clear();
                  window.location.href = "/";
                }
              }}
            >
              Reset All Data
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
