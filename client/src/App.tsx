import { Component, lazy, Suspense, type ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { Switch, Route, useLocation, useParams } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/navigation";
import ProfileClarityLauncher from "@/components/ProfileClarityLauncher";
import TimelineContinuityHeader from "@/components/TimelineContinuityHeader";
import NotFound from "./pages/not-found";
import Home from "./pages/home";

function lazyRoute<T extends { default: React.ComponentType<any> }>(
  loader: () => Promise<T>,
  label: string,
) {
  return lazy(async () => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        loader(),
        new Promise<never>((_, reject) => {
          timeoutId = setTimeout(
            () => reject(new Error(`route_chunk_timeout:${label}`)),
            12000,
          );
        }),
      ]);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  });
}

const LocalFirstInputForm = lazyRoute(() => import("./pages/local-first-input-form"), "create");
const Profile = lazyRoute(() => import("./pages/profile"), "profile");
const OfflineProfilePage = lazyRoute(() => import("./pages/offline-profile"), "offline-profile");
const ClarityReadingPage = lazyRoute(() => import("./pages/ClarityReadingPage"), "reading");
const OfflineClarityReadingPage = lazyRoute(() => import("./pages/OfflineClarityReadingPage"), "offline-reading");
const CompatibilityExplorerPage = lazyRoute(() => import("./pages/CompatibilityExplorerPage"), "compatibility-explorer");
const CompatibilityPersonPage = lazyRoute(() => import("./pages/CompatibilityPersonPage"), "compatibility-person");
const CompatibilityRoute = lazyRoute(() => import("./pages/CompatibilityRoute"), "compatibility");
const TimelinePage = lazyRoute(() => import("./pages/TimelinePage"), "timeline");
const CodexToolsPage = lazyRoute(() => import("./pages/CodexToolsPage"), "tools");
const AstrologyAtlasPage = lazyRoute(() => import("./pages/AstrologyAtlasPage"), "astrology-atlas");
const SystemsDetailsPage = lazyRoute(() => import("./pages/SystemsDetailsPage"), "systems");
const PrivacyPage = lazyRoute(() => import("./pages/PrivacyPage"), "privacy");
const TermsPage = lazyRoute(() => import("./pages/TermsPage"), "terms");
const SupportPage = lazyRoute(() => import("./pages/SupportPage"), "support");
const SettingsPage = lazyRoute(() => import("./pages/SettingsPage"), "settings");
const DiagnosticsPage = lazyRoute(() => import("./pages/DiagnosticsPage"), "diagnostics");
const AccountDeletionPage = lazyRoute(() => import("./pages/AccountDeletionPage"), "account-deletion");
const PricingPage = lazyRoute(() => import("./pages/PricingPage"), "pricing");
const ConnectionsPage = lazyRoute(() => import("./pages/ConnectionsPage"), "people");
const PublicSharedProfilePage = lazyRoute(() => import("./pages/PublicSharedProfilePage"), "shared-profile");

type RouteErrorBoundaryState = { error: Error | null };

class RouteErrorBoundary extends Component<{ children: ReactNode }, RouteErrorBoundaryState> {
  state: RouteErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): RouteErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("[route] failed to open", error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="min-h-screen bg-[#08060d] text-[#f5ead7] grid place-items-center px-6">
        <div className="sc-panel max-w-lg p-7 text-center" role="alert">
          <div className="font-serif text-2xl font-semibold">This section did not open cleanly.</div>
          <p className="mt-3 text-sm leading-6 opacity-70">
            Soul Codex stopped the stalled route instead of leaving you on an endless loading screen.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button type="button" className="sc-button-primary" onClick={() => window.location.reload()}>
              Retry this section
            </button>
            <a className="sc-button-secondary" href="/">Back home</a>
          </div>
        </div>
      </div>
    );
  }
}

function RouteLoadingFallback() {
  return (
    <div className="min-h-screen bg-[#08060d] text-[#f5ead7] grid place-items-center px-6" role="status" aria-live="polite" aria-label="Soul Codex route is loading">
      <div className="text-center">
        <div className="font-serif text-xl font-semibold">Soul Codex</div>
        <div className="mt-2 text-sm opacity-60">Opening…</div>
      </div>
    </div>
  );
}


function ProfileRoute() {
  const { id } = useParams();
  const profile = id?.startsWith("local-") ? <OfflineProfilePage /> : <Profile />;
  return (
    <ProfileClarityLauncher profileId={id}>
      <div className="min-h-screen bg-[radial-gradient(circle_at_50%_-10%,rgba(106,61,170,.18),transparent_34%),linear-gradient(180deg,#090610,#0d0917_52%,#08060d)]">
        {profile}
      </div>
    </ProfileClarityLauncher>
  );
}

function ReadingRoute() {
  const { id } = useParams();
  return id?.startsWith("local-") ? <OfflineClarityReadingPage /> : <ClarityReadingPage />;
}

function TimelineRoute() {
  return (
    <div className="sc-app-shell">
      <Navigation />
      <div className="pt-20">
        <TimelineContinuityHeader />
        <TimelinePage />
      </div>
    </div>
  );
}

function Router() {
  const [pathname] = useLocation();
  return (
    <>
      <a
        href="#main-content"
        className="sr-only fixed left-3 top-3 z-[100] rounded-lg bg-[var(--sc-gold-bright)] px-4 py-3 font-semibold text-[#170f07] focus:not-sr-only"
      >
        Skip to main content
      </a>
      <RouteErrorBoundary key={pathname}>
      <Suspense fallback={<RouteLoadingFallback />}>
        <div id="main-content" tabIndex={-1}>
          <Switch>
      <Route path="/" component={Home} />
      <Route path="/create" component={LocalFirstInputForm} />
      {/* Backward-compatible alias for older onboarding/deep links. */}
      <Route path="/start" component={LocalFirstInputForm} />
      <Route path="/compatibility" component={CompatibilityRoute} />
      <Route path="/compatibility/explorer" component={CompatibilityExplorerPage} />
      <Route path="/compatibility/compare" component={CompatibilityPersonPage} />
      <Route path="/connections" component={ConnectionsPage} />
      <Route path="/timeline" component={TimelineRoute} />
      <Route path="/tools" component={CodexToolsPage} />
      <Route path="/systems/atlas" component={AstrologyAtlasPage} />
      <Route path="/systems" component={SystemsDetailsPage} />
      <Route path="/reading/:id" component={ReadingRoute} />
      <Route path="/profile/:id" component={ProfileRoute} />
      <Route path="/shared/:token" component={PublicSharedProfilePage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/support" component={SupportPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/diagnostics" component={DiagnosticsPage} />
      <Route path="/delete-account" component={AccountDeletionPage} />
      <Route path="/account-deletion" component={AccountDeletionPage} />
      <Route path="/pricing" component={PricingPage} />
      <Route component={NotFound} />
          </Switch>
        </div>
      </Suspense>
      </RouteErrorBoundary>
    </>
  );
}

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider><Toaster /><Router /></TooltipProvider>
      </QueryClientProvider>
    </MotionConfig>
  );
}

export default App;
