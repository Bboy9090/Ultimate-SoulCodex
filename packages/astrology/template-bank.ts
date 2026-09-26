import type { DailyContext } from './daily-context';

export interface TemplateVariation {
  id: string;
  category: 'numerology' | 'astrology' | 'humandesign';
  template: (context: any) => string;
}

const PERSONAL_DAY_REFLECTIONS: Record<number, { theme: string; action: string }> = {
  1: { theme: 'initiative and beginnings', action: 'choose one first step you can complete today' },
  2: { theme: 'cooperation and pacing', action: 'improve one conversation by listening before responding' },
  3: { theme: 'expression and creativity', action: 'make or communicate one thing clearly instead of scattering attention' },
  4: { theme: 'structure and follow-through', action: 'finish one practical task or tighten one routine' },
  5: { theme: 'adaptability and change', action: 'test one flexible alternative without creating avoidable chaos' },
  6: { theme: 'care and responsibility', action: 'support someone or something without taking on a duty that is not yours' },
  7: { theme: 'reflection and inquiry', action: 'protect a short block of quiet time to examine one question carefully' },
  8: { theme: 'resources and execution', action: 'make one concrete decision about time, money, authority, or priorities' },
  9: { theme: 'completion and perspective', action: 'close, release, or summarize one thing that no longer needs more energy' },
  11: { theme: 'inspiration and heightened perspective', action: 'capture one useful insight and translate it into a grounded next step' },
  22: { theme: 'large-scale building and implementation', action: 'turn one big idea into a small piece of executable structure' },
  33: { theme: 'teaching, care, and service', action: 'help in one specific way that preserves both compassion and boundaries' },
};

const MOON_SIGN_REFLECTIONS: Record<string, string> = {
  Aries: 'Where would direct action help, and where would speed create unnecessary friction?',
  Taurus: 'What would become steadier if you simplified the pace or protected a useful routine?',
  Gemini: 'Which conversation, question, or piece of information deserves clearer attention?',
  Cancer: 'What needs care, privacy, or emotional context before you react?',
  Leo: 'Where can you express yourself clearly without turning recognition into the goal?',
  Virgo: 'What small correction, skill, or practical detail would genuinely improve the situation?',
  Libra: 'What needs balancing, and what decision is being delayed in the name of keeping peace?',
  Scorpio: 'What requires honesty, depth, stronger boundaries, or a willingness to face what is uncomfortable?',
  Sagittarius: 'What larger perspective is useful, and what assumption needs checking before you act on it?',
  Capricorn: 'What responsibility, limit, or long-term objective deserves a concrete next step?',
  Aquarius: 'What would improve if you stepped outside the usual pattern and looked at the system itself?',
  Pisces: 'What needs imagination or compassion, and what needs firmer reality-testing or boundaries?',
};

export function personalDayReflection(number: number): { theme: string; action: string } {
  return PERSONAL_DAY_REFLECTIONS[number] ?? {
    theme: 'structured reflection',
    action: 'choose one observable behavior to test rather than treating the number as a forecast',
  };
}

export function moonSignReflection(sign: string): string {
  return MOON_SIGN_REFLECTIONS[sign] ??
    'What real situation today could benefit from a different question or perspective?';
}

