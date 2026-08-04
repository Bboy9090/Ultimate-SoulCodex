import { useLocation } from "wouter";
import Navigation from "@/components/navigation";
import { IconAlert, IconInfo, IconLock } from "../components/Icons";

export default function SettingsPage() {
  const [, navigate] = useLocation();

  const clearLocalData = () => {
    const confirmed = window.confirm(
      "Clear Soul Codex data from this device?\n\nThis removes the locally saved profile and offline application data from this browser. Server-backed account data, if any, is not removed by this action.",
    );

    if (!confirmed) return;

    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="nebula-bg" style={{ minHeight: "100vh" }}>
      <Navigation />
      <main
        style={{
          maxWidth: 640,
          margin: "0 auto",
          padding: "7rem 1.5rem 6rem",
        }}
      >
        <div style={{ marginBottom: "2rem" }}>
          <h1
            className="heading-display"
            style={{ fontSize: "clamp(1.8rem, 5vw, 2.4rem)", margin: 0 }}
          >
            Settings
          </h1>
          <p style={{ color: "var(--sc-stone)", lineHeight: 1.7 }}>
            Manage local data, privacy information, and support access.
          </p>
        </div>

        <div className="stagger">
          <section
            className="glassmorphism"
            style={{
              padding: "clamp(1.25rem, 5vw, 2rem)",
              borderRadius: 24,
              marginBottom: "1.5rem",
              borderLeft: "4px solid var(--sc-danger)",
            }}
          >
            <h2
              className="section-label"
              style={{ marginBottom: "1rem", color: "var(--sc-danger)" }}
            >
              Local Data Controls
            </h2>
            <p
              style={{
                fontSize: "0.9rem",
                color: "var(--sc-stone)",
                marginBottom: "1.5rem",
                lineHeight: 1.65,
              }}
            >
              Soul Codex keeps a local-first profile in this browser so the
              reading can reopen offline. Clearing it removes this device's
              saved profile and cached application data. It does not delete a
              separate server-backed account.
            </p>
            <button
              type="button"
              data-testid="button-clear-local-data"
              onClick={clearLocalData}
              style={{
                width: "100%",
                padding: "1rem",
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid var(--sc-danger)",
                color: "var(--sc-danger)",
                borderRadius: 12,
                cursor: "pointer",
                fontSize: "0.95rem",
                fontWeight: 600,
              }}
            >
              <IconAlert
                size={16}
                style={{ marginRight: "0.5rem", display: "inline" }}
              />
              Clear Data From This Device
            </button>
          </section>

          <section
            className="glassmorphism"
            style={{
              padding: "clamp(1.25rem, 5vw, 2rem)",
              borderRadius: 24,
              marginBottom: "1.5rem",
            }}
          >
            <h2 className="section-label" style={{ marginBottom: "1.5rem" }}>
              Privacy, Terms, and Support
            </h2>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <SettingsLink
                label="Privacy Policy"
                icon={<IconLock size={16} />}
                onClick={() => navigate("/privacy")}
              />
              <SettingsLink
                label="Terms of Service"
                icon={<IconInfo size={16} />}
                onClick={() => navigate("/terms")}
              />
              <SettingsLink
                label="Support and Server-Data Requests"
                icon={<IconInfo size={16} />}
                onClick={() => navigate("/support")}
              />
            </div>
          </section>

          <section
            className="glassmorphism"
            style={{
              padding: "1.5rem",
              borderRadius: 24,
              textAlign: "center",
              opacity: 0.7,
            }}
          >
            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--sc-stone)",
                margin: 0,
              }}
            >
              Soul Codex Foundation Web
            </p>
            <p
              style={{
                fontSize: "0.8rem",
                color: "var(--sc-stone)",
                margin: "0.5rem 0 0",
              }}
            >
              Evidence-traceable identity and relationship insight
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

function SettingsLink({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "1rem",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        color: "var(--sc-ivory)",
        cursor: "pointer",
        textAlign: "left",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        {icon}
        {label}
      </span>
      <span aria-hidden="true" style={{ opacity: 0.4 }}>
        ›
      </span>
    </button>
  );
}
