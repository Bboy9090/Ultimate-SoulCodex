import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Loader2, Share2, ShieldCheck, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/queryClient";

interface ShareModalProps {
  profileId: string;
  profileName: string;
  onClose: () => void;
}

type ShareField = "displayName" | "sunSign" | "moonSign" | "risingSign" | "lifePath" | "archetypeTitle";

type ShareHistoryItem = {
  token: string;
  path: string;
  snapshot: { version: 1; fields: Partial<Record<ShareField, string | number>> };
  createdAt: string | null;
  revokedAt: string | null;
};

const FIELD_OPTIONS: Array<{ id: ShareField; label: string; description: string }> = [
  { id: "displayName", label: "Display name", description: "A name or alias you type for the public card." },
  { id: "sunSign", label: "Verified Sun sign", description: "Included only when the stored placement has complete verification evidence." },
  { id: "moonSign", label: "Verified Moon sign", description: "Included only when the stored placement has complete verification evidence." },
  { id: "risingSign", label: "Verified Rising sign", description: "Included only when the stored placement has complete verification evidence." },
  { id: "lifePath", label: "Life Path", description: "Deterministic numerology value only; no private birth date is shared." },
  { id: "archetypeTitle", label: "Archetype title", description: "Symbolic title only; biography and private interpretation remain excluded." },
];

