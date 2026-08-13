import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Capacitor } from "@capacitor/core";
import Navigation from "@/components/navigation";
import AppleSignInButton from "@/components/AppleSignInButton";
import {
  IconAlert,
  IconChevronRight,
  IconIdentity,
  IconInfo,
  IconLock,
  IconSparkles,
} from "../components/Icons";
import { apiRequest, queryClient } from "../lib/queryClient";

type CurrentUser = {
  id: string;
  username: string;
  email?: string | null;
  authProvider?: string;
};

const panel: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.09)",
  borderRadius: 22,
  background: "linear-gradient(145deg, rgba(24,18,37,.94), rgba(12,9,21,.94))",
  boxShadow: "0 24px 70px rgba(0,0,0,.28)",
};

export default function SettingsPage() {
  const [, navigate] = useLocation();
  const nativeApple = Capacitor.isNativePlatform();
  const { data: currentUser, isLoading: userLoading } = useQuery<CurrentUser | null>({
    queryKey: ["/api/auth/user"],
    refetchOnMount: true,
  });

  const clearLocalData = () => {
    const confirmed = window.confirm(
      "Clear Soul Codex data from this device?\n\nThis removes the locally saved profile and offline application data from this browser. Server-backed account data, if any, is not removed by this action.",
    );

    if (!confirmed) return;
    localStorage.clear();
    window.location.href = "/";
  };

  const logout = async () => {
    await apiRequest("POST", "/api/auth/logout");
    queryClient.setQueryData(["/api/auth/user"], null);
    queryClient.setQueryData(["/api/user"], null);
  };

  const accountLabel = userLoading
    ? "Checking account"
    : currentUser
      ? currentUser.authProvider === "apple" ? "Apple account connected" : "Account connected"
      : "Local-only profile";

  return (
    <div
      style={{
        minHeight: "100vh",
        color: "#f7f0e4",
        background:
          "radial-gradient(circle at 14% 4%,rgba(117,75,181,.24),transparent 30%),radial-gradient(circle at 86% 18%,rgba(36,161,170,.09),transparent 25%),#09070f",
      }}
    >
      <Navigation />
      <main style={{ maxWidth: 980, margin: "0 auto", padding: "112px 18px 88px" }}>
        <header style={{ display: "grid", gridTemplateColumns: "minmax(0,1.3fr) minmax(260px,.7fr)", gap: 18, alignItems: "stretch", marginBottom: 18 }} className="settings-hero-grid">
          <section style={{ ...panel, padding: "clamp(24px,5vw,42px)", position: "relative", overflow: "hidden", borderColor: "rgba(212,168,95,.22)" }}>
            <div aria-hidden="true" style={{ position: "absolute", width: 220, height: 220, borderRadius: "50%", border: "1px solid rgba(212,168,95,.11)", right: -76, top: -76 }} />
            <div aria-hidden="true" style={{ position: "absolute", width: 150, height: 150, borderRadius: "50%", border: "1px solid rgba(167,139,250,.12)", right: -42, top: -42 }} />
            <p style={{ margin: "0 0 10px", color: "#D4A85F", textTransform: "uppercase", letterSpacing: ".18em", fontSize: 11, fontWeight: 800 }}>Account & trust</p>
            <h1 style={{ margin: "0 0 14px", fontFamily: "var(--font-serif)", fontSize: "clamp(2.5rem,7vw,4.7rem)", lineHeight: 1.02 }}>
              Your Codex,<br />under your control.
            </h1>
            <p style={{ margin: 0, maxWidth: 620, color: "rgba(247,240,228,.67)", lineHeight: 1.75, fontSize: 16 }}>
              Manage identity, device storage, privacy, support, and account deletion from one place. Local data and server-backed account data are kept distinct so each control does exactly what it says.
            </p>
          </section>

          <section style={{ ...panel, padding: 24, display: "flex", flexDirection: "column", justifyContent: "space-between", background: "linear-gradient(160deg,rgba(212,168,95,.09),rgba(14,11,24,.96))" }}>
            <div>
              <div style={{ width: 54, height: 54, borderRadius: 16, display: "grid", placeItems: "center", background: "rgba(212,168,95,.12)", border: "1px solid rgba(212,168,95,.24)", color: "#D4A85F", marginBottom: 18 }}>
                <IconIdentity size={25} />
              </div>
              <p style={{ margin: "0 0 6px", color: "rgba(247,240,228,.45)", textTransform: "uppercase", letterSpacing: ".13em", fontSize: 10 }}>Current state</p>
              <h2 style={{ margin: "0 0 8px", fontSize: 22 }}>{accountLabel}</h2>
              <p style={{ margin: 0, color: "rgba(247,240,228,.58)", lineHeight: 1.6, fontSize: 14 }}>
                {currentUser
                  ? currentUser.email || "Apple may keep your relay address private."
                  : "Your saved profile can continue locally without an account."}
              </p>
            </div>
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.08)", color: "rgba(247,240,228,.5)", fontSize: 12, lineHeight: 1.5 }}>
              {nativeApple ? "Native Apple authentication available on this device." : "Apple authentication is offered inside the iPhone and iPad app."}
            </div>
          </section>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 18 }} className="settings-main-grid">
          <section style={{ ...panel, padding: 24 }}>
            <SectionHeading icon={<IconIdentity size={18} />} eyebrow="Identity" title="Account" />
            {userLoading ? (
              <div style={{ marginTop: 18, height: 122, borderRadius: 16, background: "rgba(255,255,255,.035)", border: "1px solid rgba(255,255,255,.07)", display: "grid", placeItems: "center", color: "rgba(247,240,228,.52)" }}>Checking account status…</div>
            ) : currentUser ? (
              <div style={{ marginTop: 18 }}>
                <div style={{ padding: 18, borderRadius: 16, background: "rgba(114,214,183,.055)", border: "1px solid rgba(114,214,183,.18)", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#72d6b7", boxShadow: "0 0 18px rgba(114,214,183,.5)" }} />
                    <strong>{currentUser.authProvider === "apple" ? "Signed in with Apple" : "Signed in"}</strong>
                  </div>
                  <p style={{ margin: 0, color: "rgba(247,240,228,.58)", fontSize: 14, lineHeight: 1.55 }}>{currentUser.email || "Private Apple account"}</p>
                </div>
                <button type="button" data-testid="button-logout" onClick={logout} className="settings-secondary-action">Sign Out</button>
              </div>
            ) : (
              <div style={{ marginTop: 18 }}>
                <p style={{ margin: "0 0 16px", color: "rgba(247,240,228,.62)", fontSize: 14, lineHeight: 1.7 }}>
                  Your local profile works without sign-in. On iPhone or iPad, Apple sign-in can attach server-backed data to one account without changing the local-first model.
                </p>
                <AppleSignInButton
                  onSuccess={(user) => queryClient.setQueryData(["/api/auth/user"], { ...user, authProvider: "apple" })}
                />
              </div>
            )}
          </section>

          <section style={{ ...panel, padding: 24 }}>
            <SectionHeading icon={<IconLock size={18} />} eyebrow="Storage boundary" title="This device" />
            <p style={{ margin: "18px 0", color: "rgba(247,240,228,.62)", fontSize: 14, lineHeight: 1.7 }}>
              Soul Codex keeps a local-first profile so your reading can reopen offline. Clearing this device removes local profile and cached app data only. It does not delete a separate server-backed account.
            </p>
            <div style={{ padding: 14, borderRadius: 14, background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.07)", marginBottom: 14 }}>
              <p style={{ margin: 0, color: "rgba(247,240,228,.52)", fontSize: 12, lineHeight: 1.6 }}>
                <strong style={{ color: "#f7f0e4" }}>Local clear</strong> and <strong style={{ color: "#f7f0e4" }}>account deletion</strong> are intentionally separate actions. One should never silently impersonate the other.
              </p>
            </div>
            <button type="button" data-testid="button-clear-local-data" onClick={clearLocalData} className="settings-danger-action">
              <IconAlert size={16} /> Clear Data From This Device
            </button>
          </section>

          <section style={{ ...panel, padding: 24, gridColumn: "1 / -1" }}>
            <SectionHeading icon={<IconSparkles size={18} />} eyebrow="Rights & help" title="Privacy, support, and deletion" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12, marginTop: 18 }} className="settings-link-grid">
              <SettingsLink label="Privacy Policy" description="What Soul Codex stores, why, and where." icon={<IconLock size={17} />} onClick={() => navigate("/privacy")} />
              <SettingsLink label="Terms of Service" description="The operating terms for the app and service." icon={<IconInfo size={17} />} onClick={() => navigate("/terms")} />
              <SettingsLink label="Support & Data Requests" description="Get help or request server-data assistance." icon={<IconInfo size={17} />} onClick={() => navigate("/support")} />
              <SettingsLink label="Delete Account & Data" description="Permanent server-backed account deletion flow." icon={<IconAlert size={17} />} danger onClick={() => navigate("/delete-account")} />
            </div>
          </section>
        </div>

        <footer style={{ textAlign: "center", padding: "28px 12px 0", color: "rgba(247,240,228,.38)", fontSize: 12, lineHeight: 1.7 }}>
          <div>Soul Codex Foundation Web</div>
          <div>Evidence-traceable identity and relationship insight</div>
        </footer>
      </main>

      <style>{`
        .settings-secondary-action,.settings-danger-action{width:100%;min-height:46px;border-radius:13px;font:inherit;font-weight:700;cursor:pointer;transition:transform .18s ease,border-color .18s ease,background .18s ease}
        .settings-secondary-action{border:1px solid rgba(255,255,255,.13);background:rgba(255,255,255,.035);color:#f7f0e4}
        .settings-danger-action{display:flex;align-items:center;justify-content:center;gap:8px;border:1px solid rgba(239,68,68,.42);background:rgba(239,68,68,.08);color:#ff9b9b}
        .settings-secondary-action:hover,.settings-danger-action:hover,.settings-link:hover{transform:translateY(-1px)}
        .settings-secondary-action:focus-visible,.settings-danger-action:focus-visible,.settings-link:focus-visible{outline:2px solid #D4A85F;outline-offset:3px}
        .settings-link{display:flex;align-items:center;justify-content:space-between;gap:14px;width:100%;min-height:82px;padding:16px;border:1px solid rgba(255,255,255,.08);border-radius:16px;background:rgba(255,255,255,.025);color:#f7f0e4;text-align:left;cursor:pointer;transition:transform .18s ease,border-color .18s ease,background .18s ease}
        .settings-link:hover{border-color:rgba(212,168,95,.28);background:rgba(212,168,95,.045)}
        .settings-link-danger:hover{border-color:rgba(239,68,68,.35);background:rgba(239,68,68,.045)}
        @media (max-width:760px){.settings-hero-grid,.settings-main-grid{grid-template-columns:1fr!important}.settings-link-grid{grid-template-columns:1fr!important}}
        @media (prefers-reduced-motion:reduce){.settings-secondary-action,.settings-danger-action,.settings-link{transition:none}.settings-secondary-action:hover,.settings-danger-action:hover,.settings-link:hover{transform:none}}
      `}</style>
    </div>
  );
}

