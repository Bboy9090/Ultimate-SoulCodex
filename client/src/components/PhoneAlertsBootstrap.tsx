import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { currentDeps, getMessagingPlugin, refreshPhoneAlertToken, safeAlertRoute } from "@/lib/phoneAlerts";

/** Renders nothing. Routes alert taps to Soul Circle and keeps an opted-in device's token current. */
export default function PhoneAlertsBootstrap() {
  const [, navigate] = useLocation();
  const { data: user } = useQuery<{ id: string } | null>({ queryKey: ["/api/auth/user"] });
  const userId = user?.id ?? null;

  useEffect(() => {
    const plugin = getMessagingPlugin();
    if (!plugin) return;
    let handle: { remove(): Promise<void> } | null = null;
    let disposed = false;
    plugin.addListener("notificationActionPerformed", (event) => {
      const route = safeAlertRoute(event?.notification?.data);
      if (route) navigate(route);
    }).then((h) => { if (disposed) void h.remove(); else handle = h; }).catch(() => undefined);
    return () => { disposed = true; void handle?.remove(); };
  }, [navigate]);

  useEffect(() => {
    if (userId) void refreshPhoneAlertToken(currentDeps(), userId);
  }, [userId]);

  return null;
}
