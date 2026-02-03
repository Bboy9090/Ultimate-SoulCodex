import { useState, useEffect } from 'react'

type Theme = 'mystical-cyan' | 'cosmic-purple' | 'solar-gold' | 'emerald-mystic' | 'rose-mystic'

const themes: { name: Theme; label: string; preview: string }[] = [
  { name: 'mystical-cyan', label: 'Mystical Cyan', preview: '#06b6d4' },
  { name: 'cosmic-purple', label: 'Cosmic Purple', preview: '#8b5cf6' },
  { name: 'solar-gold', label: 'Solar Gold', preview: '#f59e0b' },
  { name: 'emerald-mystic', label: 'Emerald Mystic', preview: '#10b981' },
  { name: 'rose-mystic', label: 'Rose Mystic', preview: '#ec4899' },
]

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState<Theme>('mystical-cyan')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Load saved theme
    const saved = localStorage.getItem('soul-codex-theme') as Theme
    if (saved && themes.find(t => t.name === saved)) {
      setCurrentTheme(saved)
      applyTheme(saved)
    }
  }, [])

  const applyTheme = (theme: Theme) => {
    // Remove all theme stylesheets
    document.querySelectorAll('link[data-theme]').forEach(link => link.remove())
    
    // Import theme CSS dynamically
    import(`../styles/themes/${theme}.css`).then(() => {
      // Save to localStorage
      localStorage.setItem('soul-codex-theme', theme)
    }).catch(err => {
      console.warn(`Theme ${theme} not found, using default`)
    })
  }

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme)
    applyTheme(theme)
    setIsOpen(false)
  }

  const currentThemeData = themes.find(t => t.name === currentTheme)!

  return (
    <div className="theme-switcher">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="theme-button"
        aria-label="Change theme"
      >
        <div
          className="theme-preview"
          style={{ backgroundColor: currentThemeData.preview }}
        />
        <span>{currentThemeData.label}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={isOpen ? 'rotate' : ''}
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="theme-dropdown">
          {themes.map(theme => (
            <button
              key={theme.name}
              onClick={() => handleThemeChange(theme.name)}
              className={`theme-option ${currentTheme === theme.name ? 'active' : ''}`}
            >
              <div
                className="theme-preview"
                style={{ backgroundColor: theme.preview }}
              />
              <span>{theme.label}</span>
              {currentTheme === theme.name && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M13 4L6 11L3 8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
