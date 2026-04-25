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

// ... (existing imports)

export default function App() {
  const [location] = useLocation();
  const isMarketing = location === "/" && !hasProfile();

  useEffect(() => {
    // Dismiss the native splash screen now that React has hydrated
    import("@capacitor/splash-screen").then(({ SplashScreen }) => {
      SplashScreen.hide().catch(console.warn);
    });
  }, []);

  if (isMarketing) {
    return <LandingPage />;
  }

  return (
    <div className="sc-app-shell min-h-screen relative overflow-x-hidden">
      <CosmicBackground />
      <Nav />
      <main className="sc-main-content relative z-10">
        {routes}
      </main>
    </div>
  );
}

