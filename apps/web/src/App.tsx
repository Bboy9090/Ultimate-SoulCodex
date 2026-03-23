import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "./pages/not-found";
import Home from "./pages/home";
import OnboardingPage from "./pages/OnboardingPage";
import ProfilePage from "./pages/ProfilePage";
import CodexReadingPage from "./pages/CodexReadingPage";
import DailyHoroscopePage from "./pages/DailyHoroscopePage";
import TimelinePage from "./pages/TimelinePage";
import TrackerPage from "./pages/TrackerPage";
import CompatibilityPage from "./pages/CompatibilityPage";
import SoulGuidePage from "./pages/SoulGuidePage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/create" component={OnboardingPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/codex" component={CodexReadingPage} />
      <Route path="/horoscope" component={DailyHoroscopePage} />
      <Route path="/timeline" component={TimelinePage} />
      <Route path="/tracker" component={TrackerPage} />
      <Route path="/compatibility" component={CompatibilityPage} />
      <Route path="/soul-guide" component={SoulGuidePage} />
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
