import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Capacitor } from "@capacitor/core";
import {
  AlertTriangle,
  ChevronRight,
  CircleUserRound,
  Info,
  LockKeyhole,
  ShieldCheck,
  Smartphone,
  Stethoscope,
} from "lucide-react";
import Navigation from "@/components/navigation";
import AppleSignInButton from "@/components/AppleSignInButton";
import { clearActiveProfile } from "../lib/ActiveProfileRepository";
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
      "Clear Soul Codex data from this device?\n\nThis removes the locally saved profile and offline application data from this browser or app. Server-backed account data, if any, is not removed by this action.",
    );
    if (!confirmed) return;

    clearActiveProfile();
    localStorage.removeItem("soulTodayCard");
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
      ? currentUser.authProvider === "apple"
        ? "Apple account connected"
        : "Account connected"
      : "Local-only profile";

  return (
    <div className="sc-app-shell">
      <Navigation />
      <main className="sc-page max-w-6xl">
        <header className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,.65fr)]">
          <section className="sc-panel sc-panel-gold p-7 sm:p-9">
            <div className="sc-eyebrow">Account & trust</div>
            <h1 className="mt-4 font-serif text-[clamp(3rem,7vw,5rem)] font-medium leading-[.98] tracking-[-.04em] text-[var(--sc-ivory)]">
              Your Codex,<br />under your control.
            </h1>
            <p className="sc-lede mt-5 max-w-3xl">
              Manage Identity, device storage, privacy, support, deletion, and release diagnostics from one place. Local data and server-backed account data remain separate controls.
            </p>
          </section>

          <section className="sc-panel p-6">
            <span className="sc-icon-well"><CircleUserRound className="h-5 w-5" /></span>
            <p className="mb-0 mt-5 text-[10px] font-bold uppercase tracking-[.16em] text-[var(--sc-stone)]">Current state</p>
            <h2 className="mb-0 mt-2 font-serif text-2xl font-semibold">{accountLabel}</h2>
            <p className="mb-0 mt-2 text-sm leading-6 text-[var(--sc-stone)]">
              {currentUser
                ? currentUser.email || "Apple may keep your relay address private."
                : "Your saved profile can continue locally without an account."}
            </p>
            <div className="mt-5 border-t border-white/[0.07] pt-4 text-xs leading-5 text-[var(--sc-stone)]">
              {nativeApple
                ? "Native Apple authentication is available on this device."
                : "Apple authentication is offered inside the iPhone and iPad app."}
            </div>
          </section>
        </header>

        <section className="mt-4 grid gap-4 lg:grid-cols-2">
          <article className="sc-panel p-6">
            <SectionHeading icon={<CircleUserRound className="h-5 w-5" />} eyebrow="Identity" title="Account" />
            {userLoading ? (
              <p className="mt-5 text-sm text-[var(--sc-stone)]">Checking account status…</p>
            ) : currentUser ? (
              <div className="mt-5">
                <div className="rounded-2xl border border-[rgba(114,216,197,.18)] bg-[rgba(114,216,197,.055)] p-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[var(--sc-teal)] shadow-[0_0_14px_rgba(114,216,197,.5)]" />
                    <strong>{currentUser.authProvider === "apple" ? "Signed in with Apple" : "Signed in"}</strong>
                  </div>
                  <p className="mb-0 mt-2 text-sm text-[var(--sc-stone)]">{currentUser.email || "Private Apple account"}</p>
                </div>
                <button type="button" data-testid="button-logout" onClick={logout} className="sc-button-secondary mt-4 w-full">
                  Sign out
                </button>
              </div>
            ) : (
              <div className="mt-5">
                <p className="text-sm leading-6 text-[var(--sc-stone)]">
                  Your local profile works without sign-in. On iPhone or iPad, Apple sign-in can attach server-backed data to one account without changing the local-first profile model.
                </p>
                <AppleSignInButton
                  onSuccess={(user) => queryClient.setQueryData(["/api/auth/user"], { ...user, authProvider: "apple" })}
                />
              </div>
            )}
          </article>

          <article className="sc-panel p-6">
            <SectionHeading icon={<Smartphone className="h-5 w-5" />} eyebrow="Storage boundary" title="This device" />
            <p className="mt-5 text-sm leading-6 text-[var(--sc-stone)]">
              Soul Codex keeps a local-first profile so your reading can reopen offline. Clearing this device removes local profile and cached app state only. It does not delete a separate server-backed account.
            </p>
            <div className="mt-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 text-xs leading-5 text-[var(--sc-stone)]">
              <strong className="text-[var(--sc-ivory-soft)]">Clear this device</strong> and <strong className="text-[var(--sc-ivory-soft)]">delete account</strong> are intentionally separate actions.
            </div>
            <button
              type="button"
              data-testid="button-clear-local-data"
              onClick={clearLocalData}
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-red-400/[0.06] px-4 py-3 font-semibold text-red-300 hover:bg-red-400/[0.1]"
            >
              <AlertTriangle className="h-4 w-4" /> Clear data from this device
            </button>
          </article>
        </section>

        <section className="sc-panel mt-4 p-6">
          <SectionHeading icon={<ShieldCheck className="h-5 w-5" />} eyebrow="Rights & help" title="Privacy, support, diagnostics, and deletion" />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <SettingsLink label="Privacy Policy" description="What Soul Codex stores, why, and where." icon={<LockKeyhole className="h-4 w-4" />} onClick={() => navigate("/privacy")} />
            <SettingsLink label="Terms of Service" description="The operating terms for the app and service." icon={<Info className="h-4 w-4" />} onClick={() => navigate("/terms")} />
            <SettingsLink label="Support & Data Requests" description="Get help or request server-data assistance." icon={<Info className="h-4 w-4" />} onClick={() => navigate("/support")} />
            <SettingsLink label="About & Diagnostics" description="Inspect client/backend release identity and Compatibility connectivity." icon={<Stethoscope className="h-4 w-4" />} onClick={() => navigate("/diagnostics")} />
            <SettingsLink label="Delete Account & Data" description="Permanent server-backed account deletion flow." icon={<AlertTriangle className="h-4 w-4" />} danger onClick={() => navigate("/delete-account")} />
          </div>
        </section>

        <footer className="pt-7 text-center text-xs leading-5 text-[var(--sc-stone)]">
          <div>Soul Codex Foundation</div>
          <div>Evidence-traceable identity and relationship insight</div>
        </footer>
      </main>
    </div>
  );
}

