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
    <Route>
      <div className="container" style={{ padding: "3rem 1rem", textAlign: "center" }}>
        <h1>404</h1>
        <p>Page not found</p>
      </div>
    </Route>
  </Switch>
);

export default function App() {
  const [location] = useLocation();
  const isMarketing = location === "/" && !hasProfile();

  if (isMarketing) {
    return <LandingPage />;
  }

  return (
    <div className="sc-app-shell">
      <Nav />
      <main className="sc-main-content">
        {routes}
      </main>
    </div>
  );
}
