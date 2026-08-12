import { useState } from "react";
import { Link } from "wouter";
import { IconAlert, IconArrowLeft, IconLock } from "../components/Icons";
import { apiRequest, queryClient } from "../lib/queryClient";
import { clearOfflineProfiles } from "../lib/offlineProfileStore";

const DELETE_CONFIRMATION = "DELETE";

export default function AccountDeletionPage() {
  const [confirmation, setConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirmation.trim().toUpperCase() === DELETE_CONFIRMATION;

  const deleteAccount = async () => {
    if (!canDelete || isDeleting) return;
    setError(null);
    setIsDeleting(true);

    try {
      await apiRequest("DELETE", "/api/auth/account");
      await clearOfflineProfiles();

      queryClient.clear();
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace("/?accountDeleted=1");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Deletion failed. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="nebula-bg" style={{ minHeight: "100vh", padding: "var(--safe-top) 1.5rem var(--safe-bottom)" }}>
      <main style={{ maxWidth: 640, margin: "0 auto", padding: "2rem 0 6rem" }}>
        <Link href="/settings" className="btn btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem" }}>
          <IconArrowLeft size={16} /> Back to Settings
        </Link>

        <section className="glassmorphism" style={{ padding: "2rem", borderRadius: 24, border: "1px solid rgba(239,68,68,0.35)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem", color: "var(--sc-danger)" }}>
            <IconAlert size={24} />
            <h1 className="heading-display" style={{ fontSize: "1.8rem", margin: 0 }}>Delete Account & Data</h1>
          </div>

          <p style={{ color: "var(--sc-ivory)", lineHeight: 1.7 }}>
            This permanently deletes your Soul Codex account, profiles, journal entries, shared links,
            compatibility contacts, notification subscriptions, usage history, and premium entitlement history
            associated with this account or anonymous session. It also clears Soul Codex data from this device.
          </p>
          <p style={{ color: "var(--sc-danger)", fontWeight: 700 }}>This cannot be undone.</p>

          <label htmlFor="delete-confirmation" style={{ display: "block", color: "var(--sc-stone)", margin: "1.5rem 0 0.5rem" }}>
            Type <strong style={{ color: "var(--sc-ivory)" }}>{DELETE_CONFIRMATION}</strong> to confirm
          </label>
          <input
            id="delete-confirmation"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            autoCapitalize="characters"
            autoComplete="off"
            className="w-full"
            style={{ padding: "0.9rem 1rem", borderRadius: 12, background: "rgba(0,0,0,0.25)", border: "1px solid rgba(239,68,68,0.4)", color: "var(--sc-ivory)" }}
          />

          {error && <p role="alert" style={{ color: "var(--sc-danger)", marginTop: "1rem" }}>{error}</p>}

          <button
            type="button"
            onClick={deleteAccount}
            disabled={!canDelete || isDeleting}
            style={{
              width: "100%", marginTop: "1.25rem", padding: "1rem", borderRadius: 12,
              border: "1px solid var(--sc-danger)", background: "rgba(239,68,68,0.16)",
              color: "var(--sc-danger)", fontWeight: 700, cursor: canDelete && !isDeleting ? "pointer" : "not-allowed",
              opacity: canDelete && !isDeleting ? 1 : 0.45,
            }}
          >
            <IconLock size={16} style={{ display: "inline", marginRight: "0.5rem" }} />
            {isDeleting ? "Deleting…" : "Permanently Delete My Data"}
          </button>
        </section>

        <section className="glassmorphism" style={{ padding: "1.5rem", borderRadius: 18, marginTop: "1.25rem" }}>
          <h2 style={{ fontSize: "1rem", color: "var(--sc-gold)", marginTop: 0 }}>Can’t access the app?</h2>
          <p style={{ color: "var(--sc-stone)", lineHeight: 1.6, marginBottom: "0.75rem" }}>
            Request account deletion from the email address connected to your account. We may ask you to verify ownership before deletion.
          </p>
          <a href="mailto:privacy@soulcodex.app?subject=Soul%20Codex%20account%20deletion%20request" style={{ color: "var(--sc-gold)" }}>
            Request deletion by email
          </a>
        </section>
      </main>
    </div>
  );
}
