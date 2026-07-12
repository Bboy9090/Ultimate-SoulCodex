import { useState } from 'react';
import {
  groupEvidenceByEngine,
  formatConfidenceAsPercent,
  formatConfidenceExplanation,
  type EvidenceEntry,
  type EngineType,
} from '@soulcodex/core';

interface EvidenceViewerProps {
  entries: EvidenceEntry[];
  compact?: boolean;
}

export default function EvidenceViewer({ entries, compact = false }: EvidenceViewerProps) {
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

  if (entries.length === 0) {
    return null;
  }

  const toggleExpanded = (id: string) => {
    const updated = new Set(expandedEntries);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setExpandedEntries(updated);
  };

  const grouped = groupEvidenceByEngine(entries);
  const engineOrder: EngineType[] = [
    'numerology',
    'astrology',
    'human-design',
    'behavior',
    'pattern',
    'timeline',
    'predictive',
  ];

  return (
    <div
      style={{
        padding: compact ? '1rem' : '1.5rem',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <h3
        style={{
          fontSize: compact ? '0.85rem' : '0.95rem',
          textTransform: 'uppercase',
          color: 'var(--sc-stone)',
          marginTop: 0,
          marginBottom: compact ? '0.75rem' : '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <span>📋</span>
        Evidence Ledger
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? '0.5rem' : '1rem' }}>
        {engineOrder.map(engine => {
          const engineEntries = grouped[engine];
          if (!engineEntries || engineEntries.length === 0) return null;

          const avgConfidence =
            engineEntries.reduce((sum, e) => sum + e.confidence, 0) / engineEntries.length;

          return (
            <div
              key={engine}
              style={{
                padding: compact ? '0.75rem' : '1rem',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  // Toggle all entries for this engine
                  const updated = new Set(expandedEntries);
                  const allExpanded = engineEntries.every(e => updated.has(e.id));
                  engineEntries.forEach(e => {
                    if (allExpanded) {
                      updated.delete(e.id);
                    } else {
                      updated.add(e.id);
                    }
                  });
                  setExpandedEntries(updated);
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: compact ? '0.8rem' : '0.85rem',
                      textTransform: 'capitalize',
                      color: 'var(--sc-ivory)',
                      fontWeight: 600,
                      marginBottom: '0.25rem',
                    }}
                  >
                    {engine.replace('-', ' ')}
                  </div>
                  <div
                    style={{
                      fontSize: compact ? '0.7rem' : '0.75rem',
                      color: 'var(--sc-stone)',
                    }}
                  >
                    {engineEntries.length} claim{engineEntries.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: compact ? '0.8rem' : '0.9rem',
                    fontWeight: 600,
                    color: avgConfidence >= 80 ? 'var(--sc-teal)' : 'var(--sc-gold)',
                  }}
                >
                  {formatConfidenceAsPercent(avgConfidence)}
                </div>
              </div>

              {engineEntries.map(entry => (
                <div
                  key={entry.id}
                  style={{
                    marginTop: '0.75rem',
                    paddingLeft: '1rem',
                    borderLeft: '2px solid rgba(212,168,95,0.2)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      cursor: 'pointer',
                    }}
                    onClick={() => toggleExpanded(entry.id)}
                  >
                    <div
                      style={{
                        flex: 1,
                        fontSize: compact ? '0.75rem' : '0.8rem',
                        color: 'var(--sc-ivory)',
                      }}
                    >
                      {entry.claim}
                    </div>
                    <div
                      style={{
                        fontSize: compact ? '0.7rem' : '0.75rem',
                        color: 'var(--sc-stone)',
                        marginLeft: '0.5rem',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatConfidenceAsPercent(entry.confidence)}
                    </div>
                  </div>

                  {expandedEntries.has(entry.id) && (
                    <div
                      style={{
                        marginTop: '0.5rem',
                        paddingTop: '0.5rem',
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                        fontSize: compact ? '0.7rem' : '0.75rem',
                        color: 'var(--sc-stone)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem',
                      }}
                    >
                      <div>
                        <strong>Status:</strong> {entry.confidenceLabel}
                      </div>
                      {entry.reasoning.length > 0 && (
                        <div>
                          <strong>Reasoning:</strong>
                          <div style={{ marginLeft: '0.5rem', whiteSpace: 'pre-wrap' }}>
                            {entry.reasoning.join(' → ')}
                          </div>
                        </div>
                      )}
                      {entry.limitations.length > 0 && (
                        <div>
                          <strong>Limitations:</strong>
                          <ul style={{ margin: '0.25rem 0 0 0.5rem', paddingLeft: '1rem' }}>
                            {entry.limitations.map((limit, idx) => (
                              <li key={idx}>{limit}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: compact ? '0.75rem' : '1rem',
          paddingTop: compact ? '0.75rem' : '1rem',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          fontSize: compact ? '0.65rem' : '0.7rem',
          color: 'var(--sc-stone)',
          fontStyle: 'italic',
        }}
      >
        Evidence levels: verified (100%), high (85%), moderate (70%), partial (55%), low (35%), unverified (15%)
      </div>
    </div>
  );
}