function SectionHeading({ icon, eyebrow, title }: { icon: React.ReactNode; eyebrow: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="sc-icon-well h-10 w-10 shrink-0">{icon}</span>
      <div>
        <div className="sc-eyebrow text-[10px]">{eyebrow}</div>
        <h2 className="m-0 mt-1 font-serif text-2xl font-semibold">{title}</h2>
      </div>
    </div>
  );
}

function SettingsLink({
  label,
  description,
  icon,
  danger = false,
  onClick,
}: {
  label: string;
  description: string;
  icon: React.ReactNode;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[84px] w-full items-center justify-between gap-3 rounded-2xl border p-4 text-left transition ${
        danger
          ? "border-red-400/20 bg-red-400/[0.035] hover:border-red-400/35"
          : "border-white/[0.07] bg-white/[0.02] hover:border-[rgba(217,182,111,.24)] hover:bg-white/[0.035]"
      }`}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className={`shrink-0 ${danger ? "text-red-300" : "text-[var(--sc-gold)]"}`}>{icon}</span>
        <span className="min-w-0">
          <strong className="block text-sm text-[var(--sc-ivory)]">{label}</strong>
          <span className="mt-1 block text-xs leading-5 text-[var(--sc-stone)]">{description}</span>
        </span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-[var(--sc-stone)]" />
    </button>
  );
}
