import { useEffect } from "react";
import { Route, Switch, useLocation, Redirect } from "wouter";
import Nav from "./components/Nav";
import LandingPage from "./pages/LandingPage";
import OnboardingPage from "./pages/OnboardingPage";
import ProfilePage from "./pages/ProfilePage";
import DailyHoroscopePage from "./pages/DailyHoroscopePage";
import PosterPage from "./pages/PosterPage";
import CodexReadingPage from "./pages/CodexReadingPage";
import TodayPage from "./pages/TodayPage";
import SoulGuidePage from "./pages/SoulGuidePage";
import TrackerPage from "./pages/TrackerPage";
import CompatibilityPage from "./pages/CompatibilityPage";
import TimelinePage from "./pages/TimelinePage";
import BlueprintPage from "./pages/BlueprintPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import AdminPage from "./pages/AdminPage";
import PricingPage from "./pages/PricingPage";

function hasProfile(): boolean {
  try {
    return !!localStorage.getItem("soulProfile");
  } catch { return false; }
}

function SmartHome() {
  if (hasProfile()) return <TodayPage />;
  return <LandingPage />;
}

const routes = (
  <Switch>
    <Route path="/" component={SmartHome} />
    <Route path="/start" component={OnboardingPage} />
    <Route path="/profile" component={ProfilePage} />
    <Route path="/guide" component={SoulGuidePage} />
    <Route path="/tracker" component={TrackerPage} />
    <Route path="/compat" component={CompatibilityPage} />
    <Route path="/timeline" component={TimelinePage} />
    <Route path="/horoscope" component={DailyHoroscopePage} />
    <Route path="/poster" component={PosterPage} />
    <Route path="/codex" component={CodexReadingPage} />
    <Route path="/blueprint" component={BlueprintPage} />
    <Route path="/today" component={TodayPage} />
    <Route path="/privacy" component={PrivacyPage} />
    <Route path="/terms" component={TermsPage} />
    <Route path="/admin" component={AdminPage} />
    <Route path="/pricing" component={PricingPage} />
    <Route>
      <div className="container" style={{ padding: "3rem 1rem", textAlign: "center" }}>
        <h1>404</h1>
        <p>Page not found</p>
      </div>
    </Route>
  </Switch>
);

import { CosmicBackground } from "./components/CosmicBackground";
import { Button } from "./components/ui/button";

export default function App() {
  const [location] = useLocation();
  const hasProfile = !!localStorage.getItem("soulProfile");

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="relative">
        <Switch>
          <Route path="/">
            {hasProfile ? <TodayPage /> : <LandingPage />}
          </Route>
          <Route path="/start" component={OnboardingPage} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/guide" component={SoulGuidePage} />
          <Route path="/tracker" component={TrackerPage} />
          <Route path="/compat" component={CompatibilityPage} />
          <Route path="/timeline" component={TimelinePage} />
          <Route path="/horoscope" component={DailyHoroscopePage} />
          <Route path="/poster" component={PosterPage} />
          <Route path="/codex" component={CodexReadingPage} />
          <Route path="/blueprint" component={BlueprintPage} />
          <Route path="/today" component={TodayPage} />
          <Route path="/privacy" component={PrivacyPage} />
          <Route path="/terms" component={TermsPage} />
          <Route path="/admin" component={AdminPage} />
          <Route path="/pricing" component={PricingPage} />
        </Switch>
      </main>
      
      {/* Recovery Section */}
      <div style={{ marginTop: "4rem", paddingTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
        <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginBottom: "1rem" }}>
          Testing or want to use a different birthday?
        </p>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-white/30 hover:text-white/60"
          onClick={() => {
            if (confirm("Reset everything and start over with a new birthday?")) {
              localStorage.clear();
              window.location.href = "/";
            }
          }}
        >
          Reset All Local Data
        </Button>
      </div>
    </div>
  );
}