const numerologyTemplates: TemplateVariation[] = [
  {
    id: 'num-personal-1',
    category: 'numerology',
    template: (ctx) => `Personal Day ${ctx.personalDayNumber} is a deterministic symbolic cycle label. Traditional theme: ${personalDayReflection(ctx.personalDayNumber).theme}. Try this as a reflection experiment: ${personalDayReflection(ctx.personalDayNumber).action}, then compare the result with real evidence.`,
  },
  {
    id: 'num-personal-2',
    category: 'numerology',
    template: (ctx) => `Today's Personal Day is ${ctx.personalDayNumber}. It does not predict events, mood, luck, or performance; use the number only as a structured reflection cue.`,
  },
  {
    id: 'num-personal-3',
    category: 'numerology',
    template: (ctx) => `Reflection prompt for Personal Day ${ctx.personalDayNumber}: ${personalDayReflection(ctx.personalDayNumber).theme}. State the facts first, then ask whether ${personalDayReflection(ctx.personalDayNumber).action} would improve the situation.`,
  },
  {
    id: 'num-personal-4',
    category: 'numerology',
    template: (ctx) => `Personal Day ${ctx.personalDayNumber} preserves its numerology identity under the Soul Codex reduction policy. Keep any interpretation that helps reflection and discard what does not fit lived experience.`,
  },
  {
    id: 'num-personal-5',
    category: 'numerology',
    template: (ctx) => `Use Personal Day ${ctx.personalDayNumber} as an experiment around ${personalDayReflection(ctx.personalDayNumber).theme}: ${personalDayReflection(ctx.personalDayNumber).action}. Treat the result—not the number—as the evidence.`,
  },
  {
    id: 'num-personal-6',
    category: 'numerology',
    template: (ctx) => `Personal Day ${ctx.personalDayNumber} is calculated from calendar data, not measured from your psychology or environment. Let it suggest a question, not an answer.`,
  },
  {
    id: 'num-personal-7',
    category: 'numerology',
    template: (ctx) => `Personal Day ${ctx.personalDayNumber}: symbolic timing only. Check decisions against consequences, constraints, and observed behavior before acting.`,
  },
  {
    id: 'num-universal-1',
    category: 'numerology',
    template: (ctx) => `Universal Day ${ctx.universalDayNumber} is a shared symbolic calendar number. It is not a measurement of collective energy or a prediction for everyone.`,
  },
  {
    id: 'num-universal-2',
    category: 'numerology',
    template: (ctx) => `Reflection prompt: compare Universal Day ${ctx.universalDayNumber} with what is actually happening around you; do not assume the number describes humanity's mood or events.`,
  },
  {
    id: 'num-universal-3',
    category: 'numerology',
    template: (ctx) => `Universal Day ${ctx.universalDayNumber} can organize a daily reflection theme, but real-world conditions remain the evidence for decisions.`,
  },
  {
    id: 'num-universal-4',
    category: 'numerology',
    template: (ctx) => `The Universal Day calculation is ${ctx.universalDayNumber}. Treat its traditional meaning as optional symbolism, not a collective force.`,
  },
  {
    id: 'num-combined',
    category: 'numerology',
    template: (ctx) => `Personal Day ${ctx.personalDayNumber} and Universal Day ${ctx.universalDayNumber} are two deterministic symbolic labels. Compare their themes without treating the combination as a causal energy.`,
  },
  {
    id: 'num-combined-2',
    category: 'numerology',
    template: (ctx) => `Today's Personal/Universal pair is ${ctx.personalDayNumber}/${ctx.universalDayNumber}. Use it to frame one reflection question, then test that question against observable facts.`,
  },
  {
    id: 'num-combined-3',
    category: 'numerology',
    template: (ctx) => `Personal ${ctx.personalDayNumber} + Universal ${ctx.universalDayNumber}: symbolic comparison only. No event, opportunity, or collective state is implied by the pair.`,
  },
];

