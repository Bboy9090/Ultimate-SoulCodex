/**
 * Galactic Code Card
 *
 * Hero card displaying codename, designation, short code, and confidence.
 */

import type { GalacticCodeResult } from '../../../shared/galactic-code/types';

interface GalacticCodeCardProps {
  code: GalacticCodeResult;
}

export function GalacticCodeCard({ code }: GalacticCodeCardProps) {
  const confidenceColor = {
    verified: 'bg-emerald-900/30 border-emerald-500/50 text-emerald-200',
    partial: 'bg-amber-900/30 border-amber-500/50 text-amber-200',
    unverified: 'bg-slate-900/30 border-slate-500/50 text-slate-200',
  };

  return (
    <div className="relative overflow-hidden rounded-lg border border-gold-500/30 bg-gradient-to-br from-purple-950 via-slate-950 to-purple-950 p-8 shadow-2xl">
      {/* Background geometric pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#fbbf24_0%,transparent_50%)]"></div>
      </div>

      <div className="relative z-10 space-y-6">
        {/* Eye logo and confidence badge */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">👁</div>
            <div>
              <h1 className="text-2xl font-bold text-gold-200">{code.codename}</h1>
              <p className="text-sm text-gold-300/70">{code.designation}</p>
            </div>
          </div>

          <div
            className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${confidenceColor[code.confidence]}`}
          >
            {code.confidence}
          </div>
        </div>

        {/* Tagline */}
        <p className="text-lg text-ivory-100 leading-relaxed">{code.tagline}</p>

        {/* Primary and Secondary Functions */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="border-l-2 border-gold-400/50 pl-3">
            <p className="text-xs text-gold-300/70 uppercase tracking-wider">Primary Function</p>
            <p className="text-sm font-semibold text-ivory-100">{code.primaryFunction}</p>
          </div>
          <div className="border-l-2 border-gold-400/50 pl-3">
            <p className="text-xs text-gold-300/70 uppercase tracking-wider">Secondary Function</p>
            <p className="text-sm font-semibold text-ivory-100">{code.secondaryFunction}</p>
          </div>
        </div>

        {/* Short Code */}
        <div className="rounded-lg bg-slate-900/50 p-3 font-mono">
          <p className="text-xs text-gold-300/70 uppercase tracking-wider">Fingerprint</p>
          <p className="text-lg text-gold-200 font-semibold tracking-wider">{code.shortCode}</p>
          <p className="text-xs text-slate-400 mt-1">Uniqueness: {code.uniquenessKey}</p>
        </div>

        {/* Frequency */}
        <div className="rounded-lg bg-purple-900/30 border border-purple-500/30 p-3">
          <p className="text-xs text-purple-300/70 uppercase tracking-wider">Soul Codex Symbolic Frequency</p>
          <p className="text-lg text-purple-200 font-semibold mt-1">{code.frequency}</p>
        </div>

        {/* Source Coverage */}
        <div className="grid grid-cols-4 gap-2 pt-2 text-center text-xs">
          <div className="rounded bg-slate-800/50 p-2">
            <p className="text-slate-400">Astrology</p>
            <p className={`font-semibold ${code.sourceCoverage.astrology === 'verified' ? 'text-emerald-300' : code.sourceCoverage.astrology === 'partial' ? 'text-amber-300' : 'text-slate-400'}`}>
              {code.sourceCoverage.astrology}
            </p>
          </div>
          <div className="rounded bg-slate-800/50 p-2">
            <p className="text-slate-400">HD</p>
            <p className={`font-semibold ${code.sourceCoverage.humanDesign === 'verified' ? 'text-emerald-300' : code.sourceCoverage.humanDesign === 'partial' ? 'text-amber-300' : 'text-slate-400'}`}>
              {code.sourceCoverage.humanDesign}
            </p>
          </div>
          <div className="rounded bg-slate-800/50 p-2">
            <p className="text-slate-400">Numerology</p>
            <p className={`font-semibold ${code.sourceCoverage.numerology === 'verified' ? 'text-emerald-300' : code.sourceCoverage.numerology === 'partial' ? 'text-amber-300' : 'text-slate-400'}`}>
              {code.sourceCoverage.numerology}
            </p>
          </div>
          <div className="rounded bg-slate-800/50 p-2">
            <p className="text-slate-400">Traits</p>
            <p className={`font-semibold ${code.sourceCoverage.behavioralTraitCount >= 5 ? 'text-emerald-300' : 'text-amber-300'}`}>
              {code.sourceCoverage.behavioralTraitCount}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
