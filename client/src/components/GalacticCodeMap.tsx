/**
 * Galactic Code Map
 *
 * Visualizes axes scores, element matrix, behavioral sequence, and legacy function.
 */

import type { GalacticCodeResult } from '../../../shared/galactic-code/types';

interface GalacticCodeMapProps {
  code: GalacticCodeResult;
}

export function GalacticCodeMap({ code }: GalacticCodeMapProps) {
  const elementNames: Record<string, string> = {
    fire: 'Fire',
    earth: 'Earth',
    air: 'Air',
    water: 'Water',
  };

  const elementColors: Record<string, string> = {
    fire: 'bg-red-900/40 border-red-500/50',
    earth: 'bg-emerald-900/40 border-emerald-500/50',
    air: 'bg-sky-900/40 border-sky-500/50',
    water: 'bg-blue-900/40 border-blue-500/50',
  };

  return (
    <div className="space-y-6">
      {/* Top 5 Axes */}
      <div className="rounded-lg border border-gold-500/30 bg-gradient-to-br from-slate-950 to-purple-950 p-6">
        <h2 className="text-lg font-bold text-gold-200 mb-4 uppercase tracking-wider">Galactic Axes</h2>

        <div className="space-y-3">
          {code.axes.slice(0, 5).map((axis, idx) => (
            <div key={axis.key} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-ivory-100">{axis.label}</span>
                <span className="text-sm font-bold text-gold-200">{axis.score}</span>
              </div>
              <div className="w-full h-2 bg-slate-900/50 rounded-full overflow-hidden border border-slate-800/50">
                <div
                  className="h-full bg-gradient-to-r from-gold-600 to-gold-400 rounded-full transition-all duration-500"
                  style={{ width: `${axis.score}%` }}
                ></div>
              </div>
              {axis.evidence.length > 0 && (
                <p className="text-xs text-slate-400 line-clamp-1">{axis.evidence.slice(0, 2).join(' • ')}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Behavioral Sequence */}
      <div className="rounded-lg border border-purple-500/30 bg-gradient-to-br from-slate-950 to-purple-950 p-6">
        <h2 className="text-lg font-bold text-purple-200 mb-4 uppercase tracking-wider">Behavioral Sequence</h2>

        <div className="flex items-center justify-between">
          {code.behavioralSequence.map((step, idx) => (
            <div key={idx} className="flex items-center flex-1">
              <div className="text-center flex-1">
                <div className="inline-block rounded-full bg-purple-900/50 border border-purple-500/50 px-3 py-2">
                  <p className="text-sm font-semibold text-purple-200">{step}</p>
                </div>
              </div>
              {idx < code.behavioralSequence.length - 1 && (
                <div className="flex-1 h-0.5 bg-gradient-to-r from-purple-500/50 to-transparent"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Element Matrix */}
      <div className="rounded-lg border border-gold-500/30 bg-gradient-to-br from-slate-950 to-purple-950 p-6">
        <h2 className="text-lg font-bold text-gold-200 mb-4 uppercase tracking-wider">Element Matrix</h2>

        <div className="grid grid-cols-4 gap-3">
          {Object.entries(elementColors).map(([element, colors]) => (
            <div key={element} className={`rounded-lg border ${colors} p-4 text-center`}>
              <p className="text-2xl mb-2">{['🔥', '🌍', '💨', '💧'][Object.keys(elementColors).indexOf(element)]}</p>
              <p className="text-sm font-semibold text-ivory-100">{elementNames[element]}</p>
              <p className="text-2xl font-bold text-gold-200 mt-2">{code.elementMatrix[element] || 0}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Legacy Function */}
      <div className="rounded-lg border border-emerald-500/30 bg-gradient-to-br from-slate-950 to-emerald-950 p-6">
        <h2 className="text-lg font-bold text-emerald-200 mb-2 uppercase tracking-wider">Legacy Function</h2>
        <p className="text-lg text-emerald-100 font-semibold">{code.legacyFunction}</p>
        <p className="text-sm text-emerald-300/70 mt-2">Long-term trajectory and generational impact</p>
      </div>

      {/* Source Evidence */}
      {code.evidence.length > 0 && (
        <div className="rounded-lg border border-slate-500/30 bg-gradient-to-br from-slate-950 to-slate-900 p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-3 uppercase tracking-wider">Evidence</h2>
          <div className="flex flex-wrap gap-2">
            {code.evidence.map((item, idx) => (
              <span key={idx} className="inline-block rounded-full bg-slate-800/50 border border-slate-600/50 px-3 py-1 text-xs text-slate-300">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
