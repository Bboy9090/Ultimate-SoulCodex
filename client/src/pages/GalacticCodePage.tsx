/**
 * Galactic Code Page
 *
 * Full-page display of Galactic Code with all 7 sections.
 */

import { useState } from 'react';
import type { GalacticCodeResult } from '../../../shared/galactic-code/types';
import { GalacticCodeCard } from '../components/GalacticCodeCard';
import { GalacticCodeMap } from '../components/GalacticCodeMap';
import ErrorBoundary from '../components/ErrorBoundary';

export default function GalacticCodePage() {
  const [code, setCode] = useState<GalacticCodeResult | null>(null);
  const [isExpanded, setIsExpanded] = useState<Record<string, boolean>>({});

  // In a real app, this would load from ProfileContext or route params
  // For now, we'll show a message to generate or load a code
  const handleGenerateCode = async (input: GalacticCodeInput) => {
    try {
      const response = await fetch('/api/galactic-code/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) throw new Error('Failed to generate Galactic Code');
      const result = await response.json();
      setCode(result);
    } catch (error) {
      console.error('Error generating Galactic Code:', error);
    }
  };

  if (!code) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 p-4 sm:p-8">
        <div className="max-w-3xl mx-auto text-center py-16">
          <div className="text-5xl mb-6">👁</div>
          <h1 className="text-4xl font-bold text-gold-200 mb-4">Galactic Code</h1>
          <p className="text-ivory-200 text-lg mb-8">
            Your fused identity fingerprint across astrology, Human Design, numerology, and behavioral pattern analysis.
          </p>
          <p className="text-slate-300 mb-8">
            Complete or verify your astrology, Human Design, numerology, and behavioral profiles to generate your Galactic Code.
          </p>
          <button className="rounded-lg bg-gold-600 hover:bg-gold-500 px-6 py-3 font-semibold text-slate-950 transition-colors">
            Generate Galactic Code
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Section 1: Galactic Code Hero */}
        <ErrorBoundary>
          <GalacticCodeCard code={code} />
        </ErrorBoundary>

        {/* Section 2: Axis Map (includes 3, 4, 5, 7) */}
        <ErrorBoundary>
          <GalacticCodeMap code={code} />
        </ErrorBoundary>

        {/* Section 6: Interpretation */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gold-200 uppercase tracking-wider">Your Galactic Identity</h2>

          <div className="space-y-4">
            {/* Identity */}
            <div className="rounded-lg border border-gold-500/30 bg-gradient-to-br from-slate-950 to-purple-950 p-6">
              <button
                onClick={() => setIsExpanded({ ...isExpanded, identity: !isExpanded.identity })}
                className="w-full text-left"
              >
                <h3 className="text-lg font-bold text-ivory-100 flex items-center gap-2">
                  <span>{isExpanded.identity ? '▼' : '▶'}</span> Identity
                </h3>
              </button>
              {isExpanded.identity && (
                <p className="mt-3 text-ivory-100 leading-relaxed">{code.interpretation.identity}</p>
              )}
            </div>

            {/* Decision Code */}
            <div className="rounded-lg border border-blue-500/30 bg-gradient-to-br from-slate-950 to-blue-950 p-6">
              <button
                onClick={() => setIsExpanded({ ...isExpanded, decision: !isExpanded.decision })}
                className="w-full text-left"
              >
                <h3 className="text-lg font-bold text-blue-100 flex items-center gap-2">
                  <span>{isExpanded.decision ? '▼' : '▶'}</span> Decision Code
                </h3>
              </button>
              {isExpanded.decision && (
                <p className="mt-3 text-blue-50 leading-relaxed">{code.interpretation.decisionCode}</p>
              )}
            </div>

            {/* Stress Mechanic */}
            <div className="rounded-lg border border-orange-500/30 bg-gradient-to-br from-slate-950 to-orange-950 p-6">
              <button
                onClick={() => setIsExpanded({ ...isExpanded, stress: !isExpanded.stress })}
                className="w-full text-left"
              >
                <h3 className="text-lg font-bold text-orange-100 flex items-center gap-2">
                  <span>{isExpanded.stress ? '▼' : '▶'}</span> Stress Mechanic
                </h3>
              </button>
              {isExpanded.stress && (
                <p className="mt-3 text-orange-50 leading-relaxed">{code.interpretation.stressMechanic}</p>
              )}
            </div>

            {/* Relational Code */}
            <div className="rounded-lg border border-pink-500/30 bg-gradient-to-br from-slate-950 to-pink-950 p-6">
              <button
                onClick={() => setIsExpanded({ ...isExpanded, relational: !isExpanded.relational })}
                className="w-full text-left"
              >
                <h3 className="text-lg font-bold text-pink-100 flex items-center gap-2">
                  <span>{isExpanded.relational ? '▼' : '▶'}</span> Relational Code
                </h3>
              </button>
              {isExpanded.relational && (
                <p className="mt-3 text-pink-50 leading-relaxed">{code.interpretation.relationalCode}</p>
              )}
            </div>

            {/* Mission Arc */}
            <div className="rounded-lg border border-emerald-500/30 bg-gradient-to-br from-slate-950 to-emerald-950 p-6">
              <button
                onClick={() => setIsExpanded({ ...isExpanded, mission: !isExpanded.mission })}
                className="w-full text-left"
              >
                <h3 className="text-lg font-bold text-emerald-100 flex items-center gap-2">
                  <span>{isExpanded.mission ? '▼' : '▶'}</span> Mission Arc
                </h3>
              </button>
              {isExpanded.mission && (
                <p className="mt-3 text-emerald-50 leading-relaxed">{code.interpretation.missionArc}</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-700/50 pt-6 text-center text-sm text-slate-400">
          <p>Galactic Code generated {new Date(code.generatedAt).toLocaleString()}</p>
          <p className="mt-2">Unique multidimensional fingerprint</p>
        </div>
      </div>
    </div>
  );
}
