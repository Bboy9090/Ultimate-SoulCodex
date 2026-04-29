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
import { motion } from "framer-motion";
import ScButton from "./components/ScButton";
import { useState, useEffect } from "react";
import SplashScreen from "./components/SplashScreen";

function hasProfileData(): boolean {
  try {
    const p = localStorage.getItem("soulProfile");
    const g = localStorage.getItem("soulGuestProfile");
    const isGuest = localStorage.getItem("soulIsGuest") === "true";
    
    // If in Guest Mode, check for guest profile
    if (isGuest) return !!g && g !== "undefined" && g !== "null";
    
    // Otherwise check for owner profile
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
      {/* Dynamic Cosmic Background - Always present behind the UI */}
      <CosmicBackground />
      
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
            <div className="nebula-bg" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center" }}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ fontSize: "4rem", color: "var(--sc-gold)", marginBottom: "1rem", textShadow: "0 0 30px var(--sc-gold-glow)" }}
              >
                ◈
              </motion.div>
              <h1 className="heading-display" style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>Lost in the Cosmos</h1>
              <p style={{ color: "var(--sc-text-muted)", maxWidth: "320px", marginBottom: "2rem" }}>
                The celestial coordinates you are looking for do not exist in this dimension.
              </p>
              <Link href="/">
                <ScButton size="lg">Return to Your Path</ScButton>
              </Link>
            </div>
          </Route>
        </Switch>
      </main>
    </div>
  );
}
