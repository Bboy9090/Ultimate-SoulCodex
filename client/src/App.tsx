import { Switch, Route, useParams, useNavigate } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/navigation";
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
import type { Profile as ProfileType } from "@shared/schema";

function ProfileRoute() {
  const { id } = useParams();
  return id?.startsWith("local-") ? <OfflineProfilePage /> : <Profile />;
}

interface PremiumRouteProps {
  component: React.ComponentType<any>;
}

function PremiumRoute({ component: Component }: PremiumRouteProps) {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: profile, isLoading } = useQuery<ProfileType>({
    queryKey: ["/api/profiles", id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 flex items-center justify-center min-h-[calc(100vh-6rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile || !profile.isPremium) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 flex items-center justify-center min-h-[calc(100vh-6rem)]">
          <Card className="max-w-md text-center p-8">
            <h2 className="text-xl font-bold mb-4">Premium Feature</h2>
            <p className="text-muted-foreground mb-6">
              This feature is available for premium members only. Upgrade your account to access it.
            </p>
            <button
              onClick={() => navigate(`/pricing`)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
            >
              View Pricing
            </button>
          </Card>
        </div>
      </div>
    );
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/create" component={LocalFirstInputForm} />
      <Route path="/compatibility" component={CompatibilityPage} />
      <Route path="/timeline" component={TimelinePage} />
      <Route path="/astrocartography/:id">
        {() => <PremiumRoute component={AstrocartographyPage} />}
      </Route>
      <Route path="/palmistry/:id">
        {() => <PremiumRoute component={PalmistryPage} />}
      </Route>
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
