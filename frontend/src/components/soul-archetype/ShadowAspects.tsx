interface ShadowAspectsProps {
  data: string[]
}

export function ShadowAspects({ data }: ShadowAspectsProps) {
  return (
    <section className="shadow-aspects-section">
      <div className="section-header">
        <h2 className="section-title">Shadow Aspects</h2>
        <div className="section-accent" />
      </div>
      
      <div className="aspects-list">
        {data.map((aspect, index) => (
          <div key={index} className="aspect-item">
            <div className="aspect-marker" />
            <p className="aspect-text">{aspect}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