function SectionHeading({ icon, eyebrow, title }: { icon: React.ReactNode; eyebrow: string; title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ width: 38, height: 38, borderRadius: 12, display: "grid", placeItems: "center", color: "#D4A85F", background: "rgba(212,168,95,.09)", border: "1px solid rgba(212,168,95,.18)" }}>{icon}</span>
      <div>
        <p style={{ margin: "0 0 2px", color: "#D4A85F", textTransform: "uppercase", letterSpacing: ".14em", fontSize: 9, fontWeight: 800 }}>{eyebrow}</p>
        <h2 style={{ margin: 0, fontSize: 20 }}>{title}</h2>
      </div>
    </div>
  );
}

function SettingsLink({ label, description, icon, danger = false, onClick }: { label: string; description: string; icon: React.ReactNode; danger?: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`settings-link${danger ? " settings-link-danger" : ""}`}>
      <span style={{ display: "flex", alignItems: "center", gap: 13, minWidth: 0 }}>
        <span style={{ color: danger ? "#ff9b9b" : "#D4A85F", flexShrink: 0 }}>{icon}</span>
        <span style={{ minWidth: 0 }}>
          <strong style={{ display: "block", fontSize: 14, marginBottom: 3 }}>{label}</strong>
          <span style={{ display: "block", color: "rgba(247,240,228,.48)", fontSize: 12, lineHeight: 1.45 }}>{description}</span>
        </span>
      </span>
      <IconChevronRight size={17} style={{ color: "rgba(247,240,228,.32)", flexShrink: 0 }} />
    </button>
  );
}
