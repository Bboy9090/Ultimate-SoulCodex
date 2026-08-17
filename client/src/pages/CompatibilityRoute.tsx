import { useEffect, useState } from "react";
import Navigation from "@/components/navigation";
import CompatibilityHubPage from "./CompatibilityHubPage";

function CompatibilitySkeleton() {
  return (
    <div className="sc-app-shell">
      <Navigation />
      <main className="sc-page" aria-busy="true" aria-live="polite">
        <header className="max-w-3xl pt-4">
          <div className="mb-4 h-3 w-44 animate-pulse rounded bg-[rgba(217,182,111,.22)]" />
          <div className="mb-3 h-16 w-full max-w-2xl animate-pulse rounded-2xl bg-white/[0.055] sm:h-20" />
          <div className="mb-3 h-5 w-full max-w-xl animate-pulse rounded bg-white/[0.035]" />
          <div className="h-5 w-4/5 max-w-lg animate-pulse rounded bg-white/[0.035]" />
        </header>
        <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="sc-panel h-48 animate-pulse" />
          ))}
        </section>
        <section className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="sc-panel h-56 animate-pulse" />
          <div className="sc-panel h-56 animate-pulse" />
        </section>
        <span className="sr-only">Loading Compatibility</span>
      </main>
    </div>
  );
}

export default function CompatibilityRoute() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return ready ? <CompatibilityHubPage /> : <CompatibilitySkeleton />;
}
