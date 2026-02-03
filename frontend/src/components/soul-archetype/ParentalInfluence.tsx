/**
 * Parental Influence Component
 * Displays how parent signs affect your astrological blueprint
 */

interface ParentalInfluenceProps {
  data: {
    fatherInfluence?: {
      sign: string;
      element: string;
      influence: string;
      strengths: string[];
      challenges: string[];
      howItShows: string;
    };
    motherInfluence?: {
      sign: string;
      element: string;
      influence: string;
      strengths: string[];
      challenges: string[];
      howItShows: string;
    };
    combinedInfluence?: {
      dynamic: string;
      description: string;
      compatibility: string;
      lessons: string[];
    };
    inheritedTraits?: string[];
    balancingAct?: string;
    growthOpportunities?: string[];
  } | null;
}

const ELEMENT_COLORS: Record<string, string> = {
  Fire: '#E85D4C',
  Earth: '#8B7355',
  Air: '#87CEEB',
  Water: '#4A90D9'
};

export function ParentalInfluence({ data }: ParentalInfluenceProps) {
  if (!data) return null;

  return (
    <section className="parental-influence-section">
      <div className="section-header">
        <h2 className="section-title">Parental Influence</h2>
        <div className="section-accent" />
        <p className="section-subtitle">How Parent Signs Shape Your Blueprint</p>
      </div>

      {/* Parent Influences */}
      <div className="parent-influences">
        {data.fatherInfluence && (
          <div className="parent-card father">
            <div className="parent-header">
              <span className="parent-icon">👨</span>
              <div className="parent-info">
                <h3 className="parent-title">Father's Influence</h3>
                <div className="parent-sign">
                  <span 
                    className="sign-badge" 
                    style={{ 
                      borderColor: ELEMENT_COLORS[data.fatherInfluence.element] || '#666' 
                    }}
                  >
                    {data.fatherInfluence.sign} ({data.fatherInfluence.element})
                  </span>
                </div>
              </div>
            </div>

            <p className="parent-influence-text">{data.fatherInfluence.influence}</p>
            <p className="parent-how-shows">{data.fatherInfluence.howItShows}</p>

            {data.fatherInfluence.strengths && data.fatherInfluence.strengths.length > 0 && (
              <div className="parent-traits">
                <h4 className="traits-title">Inherited Strengths</h4>
                <div className="traits-list">
                  {data.fatherInfluence.strengths.map((strength, index) => (
                    <span key={index} className="trait-chip positive">
                      {strength}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {data.fatherInfluence.challenges && data.fatherInfluence.challenges.length > 0 && (
              <div className="parent-traits">
                <h4 className="traits-title">Integration Challenges</h4>
                <div className="traits-list">
                  {data.fatherInfluence.challenges.map((challenge, index) => (
                    <span key={index} className="trait-chip neutral">
                      {challenge}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {data.motherInfluence && (
          <div className="parent-card mother">
            <div className="parent-header">
              <span className="parent-icon">👩</span>
              <div className="parent-info">
                <h3 className="parent-title">Mother's Influence</h3>
                <div className="parent-sign">
                  <span 
                    className="sign-badge" 
                    style={{ 
                      borderColor: ELEMENT_COLORS[data.motherInfluence.element] || '#666' 
                    }}
                  >
                    {data.motherInfluence.sign} ({data.motherInfluence.element})
                  </span>
                </div>
              </div>
            </div>

            <p className="parent-influence-text">{data.motherInfluence.influence}</p>
            <p className="parent-how-shows">{data.motherInfluence.howItShows}</p>

            {data.motherInfluence.strengths && data.motherInfluence.strengths.length > 0 && (
              <div className="parent-traits">
                <h4 className="traits-title">Inherited Strengths</h4>
                <div className="traits-list">
                  {data.motherInfluence.strengths.map((strength, index) => (
                    <span key={index} className="trait-chip positive">
                      {strength}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {data.motherInfluence.challenges && data.motherInfluence.challenges.length > 0 && (
              <div className="parent-traits">
                <h4 className="traits-title">Integration Challenges</h4>
                <div className="traits-list">
                  {data.motherInfluence.challenges.map((challenge, index) => (
                    <span key={index} className="trait-chip neutral">
                      {challenge}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Combined Influence */}
      {data.combinedInfluence && (
        <div className="combined-influence-card">
          <div className="combined-header">
            <span className="combined-icon">⚡</span>
            <h3>Combined Influence</h3>
          </div>
          
          <p className="combined-dynamic">{data.combinedInfluence.dynamic}</p>
          <p className="combined-description">{data.combinedInfluence.description}</p>

          {data.combinedInfluence.compatibility && (
            <div className="compatibility-badge">
              <span className="compatibility-label">Compatibility:</span>
              <span className={`compatibility-value ${data.combinedInfluence.compatibility.toLowerCase()}`}>
                {data.combinedInfluence.compatibility}
              </span>
            </div>
          )}

          {data.combinedInfluence.lessons && data.combinedInfluence.lessons.length > 0 && (
            <div className="lessons-section">
              <h4 className="lessons-title">Key Lessons</h4>
              <ul className="lessons-list">
                {data.combinedInfluence.lessons.map((lesson, index) => (
                  <li key={index} className="lesson-item">
                    <span className="lesson-icon">📚</span>
                    {lesson}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Inherited Traits */}
      {data.inheritedTraits && data.inheritedTraits.length > 0 && (
        <div className="inherited-traits-section">
          <h3 className="inherited-title">Inherited Traits</h3>
          <div className="inherited-grid">
            {data.inheritedTraits.map((trait, index) => (
              <div key={index} className="inherited-chip">
                {trait}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Balancing Act */}
      {data.balancingAct && (
        <div className="balancing-card">
          <h3 className="balancing-title">The Balancing Act</h3>
          <p className="balancing-text">{data.balancingAct}</p>
        </div>
      )}

      {/* Growth Opportunities */}
      {data.growthOpportunities && data.growthOpportunities.length > 0 && (
        <div className="growth-opportunities-section">
          <h3 className="growth-title">Growth Opportunities</h3>
          <ul className="growth-list">
            {data.growthOpportunities.map((opportunity, index) => (
              <li key={index} className="growth-item">
                <span className="growth-icon">🌱</span>
                {opportunity}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
