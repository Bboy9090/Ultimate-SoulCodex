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
import LocalFirstInputForm from "./pages/local-first-input-form";
import Profile from "./pages/profile";
import OfflineProfilePage from "./pages/offline-profile";
import ClarityReadingPage from "./pages/ClarityReadingPage";
import OfflineClarityReadingPage from "./pages/OfflineClarityReadingPage";
import CompatibilityExplorerPage from "./pages/CompatibilityExplorerPage";
import CompatibilityPersonPage from "./pages/CompatibilityPersonPage";
import CompatibilityRoute from "./pages/CompatibilityRoute";
import TimelinePage from "./pages/TimelinePage";
import CodexToolsPage from "./pages/CodexToolsPage";
import SoulGuidePage from "./pages/SoulGuidePage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import SupportPage from "./pages/SupportPage";
import SettingsPage from "./pages/SettingsPage";
import DiagnosticsPage from "./pages/DiagnosticsPage";
import AccountDeletionPage from "./pages/AccountDeletionPage";
import PricingPage from "./pages/PricingPage";

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
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/create" component={LocalFirstInputForm} />
      {/* Backward-compatible alias for older onboarding/deep links. */}
      <Route path="/start" component={LocalFirstInputForm} />
      <Route path="/compatibility" component={CompatibilityRoute} />
      <Route path="/compatibility/explorer" component={CompatibilityExplorerPage} />
      <Route path="/compatibility/compare" component={CompatibilityPersonPage} />
      <Route path="/timeline" component={TimelineRoute} />
      <Route path="/tools" component={CodexToolsPage} />
      <Route path="/guide" component={SoulGuidePage} />
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