export function ShareModal({ profileId, profileName, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [selected, setSelected] = useState<Set<ShareField>>(() => new Set());
  const [displayName, setDisplayName] = useState(profileName);
  const [creating, setCreating] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [shareHistory, setShareHistory] = useState<ShareHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;
    const loadHistory = async () => {
      try {
        const response = await apiFetch(`/api/profiles/${profileId}/public-shares`);
        if (!response.ok) throw new Error(`share_history_failed_${response.status}`);
        const history = await response.json();
        if (!cancelled) setShareHistory(Array.isArray(history) ? history : []);
      } catch {
        if (!cancelled) setShareHistory([]);
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    };
    void loadHistory();
    return () => { cancelled = true; };
  }, [profileId]);

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose]);

  const shareUrl = useMemo(
    () => shareToken ? `${window.location.origin}/shared/${shareToken}` : null,
    [shareToken],
  );

  const toggleField = (field: ShareField) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });
  };

  const createPublicShare = async () => {
    if (selected.size === 0) {
      toast({
        title: "Choose what to share",
        description: "Nothing is public by default. Select at least one field first.",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const response = await apiFetch(`/api/profiles/${profileId}/public-shares`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: [...selected],
          ...(selected.has("displayName") ? { displayName } : {}),
        }),
      });
      if (!response.ok) throw new Error(`share_create_failed_${response.status}`);
      const result = await response.json();
      setShareToken(result.token);
      setShareHistory((current) => [{
        token: result.token,
        path: result.path,
        snapshot: result.snapshot,
        createdAt: new Date().toISOString(),
        revokedAt: null,
      }, ...current]);
      toast({
        title: "Public link created",
        description: "Only the fields you selected were copied into the public snapshot.",
      });
    } catch {
      toast({
        title: "Could not create public link",
        description: "Your private profile remains unchanged and private.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const revokePublicShare = async (tokenToRevoke: string | null = shareToken) => {
    if (!tokenToRevoke) return;
    setRevoking(true);
    try {
      const response = await apiFetch(`/api/profiles/${profileId}/public-shares/${tokenToRevoke}`, {
        method: "DELETE",
      });
      if (!response.ok && response.status !== 204) throw new Error(`share_revoke_failed_${response.status}`);
      if (shareToken === tokenToRevoke) {
        setShareToken(null);
        setCopied(false);
      }
      setShareHistory((current) => current.map((item) =>
        item.token === tokenToRevoke ? { ...item, revokedAt: new Date().toISOString() } : item
      ));
      toast({
        title: "Public link revoked",
        description: "That shared snapshot is no longer available.",
      });
    } catch {
      toast({
        title: "Could not revoke link",
        description: "Try again before assuming the public link is disabled.",
        variant: "destructive",
      });
    } finally {
      setRevoking(false);
    }
  };

  const copyToClipboard = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Public Soul Codex link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Copy failed",
        description: "Your browser blocked clipboard access. You can copy the link from the field instead.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (!shareUrl) return;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "Soul Codex",
          text: "Explore this shared Soul Codex card.",
          url: shareUrl,
        });
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Share error:", error);
        }
      }
    } else {
      void copyToClipboard();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-soul-codex-title"
        aria-describedby="share-soul-codex-description"
        className="max-h-[90vh] w-full max-w-lg space-y-5 overflow-y-auto rounded-2xl border border-[var(--sc-line)] bg-[var(--sc-bg-ink)] p-5 shadow-2xl sm:p-6"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="sc-eyebrow">Privacy-first sharing</p>
            <h2 id="share-soul-codex-title" className="mt-1 font-serif text-2xl font-bold text-[var(--sc-ivory)]">Create a public Soul Codex card</h2>
          </div>
          <button ref={closeButtonRef} onClick={onClose} aria-label="Close share dialog" className="rounded-lg p-2 text-[var(--sc-stone)] hover:text-[var(--sc-ivory)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p id="share-soul-codex-description" className="text-sm leading-6 text-[var(--sc-stone)]">
          Nothing is shared automatically. Choose each field below. Birth date, birth time, birthplace, timezone, coordinates, assessment answers, private profile ID, evidence internals, biography, and daily guidance are never included in this public card.
        </p>

        {!shareToken ? (
          <>
            <div className="space-y-2">
              {FIELD_OPTIONS.map((option) => {
                const checked = selected.has(option.id);
                return (
                  <label key={option.id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--sc-line)] bg-white/[0.02] p-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleField(option.id)}
                      className="mt-1 h-4 w-4"
                    />
                    <span>
                      <strong className="block text-sm text-[var(--sc-ivory)]">{option.label}</strong>
                      <span className="mt-1 block text-xs leading-5 text-[var(--sc-stone)]">{option.description}</span>
                    </span>
                  </label>
                );
              })}
            </div>

            {selected.has("displayName") && (
              <div>
                <label htmlFor="public-share-display-name" className="mb-2 block text-sm font-medium text-[var(--sc-ivory)]">Public display name or alias</label>
                <input
                  id="public-share-display-name"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  maxLength={80}
                  className="w-full rounded-xl border border-[var(--sc-line)] bg-black/20 px-3 py-2.5 text-sm text-[var(--sc-ivory)]"
                />
              </div>
            )}

            <Button onClick={() => void createPublicShare()} disabled={creating || selected.size === 0} className="w-full">
              {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
              Create revocable public link
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-[rgba(114,216,197,.22)] bg-[rgba(114,216,197,.05)] p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--sc-teal)]" />
                <div>
                  <p className="font-semibold text-[var(--sc-ivory)]">Sanitized public snapshot active</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--sc-stone)]">This link contains a frozen copy of only the fields you selected. It does not grant access to your private profile.</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-[var(--sc-line)] bg-black/20 p-3">
              <input type="text" value={shareUrl ?? ""} readOnly aria-label="Public Soul Codex link" className="min-w-0 flex-1 bg-transparent text-xs text-[var(--sc-ivory)] outline-none" />
              <button onClick={() => void copyToClipboard()} aria-label="Copy public Soul Codex link" className="rounded-lg p-2 text-[var(--sc-gold-bright)]">
                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button onClick={() => void handleShare()} variant="secondary">
                <Share2 className="mr-2 h-4 w-4" /> Share link
              </Button>
              <Button onClick={() => void revokePublicShare(shareToken)} disabled={revoking} variant="outline">
                {revoking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Revoke link
              </Button>
            </div>
          </div>
        )}


        <section aria-labelledby="share-history-title" className="space-y-3 border-t border-[var(--sc-line)] pt-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 id="share-history-title" className="font-serif text-lg text-[var(--sc-ivory)]">Your public links</h3>
              <p className="mt-1 text-xs leading-5 text-[var(--sc-stone)]">Active and revoked snapshots for this profile.</p>
            </div>
            {historyLoading && <Loader2 className="h-4 w-4 animate-spin text-[var(--sc-stone)]" aria-label="Loading share history" />}
          </div>

          {!historyLoading && shareHistory.length === 0 && (
            <p className="rounded-xl border border-[var(--sc-line)] bg-white/[0.02] p-3 text-xs text-[var(--sc-stone)]">No public links have been created for this profile yet.</p>
          )}

          <div className="space-y-2">
            {shareHistory.map((item) => {
              const active = !item.revokedAt;
              const fieldNames = Object.keys(item.snapshot?.fields ?? {});
              return (
                <div key={item.token} className="rounded-xl border border-[var(--sc-line)] bg-white/[0.02] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={active ? "text-xs font-semibold text-[var(--sc-teal)]" : "text-xs font-semibold text-[var(--sc-stone)]"}>
                          {active ? "Active" : "Revoked"}
                        </span>
                        <span className="text-[10px] text-[var(--sc-stone)]">{fieldNames.length} field{fieldNames.length === 1 ? "" : "s"}</span>
                      </div>
                      <p className="mt-1 truncate text-[11px] text-[var(--sc-stone)]">{item.path}</p>
                    </div>
                    {active && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          await revokePublicShare(item.token);
                        }}
                      >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Revoke
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <Button onClick={onClose} variant="outline" className="w-full">Close</Button>
      </div>
    </div>
  );
}
