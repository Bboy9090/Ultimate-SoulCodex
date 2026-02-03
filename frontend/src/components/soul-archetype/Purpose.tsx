interface PurposeProps {
  data: string
}

export function Purpose({ data }: PurposeProps) {
  return (
    <section className="purpose-section">
      <div className="section-header">
        <h2 className="section-title">Purpose</h2>
        <div className="section-accent" />
      </div>
      
      <div className="purpose-content">
        <p className="purpose-text">{data}</p>
      </div>
    </section>
  )
}
