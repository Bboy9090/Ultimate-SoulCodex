import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { motion, useReducedMotion } from 'framer-motion';
import type { BirthDateExploration } from '@/lib/birthDateExploration';
import { personalAtlasPlacements, verifiedHouseCusps } from '@/lib/personalAstrologyAtlas';
import Navigation from '@/components/navigation';
import { useActiveProfile } from '@/hooks/useActiveProfile';
import { ATLAS_HOUSES, ATLAS_SIGNS, atlasEntry, birthInputGuidance, personalPlacementMeaning, type AtlasSign } from '@/lib/astrologyAtlas';

export default function AstrologyAtlasPage() {
  const { profile } = useActiveProfile();
  const [sign, setSign] = useState<AtlasSign>('Aries');
  const [house, setHouse] = useState(1);
  const [selectedPersonalKey, setSelectedPersonalKey] = useState<string | null>(null);
  const [exploration, setExploration] = useState<BirthDateExploration | null>(null);
  const [explorationError, setExplorationError] = useState('');
  const [exploring, setExploring] = useState(false);
  const profileKey = `${profile?.id ?? ''}:${profile?.birthDate ?? ''}:${profile?.timezone ?? ''}`;
  const [exploredKey, setExploredKey] = useState('');
  useEffect(() => { setExploration(null); setExplorationError(''); }, [profileKey]);
  async function explore() {
    if (!profile?.birthDate || !profile?.timezone) return;
    setExploring(true); setExplorationError(''); setExploration(null);
    try {
      const { exploreBirthDate } = await import('@/lib/birthDateExploration');
      setExploration(exploreBirthDate(profile.birthDate, profile.timezone));
      setExploredKey(profileKey);
    } catch (error) { setExplorationError(error instanceof Error ? error.message : 'Date exploration could not be completed.'); }
    finally { setExploring(false); }
  }
  const reducedMotion = useReducedMotion();
  const entry = atlasEntry(sign, house);
  const guidance = birthInputGuidance(profile);
  const personalPlacements = personalAtlasPlacements(profile?.astrologyData);
  const houseCusps = verifiedHouseCusps(profile?.astrologyData);
  const selectedPersonal = personalPlacements.find(row => row.key === selectedPersonalKey && row.house);
  const selectedMeaning = selectedPersonal?.house
    ? personalPlacementMeaning(selectedPersonal.key, selectedPersonal.sign as AtlasSign, selectedPersonal.house)
    : null;
  return <div className="sc-app-shell">
    <Navigation />
    <main className="sc-page mx-auto max-w-5xl pb-24">
      <Link href="/systems" className="sc-button-ghost">← Your underlying systems</Link>
      <header className="my-8 max-w-3xl">
        <p className="sc-eyebrow">Astrology Atlas · Learning guide</p>
        <h1 className="sc-display mt-4 text-4xl sm:text-6xl">A language for every part of life.</h1>
        <p className="sc-lede mt-5">Explore twelve signs through twelve houses. A planet describes a symbolic function, a sign its style, and a house the area of life where you explore it.</p>
      </header>
      <section className="sc-panel mb-6 p-5" aria-labelledby="input-guidance">
        <h2 id="input-guidance" className="text-xl font-semibold">{guidance.title}</h2>
        <p className="mt-3 leading-7 text-[var(--sc-stone)]">{guidance.detail}</p>
      </section>
      {personalPlacements.length > 0 && <section className="sc-panel mb-6 p-5" aria-labelledby="personal-atlas">
        <p className="sc-eyebrow">Verified Equal-house chart</p>
        <h2 id="personal-atlas" className="mt-3 font-serif text-3xl">Your personal Atlas</h2>
        <p className="mt-3 leading-7 text-[var(--sc-stone)]">These links come from your verified chart record. Open one to explore its symbolic sign-and-house combination. The geometry is verified under Soul Codex's Equal-house policy; the written meaning remains symbolic reflection.</p>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {personalPlacements.map(placement => <li key={placement.key}>
            <button type="button" aria-pressed={selectedPersonalKey === placement.key} onClick={() => { setSelectedPersonalKey(placement.key); setSign(placement.sign as AtlasSign); if (placement.house) setHouse(placement.house); }} className="w-full rounded-xl border border-[var(--sc-line)] p-4 text-left hover:border-[var(--sc-gold)] focus-visible:outline focus-visible:outline-2">
              <strong>{placement.label} in {placement.sign}{placement.house ? ` · House ${placement.house}` : ''}</strong>
              <p className="mt-1 text-xs text-[var(--sc-stone)]">Verified geometry · symbolic interpretation</p>
            </button>
          </li>)}
        </ul>
        {selectedPersonal && selectedMeaning && <article className="mt-5 rounded-2xl border border-[rgba(217,182,111,.22)] bg-white/[0.025] p-5" aria-live="polite">
          <h3 className="font-serif text-2xl">{selectedPersonal.label} in {selectedPersonal.sign} · House {selectedPersonal.house}</h3>
          <p className="mt-4 leading-7">{selectedMeaning.synthesis}</p>
          <dl className="mt-5 grid gap-4 sm:grid-cols-3">
            <div><dt className="font-semibold">What · {selectedPersonal.label}</dt><dd className="mt-1 text-sm leading-6 text-[var(--sc-stone)]">{selectedMeaning.what}</dd></div>
            <div><dt className="font-semibold">How · {selectedPersonal.sign}</dt><dd className="mt-1 text-sm leading-6 text-[var(--sc-stone)]">{selectedMeaning.how}</dd></div>
            <div><dt className="font-semibold">Where · House {selectedPersonal.house}</dt><dd className="mt-1 text-sm leading-6 text-[var(--sc-stone)]">{selectedMeaning.where}</dd></div>
          </dl>
          <h4 className="mt-5 font-semibold">Reflection question</h4><p className="mt-2 text-[var(--sc-stone)]">{selectedMeaning.question}</p>
          <h4 className="mt-5 font-semibold">Grounded practice</h4><p className="mt-2 text-[var(--sc-stone)]">{selectedMeaning.practice}</p>
        </article>}
        <details className="mt-5 rounded-xl border border-[var(--sc-line)] p-4">
          <summary className="cursor-pointer font-semibold">See all twelve verified cusp signs</summary>
          <ol className="mt-3 grid gap-2 sm:grid-cols-2">{houseCusps.map(cusp => <li key={cusp.house}>House {cusp.house}: {cusp.sign}</li>)}</ol>
        </details>
      </section>}
      <section className="sc-panel mb-6 p-5" aria-labelledby="date-exploration">
        <h2 id="date-exploration" className="font-serif text-2xl">What could stay the same without a birth time?</h2>
        <p className="mt-3 leading-7 text-[var(--sc-stone)]">Explore tropical planetary signs sampled every ten minutes across your local birth date. A single result means the sampled positions agree; it is not independent verification or proof that no change occurred between samples. Signs close to a boundary include the neighboring possibility.</p>
        <p className="mt-3 text-sm text-[var(--sc-stone)]">This runs on your device and does not change your saved reading. It cannot supply Rising, houses, Midheaven, or a Human Design result.</p>
        {profile?.birthDate && profile?.timezone ? <button type="button" disabled={exploring} onClick={explore} className="sc-button-primary mt-4">{exploring ? 'Exploring your birth date…' : 'Explore my birth date'}</button> : <p className="mt-4">Add a birth date and resolve the birthplace timezone to use this tool. You can still explore every Atlas entry below.</p>}
        {explorationError && <p role="alert" className="mt-3">{explorationError}</p>}
        {exploration && exploredKey === profileKey && <div className="mt-5" aria-live="polite">
          <p className="text-sm">Calculated possibilities · {exploration.samples} samples · {profile?.timezone}</p>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">{exploration.placements.map(p => <li key={p.body} className="rounded-xl border border-[var(--sc-line)] p-3"><strong>{p.body}</strong><p>{p.signs.join(' or ')}</p><p className="mt-1 text-xs text-[var(--sc-stone)]">{p.signs.length > 1 ? 'Birth time or boundary uncertainty matters' : 'Same sign at every sampled time; unverified'}</p></li>)}</ul>
        </div>}
      </section>
      <div className="grid gap-6 md:grid-cols-2">
        <section className="sc-panel p-5" aria-label="Choose a combination">
          <label htmlFor="atlas-sign" className="block font-semibold">Choose a sign</label>
          <select id="atlas-sign" value={sign} onChange={e => setSign(e.target.value as AtlasSign)} className="mt-3 min-h-12 w-full rounded-xl border border-[var(--sc-line)] bg-[var(--sc-bg,#100b19)] p-3">
            {ATLAS_SIGNS.map(value => <option key={value}>{value}</option>)}
          </select>
          <svg viewBox="0 0 320 320" role="img" aria-label={`Educational house wheel. House ${house} selected. This is not your natal chart.`} className="mx-auto my-4 w-full max-w-sm">
            <circle cx="160" cy="160" r="137" fill="none" stroke="var(--sc-line)" />
            {ATLAS_HOUSES.map((_, index) => {
              const a = Math.PI + index * Math.PI / 6;
              return <g key={index}><line x1="160" y1="160" x2={160+137*Math.cos(a)} y2={160-137*Math.sin(a)} stroke="var(--sc-line)" /><text x={160+111*Math.cos(a+Math.PI/12)} y={165-111*Math.sin(a+Math.PI/12)} textAnchor="middle" fill={house === index+1 ? 'var(--sc-gold-bright)' : 'var(--sc-stone)'} fontSize="15">{index+1}</text></g>;
            })}
            <motion.circle cx="160" cy="160" r="73" fill="var(--sc-bg,#100b19)" stroke="var(--sc-gold)" strokeDasharray="2 9" animate={{ rotate: (house-1)*30 }} transition={{ duration: reducedMotion ? 0 : 0.4 }} style={{ transformOrigin: '160px 160px' }} />
            <text x="160" y="157" textAnchor="middle" fill="var(--sc-ivory)" fontSize="19">{sign}</text>
            <text x="160" y="183" textAnchor="middle" fill="var(--sc-gold-bright)" fontSize="14">House {house}</text>
          </svg>
          <p className="mb-3 text-sm text-[var(--sc-stone)]">Choose a house. This diagram is an educational map, not calculated sky geometry.</p>
          <div className="grid grid-cols-4 gap-2">{ATLAS_HOUSES.map((area, index) => <button key={area.name} type="button" aria-pressed={house === index+1} aria-label={`House ${index+1}: ${area.name}`} onClick={() => setHouse(index+1)} className={`min-h-12 rounded-xl border p-2 focus-visible:outline focus-visible:outline-2 ${house === index+1 ? 'border-[var(--sc-gold)] bg-white/10' : 'border-[var(--sc-line)]'}`}>{index+1}</button>)}</div>
        </section>
        <motion.article key={`${sign}-${house}`} initial={reducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="sc-panel p-6" aria-live="polite" aria-atomic="true">
          <p className="sc-eyebrow">Symbolic exploration · Not a personal placement</p>
          <h2 className="mt-4 font-serif text-3xl">{entry.title}</h2>
          <p className="mt-2 text-[var(--sc-gold-bright)]">{ATLAS_HOUSES[house-1].name}</p>
          <p className="mt-6 leading-7">{entry.meaning}</p>
          {[['Possible strength',entry.gift],['A tension to notice',entry.tension],['Try this',entry.practice]].map(([title,body]) => <section key={title} className="mt-6"><h3 className="font-semibold text-[var(--sc-ivory)]">{title}</h3><p className="mt-2 leading-7 text-[var(--sc-stone)]">{body}</p></section>)}
        </motion.article>
      </div>
      <section className="sc-panel mt-6 p-6">
        <h2 className="font-serif text-2xl">A sign on a cusp is not a planet in a house.</h2>
        <p className="mt-3 leading-7 text-[var(--sc-stone)]">The cusp marks a house’s beginning. A planet can occupy that house in a different sign from the cusp. An empty house still has a place in the chart; it does not mean that area of life is absent. In Equal houses, the Midheaven need not coincide with the tenth-house cusp.</p>
        <p className="mt-3 leading-7 text-[var(--sc-stone)]">This guide presents symbolic traditions for reflection. Accurate astronomical positions do not establish personality traits or predict events.</p>
      </section>
    </main>
  </div>;
}
