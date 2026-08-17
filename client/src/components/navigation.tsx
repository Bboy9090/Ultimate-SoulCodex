import { Link, useLocation } from "wouter";
import {
  Eye,
  HeartHandshake,
  Menu,
  Orbit,
  Settings,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useActiveProfile } from "../hooks/useActiveProfile";

function isActive(pathname: string, href: string) {
  if (href.startsWith("/profile/")) return pathname.startsWith("/profile/");
  if (href === "/compatibility") return pathname.startsWith("/compatibility");
  if (href === "/settings") return pathname.startsWith("/settings") || pathname.startsWith("/diagnostics");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navigation() {
  const { profile } = useActiveProfile();
  const identityHref = profile?.id ? `/profile/${profile.id}` : "/create";
  const [pathname] = useLocation();

  const primaryLinks = [
    { href: identityHref, label: "Identity", icon: UserRound },
    { href: "/timeline", label: "Timeline", icon: Orbit },
    { href: "/compatibility", label: "Compatibility", icon: HeartHandshake },
  ];

  return (
    <nav
      className="fixed inset-x-0 top-0 z-50 px-3 pt-[max(.65rem,env(safe-area-inset-top))] sm:px-5"
      aria-label="Primary navigation"
    >
      <div className="mx-auto max-w-7xl rounded-[1.2rem] border border-white/[0.07] bg-[var(--sc-ink)]/80 shadow-[0_18px_70px_rgba(0,0,0,.32)] backdrop-blur-2xl backdrop-saturate-150">
        <div className="flex h-[62px] items-center justify-between px-3 sm:px-4">
          <Link
            href="/"
            className="group flex items-center gap-2.5 rounded-xl px-1.5 py-1 text-[var(--sc-ivory)] no-underline"
            data-testid="link-home"
            aria-label="Soul Codex home"
          >
            <span className="relative grid h-9 w-9 place-items-center rounded-full border border-[rgba(217,182,111,.28)] bg-[radial-gradient(circle_at_35%_30%,rgba(239,208,141,.15),rgba(154,116,220,.08)_45%,rgba(255,255,255,.02))] shadow-[0_0_28px_rgba(154,116,220,.12)]">
              <Eye className="h-[17px] w-[17px] text-[var(--sc-gold-bright)]" strokeWidth={1.7} />
              <span className="absolute -right-0.5 top-0 h-1.5 w-1.5 rounded-full bg-[var(--sc-teal)] shadow-[0_0_10px_var(--sc-teal)]" />
            </span>
            <span className="leading-none">
              <span className="block font-serif text-[1.04rem] font-semibold tracking-[-.015em] sm:text-[1.1rem]">Soul Codex</span>
              <span className="mt-1 hidden text-[9px] font-semibold uppercase tracking-[.19em] text-[var(--sc-stone)] sm:block">Clarity Engine</span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            <div className="mr-2 flex items-center rounded-xl border border-white/[0.055] bg-white/[0.022] p-1">
              {primaryLinks.map(({ href, label, icon: Icon }) => {
                const active = isActive(pathname, href);
                return (
                  <Link
                    key={label}
                    href={href}
                    data-testid={`link-${label.toLowerCase()}`}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-[12px] font-semibold no-underline transition-colors ${
                      active
                        ? "bg-white/[0.065] text-[var(--sc-ivory)] shadow-[inset_0_0_0_1px_rgba(217,182,111,.1)]"
                        : "text-[var(--sc-stone)] hover:bg-white/[0.035] hover:text-[var(--sc-ivory)]"
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${active ? "text-[var(--sc-gold)]" : ""}`} strokeWidth={1.8} />
                    {label}
                  </Link>
                );
              })}
            </div>

            <Link
              href="/settings"
              className={`grid h-9 w-9 place-items-center rounded-lg border no-underline transition-colors ${
                isActive(pathname, "/settings")
                  ? "border-[rgba(217,182,111,.22)] bg-[rgba(217,182,111,.08)] text-[var(--sc-gold)]"
                  : "border-white/[0.06] text-[var(--sc-stone)] hover:bg-white/[0.04] hover:text-[var(--sc-ivory)]"
              }`}
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" strokeWidth={1.8} />
            </Link>

            <Link href="/create" className="ml-1 no-underline">
              <Button className="h-9 rounded-lg border border-[rgba(239,208,141,.28)] bg-[linear-gradient(135deg,#efd08d,#cda458)] px-3.5 text-[12px] font-bold text-[#170f07] shadow-[0_9px_24px_rgba(217,182,111,.13)] hover:brightness-105" data-testid="button-create-profile-nav">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Create profile
              </Button>
            </Link>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl border border-white/[0.065] bg-white/[0.025] text-[var(--sc-ivory)] hover:bg-white/[0.06] md:hidden" data-testid="button-menu" aria-label="Open navigation menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[min(88vw,360px)] border-l border-white/[0.07] bg-[var(--sc-ink)]/[.98] px-5 text-[var(--sc-ivory)] backdrop-blur-2xl">
              <div className="mt-[max(2rem,env(safe-area-inset-top))]">
                <div className="mb-7 flex items-center gap-3 border-b border-white/[0.07] pb-5">
                  <span className="grid h-10 w-10 place-items-center rounded-full border border-[rgba(217,182,111,.25)] bg-[rgba(217,182,111,.06)] text-[var(--sc-gold-bright)]">
                    <Eye className="h-5 w-5" strokeWidth={1.7} />
                  </span>
                  <div>
                    <p className="m-0 font-serif text-lg font-semibold">Soul Codex</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[.18em] text-[var(--sc-stone)]">Clarity Engine</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {primaryLinks.map(({ href, label, icon: Icon }) => {
                    const active = isActive(pathname, href);
                    return (
                      <Link
                        key={label}
                        href={href}
                        data-testid={`link-${label.toLowerCase()}-mobile`}
                        className={`flex min-h-12 items-center gap-3 rounded-xl border px-3.5 text-sm font-semibold no-underline ${
                          active
                            ? "border-[rgba(217,182,111,.2)] bg-[rgba(217,182,111,.07)] text-[var(--sc-ivory)]"
                            : "border-white/[0.055] bg-white/[0.018] text-[var(--sc-ivory-soft)]"
                        }`}
                      >
                        <Icon className={`h-4.5 w-4.5 ${active ? "text-[var(--sc-gold)]" : "text-[var(--sc-stone)]"}`} strokeWidth={1.8} />
                        {label}
                      </Link>
                    );
                  })}
                  <Link href="/settings" className="flex min-h-12 items-center gap-3 rounded-xl border border-white/[0.055] bg-white/[0.018] px-3.5 text-sm font-semibold text-[var(--sc-ivory-soft)] no-underline">
                    <Settings className="h-4.5 w-4.5 text-[var(--sc-stone)]" strokeWidth={1.8} />
                    Settings
                  </Link>
                </div>

                <Link href="/create" className="mt-5 block no-underline">
                  <Button className="h-12 w-full rounded-xl border border-[rgba(239,208,141,.28)] bg-[linear-gradient(135deg,#efd08d,#cda458)] font-bold text-[#170f07]" data-testid="button-create-profile-mobile">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Create profile
                  </Button>
                </Link>

                <p className="mt-7 text-center text-[10px] leading-relaxed text-[var(--sc-stone)]">
                  Evidence-aware identity insight.<br />Uncertainty stays visible.
                </p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
