/**
 * Moral Compass Component
 * Displays values and ethics based on family/neighborhood experiences
 */

interface MoralCompassProps {
  data: {
    compassType?: string;
    coreValues?: string[];
    ethicalFramework?: string;
    decisionMakingStyle?: string;
    familyInfluence?: string;
    neighborhoodInfluence?: string;
    moralArchetype?: string;
    description?: string;
    strengths?: string[];
    growthAreas?: string[];
  } | null;
}

const COMPASS_ICONS: Record<string, string> = {
  Guardian: '🛡️',
  Explorer: '🧭',
  Builder: '🏗️',
  Protector: '⚔️',
  Visionary: '🔮'
};

export function MoralCompass({ data }: MoralCompassProps) {
  if (!data) return null;

  return (
    <section className="moral-compass-section">
      <div className="section-header">
        <h2 className="section-title">Moral Compass</h2>
        <div className="section-accent" />
        <p className="section-subtitle">Values & Ethics from Family & Neighborhood</p>
      </div>

      {/* Compass Type */}
      {data.compassType && (
        <div className="compass-type-card">
          <div className="compass-icon-large">
            {COMPASS_ICONS[data.compassType] || '🧭'}
          </div>
          <div className="compass-type-info">
            <h3 className="compass-type-name">{data.compassType}</h3>
            {data.moralArchetype && (
              <p className="moral-archetype">{data.moralArchetype}</p>
            )}
          </div>
        </div>
      )}

      {/* Description */}
      {data.description && (
        <div className="compass-description">
          <p>{data.description}</p>
        </div>
      )}

      {/* Core Values */}
      {data.coreValues && data.coreValues.length > 0 && (
        <div className="values-section">
          <h3 className="values-title">Core Values</h3>
          <div className="values-grid">
            {data.coreValues.map((value, index) => (
              <div key={index} className="value-chip">
                <span className="value-icon">✨</span>
                <span className="value-text">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ethical Framework & Decision Making */}
      <div className="compass-details">
        {data.ethicalFramework && (
          <div className="detail-card">
            <h4 className="detail-title">Ethical Framework</h4>
            <p className="detail-text">{data.ethicalFramework}</p>
          </div>
        )}

        {data.decisionMakingStyle && (
          <div className="detail-card">
            <h4 className="detail-title">Decision Making Style</h4>
            <p className="detail-text">{data.decisionMakingStyle}</p>
          </div>
        )}
      </div>

      {/* Family & Neighborhood Influence */}
      {(data.familyInfluence || data.neighborhoodInfluence) && (
        <div className="influence-section">
          <h3 className="influence-title">Roots & Influence</h3>
          
          {data.familyInfluence && (
            <div className="influence-card family">
              <div className="influence-header">
                <span className="influence-icon">👨‍👩‍👧‍👦</span>
                <h4>Family Influence</h4>
              </div>
              <p className="influence-text">{data.familyInfluence}</p>
            </div>
          )}

          {data.neighborhoodInfluence && (
            <div className="influence-card neighborhood">
              <div className="influence-header">
                <span className="influence-icon">🏘️</span>
                <h4>Neighborhood Influence</h4>
              </div>
              <p className="influence-text">{data.neighborhoodInfluence}</p>
            </div>
          )}
        </div>
      )}

      {/* Strengths & Growth Areas */}
      <div className="compass-growth">
        {data.strengths && data.strengths.length > 0 && (
          <div className="growth-section strengths">
            <h3 className="growth-title">Moral Strengths</h3>
            <ul className="growth-list">
              {data.strengths.map((strength, index) => (
                <li key={index} className="growth-item">
                  <span className="growth-icon">✓</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.growthAreas && data.growthAreas.length > 0 && (
          <div className="growth-section growth">
            <h3 className="growth-title">Growth Opportunities</h3>
            <ul className="growth-list">
              {data.growthAreas.map((area, index) => (
                <li key={index} className="growth-item">
                  <span className="growth-icon">🌱</span>
                  {area}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
