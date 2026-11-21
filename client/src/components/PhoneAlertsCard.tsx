import { useEffect, useState } from "react";
import {
  currentDeps,
  disablePhoneAlerts,
  enablePhoneAlerts,
  phoneAlertsView,
  type PhoneAlertsView,
} from "@/lib/phoneAlerts";

/**
 * Opt-in for phone alerts. Renders nothing unless this is a native build that contains the
 * messaging plugin AND the server reports delivery is configured, so it never advertises a
 * feature that cannot work.
 */
export default function PhoneAlertsCard({ userId }: { userId: string }) {
  const [view, setView] = useState<PhoneAlertsView>({ kind: "hidden" });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const deps = currentDeps();
      if (!deps.platform || !deps.plugin) return;
      try {
        const [status, permission] = await Promise.all([deps.api.status(), deps.plugin.checkPermissions()]);
        if (cancelled) return;
        setView(phoneAlertsView({
          platform: deps.platform,
          pluginPresent: true,
          serverAvailable: status.available,
          permission: permission.receive,
          // Shown as on only when this device chose it for this account and the server still has it.
          enabledForThisAccount: deps.store.get() === userId && status.registered,
        }));
      } catch { /* stay hidden */ }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  if (view.kind === "hidden") return null;

  const turnOn = async () => {
    setBusy(true); setMessage("");
    const result = await enablePhoneAlerts(currentDeps(), userId);
    setBusy(false);
    if (result.status === "enabled") setView({ kind: "on" });
    else if (result.status === "denied") { setView({ kind: "blocked" }); }
    else setMessage("Phone alerts could not be turned on right now. Please try again later.");
  };
  const turnOff = async () => {
    setBusy(true); setMessage("");
    const result = await disablePhoneAlerts(currentDeps());
    setBusy(false);
    setView({ kind: "off" });
    if (!result.serverCleared) setMessage("Phone alerts are off on this device. We could not reach the server to confirm; it will stop sending to this phone once it can.");
  };

  return (
    <section className="sc-panel p-4" data-testid="phone-alerts">
      <h3 className="text-xs font-bold uppercase tracking-[.12em] text-[var(--sc-stone)]">Phone alerts</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--sc-ivory-soft)]">
        Get a notification when a friend joins your circle or starts sharing with you. It only says that you have a new update. It never includes a name or any chart details.
      </p>
      {view.kind === "blocked" ? (
        <p className="mt-3 text-sm text-[var(--sc-stone)]" data-testid="phone-alerts-blocked">Notifications are turned off for Soul Codex in your phone's settings. Turn them on there, then come back.</p>
      ) : view.kind === "on" ? (
        <button type="button" disabled={busy} onClick={turnOff} className="sc-button-secondary mt-3" data-testid="phone-alerts-off">Turn off phone alerts</button>
      ) : (
        <button type="button" disabled={busy} onClick={turnOn} className="sc-button-primary mt-3" data-testid="phone-alerts-on">Turn on phone alerts</button>
      )}
      {message ? <p role="status" className="mt-2 text-xs text-[var(--sc-stone)]">{message}</p> : null}
    </section>
  );
}
