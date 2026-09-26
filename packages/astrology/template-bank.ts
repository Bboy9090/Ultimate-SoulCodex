import type { DailyContext } from './daily-context';

export interface TemplateVariation {
  id: string;
  category: 'numerology' | 'astrology' | 'humandesign';
  template: (context: any) => string;
}

const numerologyTemplates: TemplateVariation[] = [
  {
    id: 'num-personal-1',
    category: 'numerology',
    template: (ctx) => `Personal Day ${ctx.personalDayNumber} is a deterministic symbolic cycle label. Use it as a prompt to choose one concrete action and compare the result with real evidence.`,
  },
  {
    id: 'num-personal-2',
    category: 'numerology',
    template: (ctx) => `Today's Personal Day is ${ctx.personalDayNumber}. It does not predict events, mood, luck, or performance; use the number only as a structured reflection cue.`,
  },
  {
    id: 'num-personal-3',
    category: 'numerology',
    template: (ctx) => `Reflection prompt for Personal Day ${ctx.personalDayNumber}: pick one decision, state the facts first, then ask whether the traditional number theme adds a useful perspective.`,
  },
  {
    id: 'num-personal-4',
    category: 'numerology',
    template: (ctx) => `Personal Day ${ctx.personalDayNumber} preserves its numerology identity under the Soul Codex reduction policy. Keep any interpretation that helps reflection and discard what does not fit lived experience.`,
  },
  {
    id: 'num-personal-5',
    category: 'numerology',
    template: (ctx) => `Use Personal Day ${ctx.personalDayNumber} as an experiment: choose one low-risk behavior to observe today instead of treating the cycle as a forecast.`,
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
    template: (ctx) => `Measured sky context: the Moon is in ${ctx.moonSign} during the ${ctx.moonPhase}. Any personal meaning is optional astrological symbolism, not a mood or event prediction.`,
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
    template: (ctx) => `Reflection prompt: with the Moon in ${ctx.moonSign} at ${ctx.moonPhase}, notice one real situation first and use the symbolism only as a question about it.`,
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
    template: (ctx) => `Today's lunar geometry is ${ctx.moonSign} / ${ctx.moonPhase}. Use it to generate a reflection question, not to infer emotions, motives, luck, or outcomes.`,
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

export function selectTemplates(
  dailyContext: DailyContext,
  profileData: any,
  lastUsedIds: string[] = [],
): { selectedTemplates: TemplateVariation[]; templateIds: string[] } {
  const eligibleAstrologyTemplates = dailyContext.planetaryHour
    ? astrologyTemplates
    : astrologyTemplates.filter((template) => !template.id.startsWith('astro-planetary-'));

  const governedByCategory: Record<string, TemplateVariation[]> = {
    numerology: numerologyTemplates,
    astrology: eligibleAstrologyTemplates,
    humandesign: humanDesignTemplates,
  };

  const seed =
    parseInt(dailyContext.date.replace(/-/g, ''), 10) +
    (profileData.id ? String(profileData.id).charCodeAt(0) : 0);

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

  const allGoverned = categories.flatMap((category) => governedByCategory[category]);
  const unusedGoverned = allGoverned.filter((template) => !lastUsedIds.includes(template.id));
  const fourthPool = unusedGoverned.length > 0 ? unusedGoverned : allGoverned;
  if (fourthPool.length > 0) {
    const candidate = fourthPool[(seed + 53) % fourthPool.length];
    if (!selected.some((template) => template.id === candidate.id)) {
      selected.push(candidate);
    }
  }

  return {
    selectedTemplates: selected.slice(0, 4),
    templateIds: selected.slice(0, 4).map((template) => template.id),
  };
}