const astrologyTemplates: TemplateVariation[] = [
  {
    id: 'astro-moon-1',
    category: 'astrology',
    template: (ctx) => `Measured sky context: the Moon is in ${ctx.moonSign} during the ${ctx.moonPhase}. Optional reflection question: ${moonSignReflection(ctx.moonSign)} This is symbolism, not a mood or event prediction.`,
  },
  {
    id: 'astro-moon-2',
    category: 'astrology',
    template: (ctx) => `The Moon's current sign is ${ctx.moonSign} and phase is ${ctx.moonPhase}. Use that geometry as a reflection anchor only where it matches lived experience.`,
  },
  {
    id: 'astro-moon-3',
    category: 'astrology',
    template: (ctx) => `Current lunar position: ${ctx.moonSign}; phase: ${ctx.moonPhase}. This does not establish how you feel, what will happen, or what decision is correct.`,
  },
  {
    id: 'astro-moon-4',
    category: 'astrology',
    template: (ctx) => `Reflection prompt: with the Moon in ${ctx.moonSign} at ${ctx.moonPhase}, start with one real situation. ${moonSignReflection(ctx.moonSign)} Keep the answer grounded in what is actually happening.`,
  },
  {
    id: 'astro-moon-5',
    category: 'astrology',
    template: (ctx) => `The ${ctx.moonPhase} Moon in ${ctx.moonSign} is astronomical context plus optional symbolic interpretation. Keep facts and symbolism separate.`,
  },
  {
    id: 'astro-moon-6',
    category: 'astrology',
    template: (ctx) => `Moon in ${ctx.moonSign}: measured placement. ${ctx.moonPhase}: measured phase category. Personal interpretation remains a reflection layer, not evidence of behavior.`,
  },
  {
    id: 'astro-moon-7',
    category: 'astrology',
    template: (ctx) => `Today's lunar geometry is ${ctx.moonSign} / ${ctx.moonPhase}. ${moonSignReflection(ctx.moonSign)} Use the question for reflection, not to infer emotions, motives, luck, or outcomes.`,
  },
  {
    id: 'astro-planetary-1',
    category: 'astrology',
    template: (ctx) => `Traditional planetary-hour label: ${ctx.planetaryHour}. Treat it as historical timing symbolism, not evidence that a planet governs this hour's events.`,
  },
  {
    id: 'astro-planetary-2',
    category: 'astrology',
    template: (ctx) => `Planetary hour ${ctx.planetaryHour} is an optional traditional reflection label; it does not establish opportunity, mood, or causation.`,
  },
  {
    id: 'astro-planetary-3',
    category: 'astrology',
    template: (ctx) => `If you use planetary-hour symbolism, ${ctx.planetaryHour} can frame a question to test against current facts rather than a prediction.`,
  },
  {
    id: 'astro-planetary-4',
    category: 'astrology',
    template: (ctx) => `Planetary hour: ${ctx.planetaryHour}. Soul Codex treats this as symbolic timing only and does not infer behavior or outcomes from it.`,
  },
  {
    id: 'astro-lunar-wisdom-1',
    category: 'astrology',
    template: (ctx) => `The Moon is about ${Math.round(ctx.moonPhasePercentage)}% illuminated in ${ctx.moonSign}. That percentage is astronomical data, not a measure of emotional intensity.`,
  },
  {
    id: 'astro-lunar-wisdom-2',
    category: 'astrology',
    template: (ctx) => `Lunar illumination is about ${Math.round(ctx.moonPhasePercentage)}% with the Moon in ${ctx.moonSign}. Use any astrological meaning as optional reflection only.`,
  },
];

const humanDesignTemplates: TemplateVariation[] = [
  {
    id: 'hd-gate-1',
    category: 'humandesign',
    template: (ctx) => `Current solar longitude maps to Human Design Gate ${ctx.currentHDGate}, Line ${ctx.currentHDLine}. The gate/line meaning is symbolic and does not predict behavior.`,
  },
  {
    id: 'hd-gate-2',
    category: 'humandesign',
    template: (ctx) => `Human Design transit mapping: Gate ${ctx.currentHDGate}.${ctx.currentHDLine}. Use the traditional gate/line theme as a reflection prompt, not a causal influence.`,
  },
  {
    id: 'hd-gate-3',
    category: 'humandesign',
    template: (ctx) => `The Sun currently maps to Gate ${ctx.currentHDGate}, Line ${ctx.currentHDLine} in the Human Design mandala. This is a deterministic mapping plus symbolic interpretation.`,
  },
  {
    id: 'hd-gate-4',
    category: 'humandesign',
    template: (ctx) => `Reflection prompt: Gate ${ctx.currentHDGate}.${ctx.currentHDLine} is the current Human Design solar transit label. Check any theme against lived experience.`,
  },
  {
    id: 'hd-gate-5',
    category: 'humandesign',
    template: (ctx) => `Current HD gate/line: ${ctx.currentHDGate}.${ctx.currentHDLine}. The mapping is calculated; claims about personality, decisions, or events are not implied.`,
  },
  {
    id: 'hd-gate-6',
    category: 'humandesign',
    template: (ctx) => `Human Design solar transit ${ctx.currentHDGate}.${ctx.currentHDLine} can organize a reflection question, but it does not establish what you should do today.`,
  },
  {
    id: 'hd-gate-7',
    category: 'humandesign',
    template: (ctx) => `Gate ${ctx.currentHDGate}, Line ${ctx.currentHDLine}: deterministic mandala position, optional symbolic meaning. Keep interpretation separate from observed behavior.`,
  },
  {
    id: 'hd-gate-8',
    category: 'humandesign',
    template: (ctx) => `Solar longitude currently corresponds to Human Design Gate ${ctx.currentHDGate}.${ctx.currentHDLine}. Treat traditional meaning as reflection, not instruction.`,
  },
  {
    id: 'hd-gate-9',
    category: 'humandesign',
    template: (ctx) => `Current Human Design transit label: Gate ${ctx.currentHDGate}, Line ${ctx.currentHDLine}. No "cosmic transmission" or behavioral effect is asserted.`,
  },
  {
    id: 'hd-gate-10',
    category: 'humandesign',
    template: (ctx) => `Gate ${ctx.currentHDGate}.${ctx.currentHDLine} is today's calculated HD solar position. Use it only as a symbolic lens you can accept, reject, or test.`,
  },
  {
    id: 'hd-gate-11',
    category: 'humandesign',
    template: (ctx) => `Human Design Gate ${ctx.currentHDGate}, Line ${ctx.currentHDLine} is active as a transit label in the mandala; Soul Codex does not treat that label as measured psychology.`,
  },
];


