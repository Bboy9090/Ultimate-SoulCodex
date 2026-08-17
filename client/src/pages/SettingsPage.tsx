import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Capacitor } from "@capacitor/core";
import Navigation from "@/components/navigation";
import AppleSignInButton from "@/components/AppleSignInButton";
import { Activity, ChevronRight, Database, Shield, UserRound } from "lucide-react";
import { apiRequest, queryClient } from "../lib/queryClient";

type CurrentUser = {
  id: string;
  username: string;
  email?: string | null;
  authProvider?: string;
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
    <div className="sc-app-shell">
      <Navigation />
      <main className="sc-page max-w-5xl pt-28">
        <header className="grid gap-4 lg:grid-cols-[1.4fr_.6fr]">
          <section className="sc-panel sc-panel-gold p-7 md:p-10">
            <p className="sc-eyebrow">Account & trust</p>
            <h1 className="sc-display">Your Codex, under your control.</h1>
            <p className="sc-lede">Manage Identity, local storage, privacy, runtime diagnostics, support, and account deletion. Local and server-backed data remain separate so each control does exactly what it says.</p>
          </section>
          <section className="sc-panel p-6">
            <div className="sc-icon-well"><UserRound className="h-5 w-5" /></div>
            <p className="sc-eyebrow mt-5">Current state</p>
            <h2 className="font-serif text-2xl">{accountLabel}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--sc-stone)]">{currentUser ? currentUser.email || "Apple may keep your relay address private." : "Your saved profile can continue locally without an account."}</p>
            <p className="mt-5 border-t border-[var(--sc-line)] pt-4 text-xs text-[var(--sc-stone)]">{nativeApple ? "Native Apple authentication available on this device." : "Apple authentication is offered inside the iPhone and iPad app."}</p>
          </section>
        </header>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <section className="sc-panel p-6">
            <Heading icon={<UserRound className="h-4 w-4" />} eyebrow="Identity" title="Account" />
            {userLoading ? (
              <div className="mt-5 rounded-xl border border-[var(--sc-line)] p-5 text-center text-sm text-[var(--sc-stone)]">Checking account status…</div>
            ) : currentUser ? (
              <div className="mt-5">
                <div className="rounded-xl border border-[rgba(114,216,183,.18)] bg-[rgba(114,216,183,.05)] p-4"><strong>{currentUser.authProvider === "apple" ? "Signed in with Apple" : "Signed in"}</strong><p className="mt-2 text-sm text-[var(--sc-stone)]">{currentUser.email || "Private Apple account"}</p></div>
                <button type="button" data-testid="button-logout" onClick={logout} className="sc-button-secondary mt-3 w-full">Sign out</button>
              </div>
            ) : (
              <div className="mt-5"><p className="text-sm leading-7 text-[var(--sc-stone)]">Your local profile works without sign-in. Apple sign-in may attach server-backed data to one account without changing the local-first model.</p><div className="mt-4"><AppleSignInButton onSuccess={(user) => queryClient.setQueryData(["/api/auth/user"], { ...user, authProvider: "apple" })} /></div></div>
            )}
          </section>

          <section className="sc-panel p-6">
            <Heading icon={<Database className="h-4 w-4" />} eyebrow="Storage boundary" title="This device" />
            <p className="mt-5 text-sm leading-7 text-[var(--sc-stone)]">Clearing this device removes the local profile and cached app data only. It does not delete a separate server-backed account.</p>
            <button type="button" data-testid="button-clear-local-data" onClick={clearLocalData} className="settings-danger mt-5 w-full">Clear data from this device</button>
          </section>
        </div>

        <section className="sc-panel mt-4 p-6">
          <Heading icon={<Shield className="h-4 w-4" />} eyebrow="Trust & operations" title="Privacy, support, and release truth" />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <SettingsLink label="Privacy Policy" description="What Soul Codex stores, why, and where." onClick={() => navigate("/privacy")} />
            <SettingsLink label="Terms of Service" description="The operating terms for the app and service." onClick={() => navigate("/terms")} />
            <SettingsLink label="Support & Data Requests" description="Get help or request server-data assistance." onClick={() => navigate("/support")} />
            <SettingsLink label="Diagnostics" description="Client SHA, backend SHA, API contract, and Compatibility route status." icon={<Activity className="h-4 w-4" />} onClick={() => navigate("/diagnostics")} />
            <SettingsLink label="Delete Account & Data" description="Permanent server-backed account deletion flow." danger onClick={() => navigate("/delete-account")} />
          </div>
        </section>

        <footer className="pt-8 text-center text-xs leading-6 text-[var(--sc-stone)]">Soul Codex · evidence-traceable Identity and relationship insight</footer>
      </main>
      <style>{`.settings-danger{min-height:46px;border-radius:.8rem;border:1px solid rgba(239,68,68,.38);background:rgba(239,68,68,.07);color:#ff9b9b;font:inherit;font-weight:700;cursor:pointer}.settings-link{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;min-height:78px;padding:15px;border:1px solid var(--sc-line);border-radius:1rem;background:rgba(255,255,255,.02);color:var(--sc-ivory);text-align:left;cursor:pointer}.settings-link:hover{border-color:var(--sc-line-gold);background:rgba(217,182,111,.04)}.settings-link-danger:hover{border-color:rgba(239,68,68,.35);background:rgba(239,68,68,.04)}.settings-link:focus-visible,.settings-danger:focus-visible{outline:2px solid var(--sc-gold);outline-offset:3px}`}</style>
    </div>
  );
}

function Heading({ icon, eyebrow, title }: { icon: React.ReactNode; eyebrow: string; title: string }) {
  return <div className="flex items-center gap-3"><span className="sc-icon-well">{icon}</span><div><p className="sc-eyebrow">{eyebrow}</p><h2 className="font-serif text-xl">{title}</h2></div></div>;
}

function SettingsLink({ label, description, icon, danger = false, onClick }: { label: string; description: string; icon?: React.ReactNode; danger?: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`settings-link${danger ? " settings-link-danger" : ""}`}><span className="flex min-w-0 items-center gap-3">{icon && <span className={danger ? "text-[#ff9b9b]" : "text-[var(--sc-gold)]"}>{icon}</span>}<span className="min-w-0"><strong className="block text-sm">{label}</strong><span className="mt-1 block text-xs leading-5 text-[var(--sc-stone)]">{description}</span></span></span><ChevronRight className="h-4 w-4 shrink-0 text-[var(--sc-stone)]" /></button>;
}
