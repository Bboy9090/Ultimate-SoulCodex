import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation, useParams } from "wouter";
import Navigation from "@/components/navigation";
import { SoulCircleError, soulCircleApi } from "@/lib/soulCircleClient";

type CurrentUser = { id: string } | null;

const PENDING_INVITE_KEY = "soulcodex.pendingCircleInvite";

function rememberInvite(token: string) {
  try { window.sessionStorage.setItem(PENDING_INVITE_KEY, token); } catch { /* storage may be blocked */ }
}
function forgetInvite() {
  try { window.sessionStorage.removeItem(PENDING_INVITE_KEY); } catch { /* storage may be blocked */ }
}

export default function SoulCircleJoinPage() {
  const { token = "" } = useParams<{ token: string }>();
  const [, navigate] = useLocation();
  const { data: user, isLoading: userLoading } = useQuery<CurrentUser>({ queryKey: ["/api/auth/user"], refetchOnMount: true });
  const [inviterName, setInviterName] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [unavailable, setUnavailable] = useState(false);
  const [joining, setJoining] = useState(false);
  const signedIn = Boolean(user);

  useEffect(() => {
    if (!signedIn) { if (!userLoading && token) rememberInvite(token); return; }
    let cancelled = false;
    soulCircleApi.previewInvite(token)
      .then((preview) => { if (!cancelled) setInviterName(preview.inviterName); })
      .catch((failure) => {
        if (cancelled) return;
        if (failure instanceof SoulCircleError && failure.code === "own_invite") { setError(failure.message); return; }
        setUnavailable(true);
        forgetInvite();
      });
    return () => { cancelled = true; };
  }, [signedIn, userLoading, token]);

  async function join() {
    setJoining(true); setError("");
    try {
      const joined = await soulCircleApi.acceptInvite(token);
      forgetInvite();
      navigate(`/circle/${joined.id}`);
    } catch (failure) {
      if (failure instanceof SoulCircleError && failure.code === "invite_unavailable") { setUnavailable(true); forgetInvite(); }
      else setError(failure instanceof SoulCircleError ? failure.message : "Could not join the circle.");
    } finally { setJoining(false); }
  }

  return (
    <div className="sc-app-shell">
      <Navigation />
      <main className="sc-page">
        <section className="sc-panel mx-auto max-w-2xl p-6" data-testid="circle-join">
          <p className="sc-eyebrow">Soul Circle invite</p>
          {userLoading ? (
            <p className="mt-4 text-sm text-[var(--sc-stone)]">Checking your account…</p>
          ) : !signedIn ? (
            <>
              <h1 className="mt-3 font-serif text-3xl text-[var(--sc-ivory)]">You&apos;ve been invited to a Soul Circle</h1>
              <p className="mt-3 text-sm leading-6 text-[var(--sc-stone)]">
                Connect an account first, so that only the friends you accept can ever see what you choose to share. We&apos;ll keep this invite for you; open it again after signing in.
              </p>
              <Link href="/settings" className="sc-button-primary mt-5 inline-flex no-underline" data-testid="circle-join-signin">Open account settings</Link>
            </>
          ) : unavailable ? (
            <>
              <h1 className="mt-3 font-serif text-3xl text-[var(--sc-ivory)]">This invite is no longer available</h1>
              <p className="mt-3 text-sm leading-6 text-[var(--sc-stone)]">It may have expired, been used, or been cancelled. Ask your friend for a new link.</p>
              <Link href="/circle" className="sc-button-secondary mt-5 inline-flex no-underline">Go to Soul Circle</Link>
            </>
          ) : (
            <>
              <h1 className="mt-3 font-serif text-3xl text-[var(--sc-ivory)]">
                {inviterName ? `${inviterName} invited you` : "Loading your invite…"}
              </h1>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--sc-stone)]">
                <li>Joining shares nothing from either of you.</li>
                <li>You each choose what this one friend can see, and only independently verified signs can be shared.</li>
                <li>Your account name is never shown. You can stop sharing, remove them, or block them at any time.</li>
              </ul>
              {error ? <p role="alert" className="mt-4 text-sm text-[var(--sc-ivory-soft)]">{error}</p> : null}
              <button type="button" onClick={join} disabled={joining || !inviterName} className="sc-button-primary mt-5" data-testid="circle-join-accept">
                {joining ? "Joining…" : "Join this circle"}
              </button>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
