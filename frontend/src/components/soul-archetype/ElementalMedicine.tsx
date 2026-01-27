/**
 * Elemental Medicine Component
 * Displays Eastern + West/Central African Elemental Medicine System
 */

interface ElementalMedicineProps {
  data: {
    primaryElement?: string;
    secondaryElement?: string;
    excessElement?: string | null;
    deficientElement?: string | null;
    balance?: string;
    interpretation?: string;
    dailyFocus?: string;
    remedies?: Array<{
      category: string;
      title: string;
      description: string;
      element: string;
    }>;
  } | null;
}

const ELEMENT_SYMBOLS: Record<string, string> = {
  Earth: '🌍',
  Water: '💧',
  Fire: '🔥',
  Air: '🌬️',
  Metal: '⚔️'
};

const ELEMENT_COLORS: Record<string, string> = {
  Earth: '#8B7355',
  Water: '#4A90D9',
  Fire: '#E85D4C',
  Air: '#87CEEB',
  Metal: '#C0C0C0'
};

export function ElementalMedicine({ data }: ElementalMedicineProps) {
  if (!data) return null;

  return (
    <section className="elemental-medicine-section">
      <div className="section-header">
        <h2 className="section-title">Elemental Medicine</h2>
        <div className="section-accent" />
        <p className="section-subtitle">Eastern + West/Central African Wisdom</p>
      </div>

      {/* Primary Elements Display */}
      <div className="elemental-profile">
        <div className="primary-elements">
          <div className="element-card primary">
            <div className="element-icon" style={{ color: ELEMENT_COLORS[data.primaryElement || ''] }}>
              {ELEMENT_SYMBOLS[data.primaryElement || '']}
            </div>
            <h3 className="element-name">{data.primaryElement}</h3>
            <p className="element-label">Primary Element</p>
          </div>

          {data.secondaryElement && (
            <div className="element-card secondary">
              <div className="element-icon" style={{ color: ELEMENT_COLORS[data.secondaryElement] }}>
                {ELEMENT_SYMBOLS[data.secondaryElement]}
              </div>
              <h3 className="element-name">{data.secondaryElement}</h3>
              <p className="element-label">Secondary Element</p>
            </div>
          )}
        </div>

        {/* Balance Indicator */}
        <div className="balance-indicator">
          <div className={`balance-badge ${data.balance?.toLowerCase().replace(' ', '-')}`}>
            <span className="balance-label">Balance:</span>
            <span className="balance-value">{data.balance}</span>
          </div>
        </div>
      </div>

      {/* Interpretation */}
      {data.interpretation && (
        <div className="interpretation-box">
          <p className="interpretation-text">{data.interpretation}</p>
        </div>
      )}

      {/* Excess/Deficient Elements */}
      {(data.excessElement || data.deficientElement) && (
        <div className="elemental-imbalance">
          {data.excessElement && (
            <div className="imbalance-card excess">
              <div className="imbalance-header">
                <span className="imbalance-icon">⚠️</span>
                <h4>Excess {data.excessElement}</h4>
              </div>
              <p className="imbalance-description">
                You may have too much {data.excessElement.toLowerCase()} energy. Consider balancing with opposite elements.
              </p>
            </div>
          )}

          {data.deficientElement && (
            <div className="imbalance-card deficient">
              <div className="imbalance-header">
                <span className="imbalance-icon">💡</span>
                <h4>Deficient {data.deficientElement}</h4>
              </div>
              <p className="imbalance-description">
                You could benefit from more {data.deficientElement.toLowerCase()} energy in your life.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Daily Focus */}
      {data.dailyFocus && (
        <div className="daily-focus-card">
          <div className="daily-focus-header">
            <span className="daily-icon">✨</span>
            <h4>Today's Elemental Focus</h4>
          </div>
          <div className="daily-element">
            <span className="daily-symbol">{ELEMENT_SYMBOLS[data.dailyFocus]}</span>
            <span className="daily-name">{data.dailyFocus}</span>
          </div>
        </div>
      )}

      {/* Remedies */}
      {data.remedies && data.remedies.length > 0 && (
        <div className="remedies-section">
          <h3 className="remedies-title">Elemental Remedies</h3>
          <div className="remedies-grid">
            {data.remedies.slice(0, 4).map((remedy, index) => (
              <div key={index} className="remedy-card">
                <div className="remedy-category">{remedy.category}</div>
                <h4 className="remedy-title">{remedy.title}</h4>
                <p className="remedy-description">{remedy.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="elemental-disclaimer">
        <p className="disclaimer-text">
          <strong>Note:</strong> Elemental Medicine insights are for personal reflection and wellness education. 
          They do not diagnose or treat medical conditions. Always consult a licensed professional for medical concerns.
        </p>
      </div>
    </section>
  );
}
