import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { soulCircleApi } from "@/lib/soulCircleClient";

/** People-page entry to Soul Circle, with an unread count when there is something new. */
export default function SoulCircleEntryCard() {
  const { data: user } = useQuery<{ id: string } | null>({ queryKey: ["/api/auth/user"] });
  const [unread, setUnread] = useState(0);
  const signedIn = Boolean(user);

  useEffect(() => {
    if (!signedIn) { setUnread(0); return; }
    let cancelled = false;
    soulCircleApi.listNotifications()
      .then((result) => { if (!cancelled) setUnread(result.unread); })
      .catch(() => { if (!cancelled) setUnread(0); });
    return () => { cancelled = true; };
  }, [signedIn]);

  return (
    <Link href="/circle" className="sc-panel sc-panel-gold sc-card-link mb-6 block p-5 text-[var(--sc-ivory)] no-underline" data-testid="people-soul-circle-entry">
      <p className="sc-eyebrow">Soul Circle{unread > 0 ? <span className="ml-2 rounded-full bg-[var(--sc-gold)] px-2 py-0.5 text-[10px] font-bold text-black" data-testid="people-soul-circle-unread">{unread} new</span> : null}</p>
      <strong className="mt-2 block font-serif text-2xl">Friends who already have Soul Codex</strong>
      <span className="mt-2 block text-sm leading-6 text-[var(--sc-stone)]">Invite them once. Their verified signs appear on their own when they choose to share, so there is nothing to type.</span>
    </Link>
  );
}
