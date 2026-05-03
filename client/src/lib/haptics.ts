// Haptic feedback utility for the Soul Codex UI.
// Uses Capacitor Haptics if available; otherwise falls back to the Web Vibration API.

export function triggerHapticFeedback() {
  try {
    // Capacitor Haptics plugin may be available in native builds.
    // @ts-ignore – we guard existence at runtime.
    if (typeof window !== 'undefined' && (window as any).Capacitor && (window as any).Capacitor.Plugins && (window as any).Capacitor.Plugins.Haptics) {
      // @ts-ignore
      const { Haptics } = (window as any).Capacitor.Plugins;
      // Use a light impact for subtle feedback.
      // @ts-ignore
      Haptics.impact({ style: 'light' });
      return;
    }
  } catch (e) {
    // Silently ignore errors – fallback will trigger.
  }

  // Fallback to the standard Vibration API (works on most browsers & devices).
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    // Vibrate for 50ms – short enough to feel like a tap.
    navigator.vibrate(50);
  }
}
