import { lazy, Suspense } from "react";
import { Switch, Route, useParams } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/navigation";
import ProfileClarityLauncher from "@/components/ProfileClarityLauncher";
import TimelineContinuityHeader from "@/components/TimelineContinuityHeader";
import NotFound from "./pages/not-found";
import Home from "./pages/home";

const LocalFirstInputForm = lazy(() => import("./pages/local-first-input-form"));
const Profile = lazy(() => import("./pages/profile"));
const OfflineProfilePage = lazy(() => import("./pages/offline-profile"));
const ClarityReadingPage = lazy(() => import("./pages/ClarityReadingPage"));
const OfflineClarityReadingPage = lazy(() => import("./pages/OfflineClarityReadingPage"));
const CompatibilityExplorerPage = lazy(() => import("./pages/CompatibilityExplorerPage"));
const CompatibilityPersonPage = lazy(() => import("./pages/CompatibilityPersonPage"));
const CompatibilityRoute = lazy(() => import("./pages/CompatibilityRoute"));
const TimelinePage = lazy(() => import("./pages/TimelinePage"));
const CodexToolsPage = lazy(() => import("./pages/CodexToolsPage"));
const AstrologyAtlasPage = lazy(() => import("./pages/AstrologyAtlasPage"));
const SystemsDetailsPage = lazy(() => import("./pages/SystemsDetailsPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const SupportPage = lazy(() => import("./pages/SupportPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const DiagnosticsPage = lazy(() => import("./pages/DiagnosticsPage"));
const AccountDeletionPage = lazy(() => import("./pages/AccountDeletionPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const ConnectionsPage = lazy(() => import("./pages/ConnectionsPage"));

function RouteLoadingFallback() {
  return (
    <div className="min-h-screen bg-[#08060d] text-[#f5ead7] grid place-items-center px-6">
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
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
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
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider><Toaster /><Router /></TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
