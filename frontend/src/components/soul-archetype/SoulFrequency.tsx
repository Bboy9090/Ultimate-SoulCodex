interface SoulFrequencyProps {
  data: {
    frequency?: string
    resonance?: string
    vibration?: string
  }
}

export function SoulFrequency({ data }: SoulFrequencyProps) {
  return (
    <section className="soul-frequency-section">
      <div className="section-header">
        <h2 className="section-title">Soul Frequency</h2>
        <div className="section-accent" />
      </div>
      
      <div className="frequency-display">
        <div className="frequency-value">{data.frequency || '432 Hz'}</div>
        <div className="frequency-details">
          <span className="resonance">{data.resonance || 'Harmonic'}</span>
          <span className="vibration">{data.vibration || 'High'}</span>
        </div>
      </div>
    </section>
  )
}
