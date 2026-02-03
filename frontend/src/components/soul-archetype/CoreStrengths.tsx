interface CoreStrengthsProps {
  data: string[]
}

export function CoreStrengths({ data }: CoreStrengthsProps) {
  return (
    <section className="core-strengths-section">
      <div className="section-header">
        <h2 className="section-title">Core Strengths</h2>
        <div className="section-accent" />
      </div>
      
      <div className="strengths-grid">
        {data.map((strength, index) => (
          <div key={index} className="strength-card">
            <div className="strength-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <p className="strength-text">{strength}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
