import { useEffect, useRef } from "react";

/**
 * Decorative, global deep-space atmosphere. No chart data, geolocation,
 * accelerometer, network requests, images or persistent tracking involved.
 * Movement runs only for fine-pointer users who have not requested less motion
 * or reduced data, and only while the document is visible.
 */
export default function CosmicAtmosphere() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = root.current;
    if (!node || typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reduce.matches || !fine.matches || saveData) return;

    let frame = 0;
    let targetX = 0, targetY = 0, actualX = 0, actualY = 0;
    let active = false;
    const animate = () => {
      frame = 0;
      if (document.hidden || !node.isConnected || reduce.matches) { active = false; return; }
      actualX += (targetX - actualX) * 0.075;
      actualY += (targetY - actualY) * 0.075;
      node.style.setProperty("--cosmic-drift-x", actualX.toFixed(2) + "px");
      node.style.setProperty("--cosmic-drift-y", actualY.toFixed(2) + "px");
      if (Math.abs(targetX - actualX) > 0.15 || Math.abs(targetY - actualY) > 0.15) {
        frame = window.requestAnimationFrame(animate);
      } else active = false;
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== "mouse") return;
      targetX = (event.clientX / Math.max(1, window.innerWidth) - 0.5) * 24;
      targetY = (event.clientY / Math.max(1, window.innerHeight) - 0.5) * 18;
      if (!active && !document.hidden) { active = true; frame = window.requestAnimationFrame(animate); }
    };
    const halt = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      active = false;
    };
    const changed = () => {
      if (reduce.matches || !fine.matches || document.hidden) halt();
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("visibilitychange", changed);
    reduce.addEventListener("change", changed);
    fine.addEventListener("change", changed);
    return () => {
      halt();
      window.removeEventListener("pointermove", move);
      document.removeEventListener("visibilitychange", changed);
      reduce.removeEventListener("change", changed);
      fine.removeEventListener("change", changed);
    };
  }, []);

  return (
    <div ref={root} className="sc-cosmic-atmosphere" aria-hidden="true" data-testid="cosmic-atmosphere">
      <div className="sc-cosmic-nebula sc-cosmic-nebula--far" />
      <div className="sc-cosmic-nebula sc-cosmic-nebula--near" />
      <div className="sc-cosmic-stars sc-cosmic-stars--far" />
      <div className="sc-cosmic-stars sc-cosmic-stars--near" />
      <div className="sc-cosmic-horizon" />
    </div>
  );
}
