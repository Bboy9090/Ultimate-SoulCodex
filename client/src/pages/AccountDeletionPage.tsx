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
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Deletion failed. Please try again.");
      setIsDeleting(false);
      return;
    }

    try { await clearOfflineProfiles(); }
    catch (cause) { console.warn("[AccountDeletion] offline profile cleanup incomplete after server deletion", cause); }
    queryClient.clear();
    try { localStorage.clear(); } catch {}
    try { sessionStorage.clear(); } catch {}
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
            <h1>Delete Account & Data</h1>
            <p>This removes server-backed account data and then clears Soul Codex data from this device. The server deletion happens first and cannot be undone.</p>
          </div>
        </header>

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
            <input id="delete-confirmation" value={confirmation} onChange={event => setConfirmation(event.target.value)} autoCapitalize="characters" autoComplete="off" aria-describedby="delete-help" />
            <p id="delete-help">The delete button remains disabled until the confirmation text matches.</p>
            {error && <p role="alert" className="delete-error">{error}</p>}
            <button type="button" onClick={deleteAccount} disabled={!canDelete || isDeleting} data-testid="button-delete-account">
              <IconLock size={16}/>{isDeleting ? "Deleting account…" : "Permanently Delete My Data"}
            </button>
          </article>
        </section>

        <section className="delete-help-card">
          <div><strong>Can’t access the app?</strong><span>Request deletion from the email address connected to the account. Ownership verification may be required.</span></div>
          <a href="mailto:privacy@soulcodex.app?subject=Soul%20Codex%20account%20deletion%20request">Request deletion by email</a>
        </section>
      </main>
      <style>{`
        .delete-page{min-height:100vh;background:radial-gradient(circle at 50% 0%,rgba(112,35,61,.15),transparent 30%),radial-gradient(circle at 15% 20%,rgba(77,48,130,.15),transparent 26%),#09070f;color:#f7f0e4}.delete-shell{max-width:960px;margin:0 auto;padding:112px 18px 80px}.delete-back{display:inline-flex;align-items:center;gap:7px;margin-bottom:16px;color:rgba(247,240,228,.6);text-decoration:none;font-size:13px}.delete-hero{display:grid;grid-template-columns:auto 1fr;gap:22px;padding:28px;border-radius:26px;border:1px solid rgba(239,68,68,.28);background:linear-gradient(145deg,rgba(38,17,27,.96),rgba(13,9,18,.96));box-shadow:0 28px 80px rgba(0,0,0,.34);margin-bottom:16px}.delete-mark{width:68px;height:68px;border-radius:50%;display:grid;place-items:center;color:#ff8f91;border:1px solid rgba(239,68,68,.5);box-shadow:0 0 0 8px rgba(239,68,68,.05)}.delete-kicker,.delete-label{margin:0 0 8px;color:#ff9698;font-size:11px;font-weight:800;letter-spacing:.17em;text-transform:uppercase}.delete-hero h1{font-family:var(--font-serif);font-size:clamp(2.1rem,6vw,4rem);line-height:1.02;margin:0 0 12px}.delete-hero p:last-child{margin:0;max-width:700px;color:rgba(247,240,228,.64);line-height:1.7}.delete-grid{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:14px}.delete-card,.delete-confirm,.delete-help-card{border:1px solid rgba(255,255,255,.09);border-radius:18px;background:rgba(255,255,255,.028)}.delete-card,.delete-confirm{padding:22px}.delete-card ul{margin:0;padding-left:1.15rem;color:rgba(247,240,228,.68);line-height:1.65}.delete-card li{margin:.4rem 0}.delete-warning{display:flex;gap:9px;align-items:flex-start;margin-top:18px;padding:13px;border-radius:12px;border:1px solid rgba(212,168,95,.15);background:rgba(212,168,95,.05);color:#d6c3a0;font-size:13px;line-height:1.5}.delete-warning svg{flex:none;margin-top:2px}.delete-confirm h2{font-family:var(--font-serif);font-size:1.8rem;margin:0 0 16px}.delete-confirm label{display:block;color:rgba(247,240,228,.7);font-size:14px;line-height:1.5}.delete-confirm label strong{color:#fff}.delete-confirm input{width:100%;box-sizing:border-box;margin-top:9px;padding:13px 14px;border-radius:12px;border:1px solid rgba(239,68,68,.35);background:rgba(0,0,0,.24);color:#fff;font-size:16px;letter-spacing:.08em;outline:none}.delete-confirm input:focus{border-color:#ff8f91;box-shadow:0 0 0 3px rgba(239,68,68,.09)}.delete-confirm #delete-help{margin:7px 0 0;color:rgba(247,240,228,.42);font-size:12px;line-height:1.45}.delete-error{color:#ff9698;font-size:13px}.delete-confirm button{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;margin-top:17px;padding:14px;border-radius:12px;border:1px solid #ef4444;background:rgba(239,68,68,.14);color:#ff9698;font-weight:800;cursor:pointer}.delete-confirm button:disabled{cursor:not-allowed;opacity:.36}.delete-help-card{display:flex;justify-content:space-between;align-items:center;gap:18px;margin-top:14px;padding:18px}.delete-help-card div{display:flex;flex-direction:column;gap:5px}.delete-help-card span{color:rgba(247,240,228,.52);font-size:13px;line-height:1.45}.delete-help-card a{flex:none;color:#d4a85f;text-decoration:none;font-weight:700;font-size:13px}@media(max-width:760px){.delete-hero,.delete-grid{grid-template-columns:1fr}.delete-help-card{align-items:flex-start;flex-direction:column}}@media(max-width:480px){.delete-shell{padding:96px 12px 70px}.delete-hero{padding:20px;border-radius:20px}.delete-card,.delete-confirm{padding:18px}.delete-help-card{border-radius:15px}}
      `}</style>
    </div>
  );
}
