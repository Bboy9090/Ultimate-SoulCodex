import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";

type Mode = "signin" | "signup";

type AuthResponse = {
  user?: {
    id: string;
    email?: string | null;
    username?: string;
  };
  message?: string;
};

export default function EmailAccountAuth() {
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setStatus("");
    try {
      const endpoint = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
      const body = mode === "signup" ? { email, password, name: name.trim() || undefined } : { email, password };
      const response = await apiRequest("POST", endpoint, body);
      const payload = await response.json() as AuthResponse;
      if (payload.user) {
        queryClient.setQueryData(["/api/auth/user"], { ...payload.user, authProvider: "local" });
        queryClient.setQueryData(["/api/user"], { ...payload.user, authProvider: "local" });
      }
      setStatus(mode === "signup" ? "Account created and connected." : "Signed in.");
      setPassword("");
    } catch (error) {
      const message = error instanceof Error ? error.message.replace(/^\d+:\s*/, "") : "Sign-in failed.";
      setStatus(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4" data-testid="email-account-auth">
      <div className="flex gap-2" role="tablist" aria-label="Email account mode">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signin"}
          className={mode === "signin" ? "sc-button-secondary flex-1" : "sc-button-ghost flex-1"}
          onClick={() => { setMode("signin"); setStatus(""); }}
        >
          Sign in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signup"}
          className={mode === "signup" ? "sc-button-secondary flex-1" : "sc-button-ghost flex-1"}
          onClick={() => { setMode("signup"); setStatus(""); }}
        >
          Create account
        </button>
      </div>

      <form className="mt-4 grid gap-3" onSubmit={submit}>
        {mode === "signup" && (
          <label className="grid gap-1 text-xs text-[var(--sc-stone)]">
            Name <Input className="min-h-12 text-base md:text-base" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </label>
        )}
        <label className="grid gap-1 text-xs text-[var(--sc-stone)]">
          Email
          <Input
            className="min-h-12 text-base md:text-base"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            inputMode="email"
          />
        </label>
        <label className="grid gap-1 text-xs text-[var(--sc-stone)]">
          Password
          <Input
            className="min-h-12 text-base md:text-base"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
          />
        </label>
        <button className="sc-button-secondary w-full" type="submit" disabled={busy}>
          {busy ? "Working…" : mode === "signup" ? "Create Soul Codex account" : "Sign in with email"}
        </button>
      </form>

      {status && <p className="mb-0 mt-3 text-xs leading-5 text-[var(--sc-stone)]" role="status">{status}</p>}
      <p className="mb-0 mt-3 text-[11px] leading-5 text-[var(--sc-stone)]">
        Works on Android, iPhone, and web. Your local profile stays usable even when you are signed out.
      </p>
    </div>
  );
}
