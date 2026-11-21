import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Copy, Share2, UsersRound } from "lucide-react";
import Navigation from "@/components/navigation";
import {
  SoulCircleError,
  chartChips,
  inviteMessage,
  inviteUrl,
  notificationText,
  soulCircleApi,
  splitUpdates,
  type SoulCircleFriend,
  type SoulCircleInviteRow,
  type SoulCircleNotifications,
} from "@/lib/soulCircleClient";

type CurrentUser = { id: string } | null;

const PENDING_INVITE_KEY = "soulcodex.pendingCircleInvite";

function readPendingInvite(): string | null {
  try {
    const value = window.sessionStorage.getItem(PENDING_INVITE_KEY);
    return value && /^[A-Za-z0-9_-]{32,96}$/.test(value) ? value : null;
  } catch {
    return null;
  }
}

function friendStatus(friend: SoulCircleFriend): string {
  if (friend.theirChartStatus === "shared") return "Shared with you";
  if (friend.theirChartStatus === "unavailable") return "Shared, but nothing is verified yet";
  return "Hasn't shared with you yet";
}

export default function SoulCirclePage() {
  const { data: user, isLoading: userLoading } = useQuery<CurrentUser>({ queryKey: ["/api/auth/user"], refetchOnMount: true });
  const [friends, setFriends] = useState<SoulCircleFriend[] | null>(null);
  const [invites, setInvites] = useState<SoulCircleInviteRow[]>([]);
  const [updates, setUpdates] = useState<SoulCircleNotifications>({ unread: 0, items: [] });
  const [showAllUpdates, setShowAllUpdates] = useState(false);
  const [error, setError] = useState("");
  const [inviterName, setInviterName] = useState("");
  const [createdLink, setCreatedLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pendingToken] = useState(() => (typeof window === "undefined" ? null : readPendingInvite()));
  const signedIn = Boolean(user);

  const load = useCallback(async () => {
    try {
      const [friendRows, inviteRows, updateRows] = await Promise.all([
        soulCircleApi.listFriends(),
        soulCircleApi.listInvites(),
        soulCircleApi.listNotifications(),
      ]);
      setFriends(friendRows);
      setInvites(inviteRows);
      setUpdates(updateRows);
      setError("");
    } catch (failure) {
      setError(failure instanceof SoulCircleError ? failure.message : "Soul Circle could not be loaded.");
      setFriends([]);
    }
  }, []);

  useEffect(() => { if (signedIn) void load(); }, [signedIn, load]);

  async function createInvite() {
    setBusy(true); setError(""); setCopied(false);
    try {
      const created = await soulCircleApi.createInvite(inviterName);
      setCreatedLink(inviteUrl(window.location.origin, created.path));
      await load();
    } catch (failure) {
      setError(failure instanceof SoulCircleError ? failure.message : "The invite could not be created.");
    } finally { setBusy(false); }
  }

  async function copyLink() {
    try { await navigator.clipboard.writeText(inviteMessage(createdLink)); setCopied(true); }
    catch { setError("Copy is not available here. Select the link and copy it manually."); }
  }

  async function shareLink() {
    try { await navigator.share({ title: "Join my Soul Codex circle", text: inviteMessage(createdLink) }); }
    catch { /* dismissing the share sheet is not an error */ }
  }

  async function markRead(ids: string[] | "all") {
    try { await soulCircleApi.markNotificationsRead(ids); await load(); }
    catch { /* the list refreshes on the next visit; reading is not critical */ }
  }

  async function cancelInvite(id: string) {
    try { await soulCircleApi.cancelInvite(id); await load(); }
    catch (failure) { setError(failure instanceof SoulCircleError ? failure.message : "The invite could not be cancelled."); }
  }

  const openInvites = invites.filter((invite) => invite.status === "open");
  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <div className="sc-app-shell">
      <Navigation />
      <main className="sc-page">
        <header className="max-w-3xl pb-8 pt-4">
          <p className="sc-eyebrow">Soul Circle</p>
          <h1 className="mt-4 font-serif text-[clamp(2.4rem,7vw,4.5rem)] font-medium leading-[1] tracking-[-.03em] text-[var(--sc-ivory)]">
            Your people, already on Soul Codex.
          </h1>
          <p className="sc-lede mt-5">
            Invite a friend. When they join and choose to share, their verified signs appear here on their own, so you never type anything about them.
            Nothing is shared until each of you decides, and you can stop at any time.
          </p>
        </header>

        {error ? <p role="alert" className="mb-4 rounded-xl border border-[rgba(255,120,120,.3)] bg-[rgba(255,120,120,.06)] p-3 text-sm text-[var(--sc-ivory-soft)]">{error}</p> : null}

        {userLoading ? (
          <p className="text-sm text-[var(--sc-stone)]">Checking your account…</p>
        ) : !signedIn ? (
          <section className="sc-panel max-w-2xl p-6" data-testid="circle-signed-out">
            <h2 className="font-serif text-2xl text-[var(--sc-ivory)]">Connect an account to start a circle</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--sc-stone)]">
              Your profile still works without one. Soul Circle needs an account so that only the friends you invite can ever see what you choose to share.
            </p>
            <Link href="/settings" className="sc-button-primary mt-5 inline-flex no-underline">Open account settings</Link>
          </section>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <section aria-labelledby="circle-friends-title" className="space-y-3">
              <h2 id="circle-friends-title" className="font-serif text-2xl text-[var(--sc-ivory)]">Your circle</h2>
              {pendingToken ? (
                <Link href={`/circle/join/${pendingToken}`} className="sc-panel sc-panel-gold block p-4 text-sm text-[var(--sc-ivory)] no-underline" data-testid="circle-pending-invite">
                  You have an invite waiting. Continue to join →
                </Link>
              ) : null}
              {updates.items.length > 0 ? (
                <div className="sc-panel p-4" data-testid="circle-updates">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-[.12em] text-[var(--sc-stone)]">Updates{updates.unread > 0 ? ` · ${updates.unread} new` : ""}</h3>
                    {updates.unread > 0 ? <button type="button" onClick={() => markRead("all")} className="text-xs text-[var(--sc-gold-bright)] underline" data-testid="circle-updates-read-all">Mark all read</button> : null}
                  </div>
                  <ul className="mt-3 space-y-2">
                    {splitUpdates(updates.items, showAllUpdates).visible.map((item) => (
                      <li key={item.id}>
                        <Link
                          href={`/circle/${item.linkId}`}
                          onClick={() => { if (!item.read) void markRead([item.id]); }}
                          className={`block text-sm no-underline ${item.read ? "text-[var(--sc-stone)]" : "font-semibold text-[var(--sc-ivory)]"}`}
                          data-testid={`circle-update-${item.id}`}
                        >
                          {item.read ? null : <span aria-hidden="true" className="mr-2 inline-block h-2 w-2 rounded-full bg-[var(--sc-gold)]" />}
                          {notificationText(item)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {(() => {
                    const { hiddenCount, hiddenUnread } = splitUpdates(updates.items, showAllUpdates);
                    if (showAllUpdates) {
                      return updates.items.length > 10 ? <button type="button" onClick={() => setShowAllUpdates(false)} className="mt-3 text-xs text-[var(--sc-gold-bright)] underline">Show fewer</button> : null;
                    }
                    return hiddenCount > 0 ? (
                      <button type="button" onClick={() => setShowAllUpdates(true)} className="mt-3 text-xs text-[var(--sc-gold-bright)] underline" data-testid="circle-updates-show-all">
                        Show {hiddenCount} earlier {hiddenCount === 1 ? "update" : "updates"}{hiddenUnread > 0 ? ` (${hiddenUnread} unread)` : ""}
                      </button>
                    ) : null;
                  })()}
                </div>
              ) : null}
              {friends === null ? <p className="text-sm text-[var(--sc-stone)]">Loading…</p> : null}
              {friends?.length === 0 ? (
                <div className="sc-panel p-5" data-testid="circle-empty">
                  <UsersRound className="h-6 w-6 text-[var(--sc-gold)]" aria-hidden="true" />
                  <p className="mt-3 text-sm leading-6 text-[var(--sc-stone)]">No one is in your circle yet. Create an invite link and send it to a friend.</p>
                </div>
              ) : null}
              {friends?.map((friend) => (
                <Link key={friend.id} href={`/circle/${friend.id}`} className="sc-panel sc-card-link block p-5 text-[var(--sc-ivory)] no-underline" data-testid={`circle-friend-${friend.id}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong className="font-serif text-xl">{friend.displayName}</strong>
                    <span className="text-xs text-[var(--sc-stone)]">{friendStatus(friend)}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {chartChips(friend.theirChart).map((chip) => (
                      <span key={chip.key} className="sc-trust-chip">{chip.label}: {chip.value}</span>
                    ))}
                  </div>
                  <p className="mb-0 mt-3 text-xs text-[var(--sc-stone)]">
                    {friend.iShare ? `You share ${friend.iShare.fields.length} ${friend.iShare.fields.length === 1 ? "thing" : "things"} with them.` : "You haven't shared anything with them yet."}
                  </p>
                </Link>
              ))}
            </section>

            <aside aria-labelledby="circle-invite-title" className="sc-panel h-fit p-5">
              <h2 id="circle-invite-title" className="font-serif text-2xl text-[var(--sc-ivory)]">Invite a friend</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--sc-stone)]">
                One link per friend, good for 7 days. Joining shares nothing.
              </p>
              <label className="mt-4 block text-sm text-[var(--sc-ivory-soft)]" htmlFor="circle-inviter-name">
                Name your friend will see (optional)
              </label>
              <input
                id="circle-inviter-name"
                value={inviterName}
                maxLength={80}
                onChange={(event) => setInviterName(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-[var(--sc-ivory)]"
                placeholder="Leave blank to stay anonymous"
                autoComplete="off"
              />
              <p className="mt-2 text-xs leading-5 text-[var(--sc-stone)]">Your account name is never shown to anyone.</p>
              <button type="button" onClick={createInvite} disabled={busy} className="sc-button-primary mt-4 w-full" data-testid="circle-create-invite">
                {busy ? "Creating…" : "Create invite link"}
              </button>

              {createdLink ? (
                <div className="mt-4 rounded-xl border border-[var(--sc-line-gold)] p-3" data-testid="circle-created-invite">
                  <label className="text-xs text-[var(--sc-stone)]" htmlFor="circle-invite-link">Send this link. It is shown only now.</label>
                  <input id="circle-invite-link" readOnly value={createdLink} onFocus={(event) => event.currentTarget.select()} className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 p-2 text-xs text-[var(--sc-ivory-soft)]" />
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={copyLink} className="sc-button-secondary inline-flex flex-1 items-center justify-center gap-2"><Copy className="h-4 w-4" aria-hidden="true" />{copied ? "Copied" : "Copy"}</button>
                    {canNativeShare ? <button type="button" onClick={shareLink} className="sc-button-secondary inline-flex flex-1 items-center justify-center gap-2"><Share2 className="h-4 w-4" aria-hidden="true" />Share</button> : null}
                  </div>
                </div>
              ) : null}

              {openInvites.length > 0 ? (
                <div className="mt-5">
                  <h3 className="text-xs font-bold uppercase tracking-[.12em] text-[var(--sc-stone)]">Open invites</h3>
                  <ul className="mt-2 space-y-2">
                    {openInvites.map((invite) => (
                      <li key={invite.id} className="flex items-center justify-between gap-2 text-sm text-[var(--sc-ivory-soft)]">
                        <span>Expires {new Date(invite.expiresAt).toLocaleDateString()}</span>
                        <button type="button" onClick={() => cancelInvite(invite.id)} className="text-xs text-[var(--sc-gold-bright)] underline">Cancel</button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