function stableStringHash(value: unknown): number {
  const text =
    typeof value === 'string' || typeof value === 'number'
      ? String(value)
      : '';

  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash >>> 0;
}

export function selectTemplates(
  dailyContext: DailyContext,
  profileData: any,
  lastUsedIds: string[] = [],
): { selectedTemplates: TemplateVariation[]; templateIds: string[] } {
  const eligibleAstrologyTemplates = dailyContext.planetaryHour
    ? astrologyTemplates
    : astrologyTemplates.filter((template) => !template.id.startsWith('astro-planetary-'));

  const humanDesign = profileData?.humanDesignData;
  const hasVerifiedPersonalHumanDesign =
    humanDesign?.status === 'verified' &&
    typeof humanDesign?.verificationReceiptId === 'string' &&
    humanDesign.verificationReceiptId.trim().length > 0 &&
    typeof humanDesign?.independentSource === 'string' &&
    humanDesign.independentSource.trim().length > 0 &&
    typeof humanDesign?.verifiedAt === 'string' &&
    humanDesign.verifiedAt.trim().length > 0;

  // Daily guidance is intentionally selective. Astrology supplies measured sky
  // context, numerology supplies deterministic calendar symbolism, and Human
  // Design enters the personalized mix only when the user's natal HD core is
  // independently verified. We do not add extra systems merely to make the
  // reading look larger.
  const governedByCategory: Record<string, TemplateVariation[]> = {
    astrology: eligibleAstrologyTemplates,
    numerology: numerologyTemplates,
    ...(hasVerifiedPersonalHumanDesign ? { humandesign: humanDesignTemplates } : {}),
  };

  const dateSeed = parseInt(dailyContext.date.replace(/-/g, ''), 10);
  const profileSeed = stableStringHash(profileData?.id);
  const seed = (dateSeed ^ profileSeed) >>> 0;

  const categories = Object.keys(governedByCategory);
  const shuffledCategories = [...categories].sort((a, b) => {
    const hashA = (a.charCodeAt(0) * seed) % 1000;
    const hashB = (b.charCodeAt(0) * seed) % 1000;
    return hashA - hashB;
  });

  const selected: TemplateVariation[] = [];

  for (let i = 0; i < shuffledCategories.length; i += 1) {
    const category = shuffledCategories[i];
    const fullPool = governedByCategory[category];
    const unused = fullPool.filter((template) => !lastUsedIds.includes(template.id));
    const options = unused.length > 0 ? unused : fullPool;
    if (options.length === 0) continue;
    selected.push(options[(seed + i * 17) % options.length]);
  }

  return {
    selectedTemplates: selected,
    templateIds: selected.map((template) => template.id),
  };
}

