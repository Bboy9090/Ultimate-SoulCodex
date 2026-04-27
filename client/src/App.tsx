import { Route, Switch, useLocation } from "wouter";
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

import { useState, useEffect } from "react";
import SplashScreen from "./components/SplashScreen";

function hasProfileData(): boolean {
  try {
    const p = localStorage.getItem("soulProfile");
    return !!p && p !== "undefined" && p !== "null";
  } catch {
    return false;
  }
}

export default function App() {
  const [location, setLocation] = useLocation();
  const [showSplash, setShowSplash] = useState(true);
  const hasProfile = hasProfileData();

  useEffect(() => {
    // If we're at root and have no profile, we'll want to go to /start after splash
    if (!hasProfile && location === "/") {
      // Handled by the Switch below, but good to know
    }
  }, [hasProfile, location]);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--sc-bg-ink)" }}>
      {/* Sidebar - Only visible if profile exists */}
      {hasProfile && <Nav />}
      
      <main style={{ flex: 1, position: "relative", minWidth: 0 }}>
        <Switch>
          <Route path="/">
            {hasProfile ? <TodayPage /> : <OnboardingPage />}
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
          <Route>
            <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
              <h1 style={{ color: "var(--sc-gold)", fontSize: "2rem" }}>404</h1>
              <p style={{ opacity: 0.5 }}>The stars do not align here.</p>
              <a href="/" style={{ color: "var(--sc-gold)", marginTop: "1rem", display: "inline-block" }}>Return Home</a>
            </div>
          </Route>
        </Switch>
      </main>
    </div>
  );
}
