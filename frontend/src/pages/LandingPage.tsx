import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { WhoIAm } from '../components/soul-archetype/WhoIAm'

export function LandingPage() {
  const [whoIAmContent, setWhoIAmContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch Who I Am content for demo/landing
    const testData = {
      birth_data: {
        date: "1990-01-01",
        time: "12:00",
        location: "New York, NY",
        timezone: "America/New_York"
      },
      user_id: `landing-demo-${Date.now()}`,
      all_systems: {}
    }

    fetch('/api/soul-archetype', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })
      .then(res => res.json())
      .then(data => {
        setWhoIAmContent(data.who_i_am || "Your soul code is written in the stars and grounded in the streets where your moral compass was forged. You carry the wisdom of your ancestors and the resilience of your environment, blending cosmic patterns with real-world understanding. The elements flow through you—Water's deep intuition, Metal's protective boundaries, Air's clear communication, Fire's transformative power, Earth's steady grounding—expressed through Western, Eastern (TCM/Ayurveda), and African wisdom traditions. Your parents' legacy lives in you—their gifts, their struggles, their strength—woven into your unique elemental blueprint. This combination of celestial design, earthly context, and elemental energies makes you entirely your own.")
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching archetype:', err)
        // Fallback content - includes soul code, moral compass, environment, parents, and elemental energies
        setWhoIAmContent("Your soul code is written in the stars and grounded in the streets where your moral compass was forged. You carry the wisdom of your ancestors and the resilience of your environment, blending cosmic patterns with real-world understanding. The elements flow through you—Water's deep intuition, Metal's protective boundaries, Air's clear communication, Fire's transformative power, Earth's steady grounding—expressed through Western, Eastern (TCM/Ayurveda), and African wisdom traditions. Your parents' legacy lives in you—their gifts, their struggles, their strength—woven into your unique elemental blueprint. This combination of celestial design, earthly context, and elemental energies makes you entirely your own.")
        setLoading(false)
      })
  }, [])

  return (
    <div className="landing-page">
      {/* Who I Am Hero Section - Render's Clean + Replit's Mystical Colors */}
      {!loading && whoIAmContent && (
        <section className="hero-who-i-am">
          <WhoIAm 
            content={whoIAmContent}
            className="favorite-section highlighted hero-who-i-am-content"
          />
        </section>
      )}
      
      <section className="hero-section">
        <h1 className="hero-title">Unveil Your Cosmic Blueprint</h1>
        <p className="hero-subtitle">
          Where Mind, Body & Soul Converge
        </p>
        <p className="hero-description">
          Synthesize 30+ ancient wisdom systems — Western & Vedic astrology, 
          Human Design, Gene Keys, Numerology, Tarot, I Ching — into your 
          personalized Ultimate Soul Codex.
        </p>
        
        <div className="hero-actions">
          <Link to="/archetype" className="btn-primary">
            Begin Your Journey
          </Link>
          <button className="btn-secondary">Watch Demo</button>
        </div>
        
        <div className="hero-stats">
          <div className="stat-item">
            <div className="stat-value">4.9/5</div>
            <div className="stat-label">Rating</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">50K+</div>
            <div className="stat-label">Soul Profiles</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">100%</div>
            <div className="stat-label">Private & Secure</div>
          </div>
        </div>
      </section>
      
      <section className="features-section">
        <h2 className="section-title">30+ Mystical Systems</h2>
        <p className="section-description">
          The most comprehensive soul analysis ever created
        </p>
        {/* Systems grid would go here */}
      </section>
      
      <section className="pricing-section">
        <h2 className="section-title">Choose Your Path</h2>
        <div className="pricing-cards">
          <div className="pricing-card">
            <h3>Codex Snapshot</h3>
            <div className="price">Free</div>
            <ul>
              <li>Astrology Big 3</li>
              <li>Life Path Number</li>
              <li>Basic Enneagram</li>
            </ul>
            <Link to="/archetype" className="btn-primary">Start Free</Link>
          </div>
          
          <div className="pricing-card featured">
            <h3>Full Soul Codex</h3>
            <div className="price">$47</div>
            <div className="price-note">One-time unlock</div>
            <ul>
              <li>Everything in Free</li>
              <li>Complete astrology charts</li>
              <li>Full Human Design + Gene Keys</li>
              <li>12+ mystical systems</li>
              <li>Astrocartography map</li>
              <li>30-40 page PDF dossier</li>
            </ul>
            <button className="btn-primary">Unlock Complete Codex</button>
          </div>
        </div>
      </section>
    </div>
  )
}
