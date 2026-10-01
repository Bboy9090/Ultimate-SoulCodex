import { useState } from "react";
import { Link } from "wouter";
import Navigation from "@/components/navigation";
import { IconAlert, IconArrowLeft, IconLock } from "../components/Icons";
import { apiRequest, queryClient } from "../lib/queryClient";
import { clearOfflineProfiles } from "../lib/offlineProfileStore";

const DELETE_CONFIRMATION = "DELETE";
const deletionItems = [
  "Soul Codex account and saved profiles",
  "Journal entries and shared links",
  "Compatibility contacts and notification subscriptions",
  "Usage history and premium entitlement history associated with the account or anonymous session",
  "Soul Codex data stored on this device",
];

const retainedItems = [
  "Operational and security request logs may remain with our hosting provider for up to 7 days before automatic expiration. These logs are not used to restore a deleted Soul Codex account or profile.",
  "No scheduled production database backups are currently enabled. Deleted account and profile records are therefore not intentionally retained in scheduled backups.",
  "If a specific record must be retained to satisfy a legal obligation, it is kept only for the legally required period and is not used for ordinary product personalization.",
];

export default function AccountDeletionPage() {
  const [confirmation, setConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [serverDeleted, setServerDeleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canDelete = confirmation.trim().toUpperCase() === DELETE_CONFIRMATION;
  const canSubmit = serverDeleted || canDelete;

  const clearThisDeviceAfterDeletion = async (): Promise<boolean> => {
    try {
      await clearOfflineProfiles();
      queryClient.clear();
      localStorage.clear();
      sessionStorage.clear();

      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
      }

      return true;
    } catch (cause) {
      console.warn("[AccountDeletion] local cleanup incomplete after server deletion", cause);
      setError(
        "Your server-backed account was deleted, but this device could not finish clearing local Soul Codex data. Retry the local cleanup below before treating device deletion as complete.",
      );
      return false;
    }
  };

  const deleteAccount = async () => {
    if (!canSubmit || isDeleting) return;
    setError(null);
    setIsDeleting(true);

    if (!serverDeleted) {
      try {
        await apiRequest("DELETE", "/api/auth/account");
        setServerDeleted(true);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Deletion failed. Please try again.");
        setIsDeleting(false);
        return;
      }
    }

    const localCleared = await clearThisDeviceAfterDeletion();
    if (!localCleared) {
      setIsDeleting(false);
      return;
    }

    window.location.replace("/?accountDeleted=1");
  };

  return (
    <div className="delete-page">
      <Navigation />
      <main className="delete-shell">
        <Link href="/settings" className="delete-back"><IconArrowLeft size={15}/> Back to Settings</Link>

        <header className="delete-hero">
          <div className="delete-mark"><IconAlert size={26}/></div>
          <div>
            <p className="delete-kicker">Permanent action</p>
            <h1>Delete your Soul Codex account and data</h1>
            <p>Soul Codex provides this public page so users can request permanent deletion of their account and associated data. The server deletion happens first and cannot be undone.</p>
          </div>
        </header>

        <section className="delete-steps-card">
          <p className="delete-label">How to request deletion</p>
          <ol>
            <li><strong>If you can access Soul Codex:</strong> use the permanent deletion control on this page. Type <strong>DELETE</strong>, then select <strong>Permanently Delete My Data</strong>.</li>
            <li><strong>If you cannot access the app or account:</strong> email <a href="mailto:privacy@soulcodex.app?subject=Soul%20Codex%20account%20deletion%20request">privacy@soulcodex.app</a> from the email address associated with the account and request account deletion.</li>
            <li>We may ask you to verify account ownership before processing an email request. Do not send passwords or payment-card information.</li>
          </ol>
        </section>

        <section className="delete-grid">
          <article className="delete-card">
            <p className="delete-label">What will be removed</p>
            <ul>{deletionItems.map(item => <li key={item}>{item}</li>)}</ul>
            <div className="delete-warning"><IconLock size={17}/><span>Deleting the app, clearing a browser, or signing out is not the same as deleting your server-backed account.</span></div>
          </article>

          <article className="delete-confirm">
            <p className="delete-label">Final confirmation</p>
            <h2>This cannot be undone.</h2>
            <label htmlFor="delete-confirmation">Type <strong>{DELETE_CONFIRMATION}</strong> to unlock permanent deletion.</label>
            <input id="delete-confirmation" value={confirmation} onChange={event => setConfirmation(event.target.value)} autoCapitalize="characters" autoComplete="off" aria-describedby="delete-help" disabled={serverDeleted} />
            <p id="delete-help">{serverDeleted
              ? "Server deletion completed. The remaining action only retries cleanup of Soul Codex data on this device."
              : "The delete button remains disabled until the confirmation text matches."}</p>
            {error && <p role="alert" className="delete-error">{error}</p>}
            <button type="button" onClick={deleteAccount} disabled={!canSubmit || isDeleting} data-testid="button-delete-account">
              <IconLock size={16}/>{isDeleting
                ? serverDeleted ? "Clearing this device…" : "Deleting account…"
                : serverDeleted ? "Retry Clearing This Device" : "Permanently Delete My Data"}
            </button>
          </article>
        </section>

        <section className="delete-retention-card">
          <p className="delete-label">What may be kept and for how long</p>
          <ul>{retainedItems.map(item => <li key={item}>{item}</li>)}</ul>
          <p className="delete-retention-note">After successful deletion, Soul Codex does not keep active account or profile content for continued personalization or account recovery.</p>
        </section>

        <section className="delete-help-card">
          <div><strong>Can’t access the app?</strong><span>Request deletion from the email address connected to the account. Ownership verification may be required.</span></div>
          <a href="mailto:privacy@soulcodex.app?subject=Soul%20Codex%20account%20deletion%20request">Request deletion by email</a>
        </section>
      </main>
      <style>{`
        .delete-page{min-height:100vh;background:radial-gradient(circle at 50% 0%,rgba(112,35,61,.15),transparent 30%),radial-gradient(circle at 15% 20%,rgba(77,48,130,.15),transparent 26%),#09070f;color:#f7f0e4}.delete-shell{max-width:960px;margin:0 auto;padding:112px 18px 80px}.delete-back{display:inline-flex;align-items:center;gap:7px;margin-bottom:16px;color:rgba(247,240,228,.6);text-decoration:none;font-size:13px}.delete-hero{display:grid;grid-template-columns:auto 1fr;gap:22px;padding:28px;border-radius:26px;border:1px solid rgba(239,68,68,.28);background:linear-gradient(145deg,rgba(38,17,27,.96),rgba(13,9,18,.96));box-shadow:0 28px 80px rgba(0,0,0,.34);margin-bottom:16px}.delete-mark{width:68px;height:68px;border-radius:50%;display:grid;place-items:center;color:#ff8f91;border:1px solid rgba(239,68,68,.5);box-shadow:0 0 0 8px rgba(239,68,68,.05)}.delete-kicker,.delete-label{margin:0 0 8px;color:#ff9698;font-size:11px;font-weight:800;letter-spacing:.17em;text-transform:uppercase}.delete-hero h1{font-family:var(--font-serif);font-size:clamp(2.1rem,6vw,4rem);line-height:1.02;margin:0 0 12px}.delete-hero p:last-child{margin:0;max-width:700px;color:rgba(247,240,228,.64);line-height:1.7}.delete-steps-card{margin-bottom:14px;padding:22px;border:1px solid rgba(212,168,95,.18);border-radius:18px;background:rgba(212,168,95,.035)}.delete-steps-card ol{margin:0;padding-left:1.25rem;color:rgba(247,240,228,.72);line-height:1.65}.delete-steps-card li{margin:.55rem 0}.delete-steps-card a{color:#d4a85f}.delete-grid{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:14px}.delete-card,.delete-confirm,.delete-help-card,.delete-retention-card{border:1px solid rgba(255,255,255,.09);border-radius:18px;background:rgba(255,255,255,.028)}.delete-card,.delete-confirm,.delete-retention-card{padding:22px}.delete-card ul,.delete-retention-card ul{margin:0;padding-left:1.15rem;color:rgba(247,240,228,.68);line-height:1.65}.delete-card li,.delete-retention-card li{margin:.4rem 0}.delete-retention-card{margin-top:14px}.delete-retention-note{margin:14px 0 0;color:rgba(247,240,228,.52);font-size:13px;line-height:1.55}.delete-warning{display:flex;gap:9px;align-items:flex-start;margin-top:18px;padding:13px;border-radius:12px;border:1px solid rgba(212,168,95,.15);background:rgba(212,168,95,.05);color:#d6c3a0;font-size:13px;line-height:1.5}.delete-warning svg{flex:none;margin-top:2px}.delete-confirm h2{font-family:var(--font-serif);font-size:1.8rem;margin:0 0 16px}.delete-confirm label{display:block;color:rgba(247,240,228,.7);font-size:14px;line-height:1.5}.delete-confirm label strong{color:#fff}.delete-confirm input{width:100%;box-sizing:border-box;margin-top:9px;padding:13px 14px;border-radius:12px;border:1px solid rgba(239,68,68,.35);background:rgba(0,0,0,.24);color:#fff;font-size:16px;letter-spacing:.08em;outline:none}.delete-confirm input:focus{border-color:#ff8f91;box-shadow:0 0 0 3px rgba(239,68,68,.09)}.delete-confirm #delete-help{margin:7px 0 0;color:rgba(247,240,228,.42);font-size:12px;line-height:1.45}.delete-error{color:#ff9698;font-size:13px}.delete-confirm button{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;margin-top:17px;padding:14px;border-radius:12px;border:1px solid #ef4444;background:rgba(239,68,68,.14);color:#ff9698;font-weight:800;cursor:pointer}.delete-confirm button:disabled{cursor:not-allowed;opacity:.36}.delete-help-card{display:flex;justify-content:space-between;align-items:center;gap:18px;margin-top:14px;padding:18px}.delete-help-card div{display:flex;flex-direction:column;gap:5px}.delete-help-card span{color:rgba(247,240,228,.52);font-size:13px;line-height:1.45}.delete-help-card a{flex:none;color:#d4a85f;text-decoration:none;font-weight:700;font-size:13px}@media(max-width:760px){.delete-hero,.delete-grid{grid-template-columns:1fr}.delete-help-card{align-items:flex-start;flex-direction:column}}@media(max-width:480px){.delete-shell{padding:96px 12px 70px}.delete-hero{padding:20px;border-radius:20px}.delete-card,.delete-confirm,.delete-steps-card,.delete-retention-card{padding:18px}.delete-help-card,.delete-steps-card,.delete-retention-card{border-radius:15px}}
      `}</style>
    </div>
  );
}
