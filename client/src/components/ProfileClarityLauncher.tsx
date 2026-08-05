import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Sparkles } from "lucide-react";
import { readingPath } from "@/lib/profilePaths";

interface ProfileClarityLauncherProps {
  profileId?: string;
  children: React.ReactNode;
}

export default function ProfileClarityLauncher({
  profileId,
  children,
}: ProfileClarityLauncherProps) {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const update = () => setCompact(window.scrollY > 280);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const href = readingPath(profileId);

  return (
    <div className="relative">
      {children}
      {href ? (
        <aside
          aria-label="Continue to clarity reading"
          className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5"
        >
          <div
            className={`pointer-events-auto mx-auto flex items-center border border-amber-300/25 bg-[#100a1b]/95 shadow-2xl backdrop-blur-xl transition-all duration-200 ${
              compact
                ? "w-fit gap-2 rounded-full p-2"
                : "max-w-xl gap-3 rounded-2xl p-3 sm:p-4"
            }`}
          >
            {!compact && (
              <>
                <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-300/10 text-amber-300 sm:flex">
                  <Sparkles aria-hidden="true" className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">
                    Ready for the clarity-first version?
                  </p>
                  <p className="hidden text-xs leading-5 text-white/55 sm:block">
                    See the pattern, protection, gift, cost, evidence, and one grounded action.
                  </p>
                </div>
              </>
            )}
            <Link
              href={href}
              aria-label={compact ? "Open clarity reading" : undefined}
              className={`inline-flex min-h-11 shrink-0 items-center gap-2 bg-amber-300 text-sm font-bold text-black outline-none transition hover:bg-amber-200 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#100a1b] ${
                compact ? "rounded-full px-4 py-2.5" : "rounded-xl px-4 py-2.5"
              }`}
              data-testid="profile-clarity-reading-link"
            >
              {compact && <Sparkles aria-hidden="true" className="h-4 w-4" />}
              Open reading
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </aside>
      ) : null}
    </div>
  );
}
