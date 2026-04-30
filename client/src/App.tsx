import { Route, Switch, useLocation, Link } from "wouter";
import Nav from "./components/Nav";
import { motion } from "framer-motion";
import ScButton from "./components/ScButton";
import { useState, useEffect, lazy, Suspense } from "react";
import SplashScreen from "./components/SplashScreen";
import { CosmicBackground } from "./components/CosmicBackground";
import CosmicLoader from "./components/CosmicLoader";
import { IconCodex } from "./components/Icons";

// Lazy load pages to kill freezing/heavy initial bundle
const LandingPage = lazy(() => import("./pages/LandingPage"));
const OnboardingPage = lazy(() => import("./pages/OnboardingPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const DailyHoroscopePage = lazy(() => import("./pages/DailyHoroscopePage"));
const PosterPage = lazy(() => import("./pages/PosterPage"));
const CodexReadingPage = lazy(() => import("./pages/CodexReadingPage"));
const TodayPage = lazy(() => import("./pages/TodayPage"));
const SoulGuidePage = lazy(() => import("./pages/SoulGuidePage"));
const TrackerPage = lazy(() => import("./pages/TrackerPage"));
const CompatibilityPage = lazy(() => import("./pages/CompatibilityPage"));
const TimelinePage = lazy(() => import("./pages/TimelinePage"));
const BlueprintPage = lazy(() => import("./pages/BlueprintPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const SharePage = lazy(() => import("./pages/SharePage"));

import ErrorBoundary from "./components/ErrorBoundary";

function hasProfileData(): boolean {
  try {
    const p = localStorage.getItem("soulProfile");
    const g = localStorage.getItem("soulGuestProfile");
    const isGuest = localStorage.getItem("soulIsGuest") === "true";
    
    if (isGuest) return !!g && g !== "undefined" && g !== "null";
    return !!p && p !== "undefined" && p !== "null";
  } catch {
    return false;
  }
}

export default function App() {
  const [location, setLocation] = useLocation();
  const [showSplash, setShowSplash] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const hasProfile = hasProfileData();

  useEffect(() => {
    // Basic hydration check to ensure localStorage is accessible
    const timer = setTimeout(() => setHydrated(true), 50);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (!hydrated) {
    return <div style={{ background: "var(--sc-bg-ink)", minHeight: "100vh" }} />;
  }

  return (
    <ErrorBoundary>
      <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Dynamic Cosmic Background - Always present behind the UI */}
      <CosmicBackground />
      
      {/* Sidebar - Only visible if profile exists */}
      {hasProfile && <Nav />}
      
      <main style={{ flex: 1, position: "relative", minWidth: 0 }}>
        <Suspense fallback={<CosmicLoader fullPage label="Loading Dimension..." />}>
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
            <Route path="/share/:token" component={SharePage} />
            <Route>
              <div className="nebula-bg" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center" }}>
                <IconCodex size={64} style={{ color: "var(--sc-gold)", marginBottom: "1rem", filter: "drop-shadow(0 0 30px var(--sc-gold-glow))" }} />
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
        </Suspense>
      </main>
      </div>
    </ErrorBoundary>
  );
}
