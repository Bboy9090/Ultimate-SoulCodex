import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SoulArchetypePage } from './pages/SoulArchetypePage'
import { LandingPage } from './pages/LandingPage'
import { ThemeSwitcher } from './components/ThemeSwitcher'
import './styles/themes/mystical-cyan.css'
import './styles/soul-archetype.css'
import './styles/theme-switcher.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header className="app-header">
          <div className="header-content">
            <h1 className="app-title">🔮 Ultimate Soul Codex</h1>
            <ThemeSwitcher />
          </div>
        </header>
        
        <main className="app-main">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/archetype" element={<SoulArchetypePage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
