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

const routes = (
  <Switch>
    <Route path="/" component={LandingPage} />
    <Route path="/start" component={OnboardingPage} />
    <Route path="/profile" component={ProfilePage} />
    <Route path="/today" component={TodayPage} />
    <Route path="/guide" component={SoulGuidePage} />
    <Route path="/tracker" component={TrackerPage} />
    <Route path="/compat" component={CompatibilityPage} />
    <Route path="/timeline" component={TimelinePage} />
    <Route path="/horoscope" component={DailyHoroscopePage} />
    <Route path="/poster" component={PosterPage} />
    <Route path="/codex" component={CodexReadingPage} />
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
  const isLanding = location === "/";

  if (isLanding) {
    return (
      <>
        <Nav />
        <main style={{ flex: 1 }}>
          {routes}
        </main>
      </>
    );
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
