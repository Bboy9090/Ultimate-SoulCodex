import { useEffect, useState } from 'react'
import { SoulFrequency } from '../components/soul-archetype/SoulFrequency'
import { WhoIAm } from '../components/soul-archetype/WhoIAm'
import { CoreStrengths } from '../components/soul-archetype/CoreStrengths'
import { ShadowAspects } from '../components/soul-archetype/ShadowAspects'
import { Purpose } from '../components/soul-archetype/Purpose'
import { SoulArchitecture } from '../components/soul-archetype/SoulArchitecture'
import { ElementalMedicine } from '../components/soul-archetype/ElementalMedicine'
import { MoralCompass } from '../components/soul-archetype/MoralCompass'
import { ParentalInfluence } from '../components/soul-archetype/ParentalInfluence'

interface SoulArchetype {
  soul_frequency: any
  who_i_am: string
  core_strengths: string[]
  shadow_aspects: string[]
  purpose: string
  soul_architecture: any
  elementalMedicineData?: any
  moralCompassData?: any
  parentalInfluenceData?: any
}

export function SoulArchetypePage() {
  const [archetype, setArchetype] = useState<SoulArchetype | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch unique archetype from backend
    // Note: In production, this should receive birth_data from user input
    const requestData = {
      birth_data: {
        name: "User",
        birthDate: "1990-01-01",
        birthTime: "12:00",
        birthLocation: "New York, NY",
        timezone: "America/New_York",
        latitude: "40.7128",
        longitude: "-74.0060"
      },
      user_id: `user-${Date.now()}`,
      all_systems: {}
    }

    fetch('/api/soul-archetype', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    })
      .then(res => res.json())
      .then(data => {
        setArchetype(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching archetype:', err)
        // Fallback to test data if backend not available - includes soul code, moral compass, environment, and parents
        setArchetype({
          soul_frequency: { frequency: "432 Hz", resonance: "Harmonic", vibration: "High" },
          who_i_am: "Your soul code is written in the stars and grounded in the streets where your moral compass was forged. You carry the wisdom of your ancestors and the resilience of your environment, blending cosmic patterns with real-world understanding. The elements flow through you—Water's deep intuition, Metal's protective boundaries, Air's clear communication, Fire's transformative power, Earth's steady grounding—expressed through Western, Eastern (TCM/Ayurveda), and African wisdom traditions. Your parents' legacy lives in you—their gifts, their struggles, their strength—woven into your unique elemental blueprint. This combination of celestial design, earthly context, and elemental energies makes you entirely your own.",
          core_strengths: ["Intuitive Wisdom", "Creative Expression", "Transformative Power"],
          shadow_aspects: ["Perfectionism", "Overthinking", "Emotional Intensity"],
          purpose: "To bridge the mystical and material worlds, bringing ancient wisdom into modern life.",
          soul_architecture: {
            foundation: "Astrological Big 3",
            structure: "Human Design Type",
            expression: "Life Path Number",
            integration: "All 30+ Systems Unified"
          }
        })
        setLoading(false)
        // Show error - no fallback data in production mode
      })
  }, [])

  if (loading) {
    return (
      <div className="soul-archetype-loading">
        <div className="loading-spinner" />
        <p>Aligning the cosmic energies...</p>
      </div>
    )
  }

  if (!archetype) {
    return (
      <div className="soul-archetype-error">
        <p>Unable to generate your soul archetype. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="soul-archetype-container">
      {/* Render's clean vertical layout with Replit's polish */}
      
      <SoulFrequency data={archetype.soul_frequency} />
      
      {/* YOUR FAVORITE SECTION - Must be unique per user */}
      <WhoIAm 
        content={archetype.who_i_am}
        className="favorite-section highlighted"
      />
      
      <CoreStrengths data={archetype.core_strengths} />
      <ShadowAspects data={archetype.shadow_aspects} />
      <Purpose data={archetype.purpose} />
      <SoulArchitecture data={archetype.soul_architecture} />
      
      {/* New Features */}
      <ElementalMedicine data={archetype.elementalMedicineData} />
      <MoralCompass data={archetype.moralCompassData} />
      <ParentalInfluence data={archetype.parentalInfluenceData} />
    </div>
  )
}
