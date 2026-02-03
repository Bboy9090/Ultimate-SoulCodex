interface SoulArchitectureProps {
  data: {
    foundation?: string
    structure?: string
    expression?: string
    integration?: string
  }
}

export function SoulArchitecture({ data }: SoulArchitectureProps) {
  return (
    <section className="soul-architecture-section">
      <div className="section-header">
        <h2 className="section-title">Whole Soul Architecture</h2>
        <div className="section-accent" />
      </div>
      
      <div className="architecture-grid">
        <div className="architecture-item">
          <h3 className="architecture-label">Foundation</h3>
          <p className="architecture-value">{data.foundation || 'Astrological Big 3'}</p>
        </div>
        
        <div className="architecture-item">
          <h3 className="architecture-label">Structure</h3>
          <p className="architecture-value">{data.structure || 'Human Design Type'}</p>
        </div>
        
        <div className="architecture-item">
          <h3 className="architecture-label">Expression</h3>
          <p className="architecture-value">{data.expression || 'Life Path Number'}</p>
        </div>
        
        <div className="architecture-item">
          <h3 className="architecture-label">Integration</h3>
          <p className="architecture-value">{data.integration || 'All 30+ Systems Unified'}</p>
        </div>
      </div>
    </section>
  )
}
