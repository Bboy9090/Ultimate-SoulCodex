import { Switch, Route, useParams } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "./pages/not-found";
import Home from "./pages/home";
import LocalFirstInputForm from "./pages/local-first-input-form";
import Profile from "./pages/profile";
import OfflineProfilePage from "./pages/offline-profile";
import CompatibilityPage from "./pages/CompatibilityPage";
import TimelinePage from "./pages/TimelinePage";
import AstrocartographyPage from "./pages/AstrocartographyPage";
import PalmistryPage from "./pages/PalmistryPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import SupportPage from "./pages/SupportPage";
import SettingsPage from "./pages/SettingsPage";
import PricingPage from "./pages/PricingPage";

function ProfileRoute() {
  const { id } = useParams();
  return id?.startsWith("local-") ? <OfflineProfilePage /> : <Profile />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/create" component={LocalFirstInputForm} />
      <Route path="/compatibility" component={CompatibilityPage} />
      <Route path="/timeline" component={TimelinePage} />
      <Route path="/astrocartography/:id" component={AstrocartographyPage} />
      <Route path="/palmistry/:id" component={PalmistryPage} />
      <Route path="/profile/:id" component={ProfileRoute} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/support" component={SupportPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/pricing" component={PricingPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
