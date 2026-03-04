import { Route, Switch } from "wouter";
import Nav from "./components/Nav";
import OnboardingPage from "./pages/OnboardingPage";
import ProfilePage from "./pages/ProfilePage";
import DailyHoroscopePage from "./pages/DailyHoroscopePage";
import PosterPage from "./pages/PosterPage";
import CodexReadingPage from "./pages/CodexReadingPage";
import TodayPage from "./pages/TodayPage";

export default function App() {
  return (
    <>
      <Nav />
      <main style={{ flex: 1 }}>
        <Switch>
          <Route path="/" component={OnboardingPage} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/today" component={TodayPage} />
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
      </main>
    </>
  );
}
