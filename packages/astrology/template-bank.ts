import type { DailyContext } from './daily-context';

export interface TemplateVariation {
  id: string;
  category: 'numerology' | 'astrology' | 'humandesign' | 'personality' | 'chinese' | 'ayurveda' | 'vedic' | 'genekeys' | 'iching' | 'mayan' | 'chakras' | 'runes' | 'tarot' | 'kabbalah' | 'sacredgeom' | 'sabian' | 'biorhythms' | 'asteroids' | 'arabicparts' | 'fixedstars';
  template: (context: any) => string;
}

const numerologyTemplates: TemplateVariation[] = [
  {
    id: 'num-personal-1',
    category: 'numerology',
    template: (ctx) => `Personal Day ${ctx.personalDayNumber} is a deterministic symbolic cycle label. Use it as a prompt to choose one concrete action and compare the result with real evidence.`
  },
  {
    id: 'num-personal-2',
    category: 'numerology',
    template: (ctx) => `Today's Personal Day is ${ctx.personalDayNumber}. It does not predict events, mood, luck, or performance; use the number only as a structured reflection cue.`
  },
  {
    id: 'num-personal-3',
    category: 'numerology',
    template: (ctx) => `Reflection prompt for Personal Day ${ctx.personalDayNumber}: pick one decision, state the facts first, then ask whether the traditional number theme adds a useful perspective.`
  },
  {
    id: 'num-personal-4',
    category: 'numerology',
    template: (ctx) => `Personal Day ${ctx.personalDayNumber} preserves its numerology identity under the Soul Codex reduction policy. Keep any interpretation that helps reflection and discard what does not fit lived experience.`
  },
  {
    id: 'num-personal-5',
    category: 'numerology',
    template: (ctx) => `Use Personal Day ${ctx.personalDayNumber} as an experiment: choose one low-risk behavior to observe today instead of treating the cycle as a forecast.`
  },
  {
    id: 'num-personal-6',
    category: 'numerology',
    template: (ctx) => `Personal Day ${ctx.personalDayNumber} is calculated from calendar data, not measured from your psychology or environment. Let it suggest a question, not an answer.`
  },
  {
    id: 'num-personal-7',
    category: 'numerology',
    template: (ctx) => `Personal Day ${ctx.personalDayNumber}: symbolic timing only. Check decisions against consequences, constraints, and observed behavior before acting.`
  },
  {
    id: 'num-universal-1',
    category: 'numerology',
    template: (ctx) => `Universal Day ${ctx.universalDayNumber} is a shared symbolic calendar number. It is not a measurement of collective energy or a prediction for everyone.`
  },
  {
    id: 'num-universal-2',
    category: 'numerology',
    template: (ctx) => `Reflection prompt: compare Universal Day ${ctx.universalDayNumber} with what is actually happening around you; do not assume the number describes humanity's mood or events.`
  },
  {
    id: 'num-universal-3',
    category: 'numerology',
    template: (ctx) => `Universal Day ${ctx.universalDayNumber} can organize a daily reflection theme, but real-world conditions remain the evidence for decisions.`
  },
  {
    id: 'num-universal-4',
    category: 'numerology',
    template: (ctx) => `The Universal Day calculation is ${ctx.universalDayNumber}. Treat its traditional meaning as optional symbolism, not a collective force.`
  },
  {
    id: 'num-combined',
    category: 'numerology',
    template: (ctx) => `Personal Day ${ctx.personalDayNumber} and Universal Day ${ctx.universalDayNumber} are two deterministic symbolic labels. Compare their themes without treating the combination as a causal energy.`
  },
  {
    id: 'num-combined-2',
    category: 'numerology',
    template: (ctx) => `Today's Personal/Universal pair is ${ctx.personalDayNumber}/${ctx.universalDayNumber}. Use it to frame one reflection question, then test that question against observable facts.`
  },
  {
    id: 'num-combined-3',
    category: 'numerology',
    template: (ctx) => `Personal ${ctx.personalDayNumber} + Universal ${ctx.universalDayNumber}: symbolic comparison only. No event, opportunity, or collective state is implied by the pair.`
  },
];

const astrologyTemplates: TemplateVariation[] = [
  {
    id: 'astro-moon-1',
    category: 'astrology',
    template: (ctx) => `Measured sky context: the Moon is in ${ctx.moonSign} during the ${ctx.moonPhase}. Any personal meaning is optional astrological symbolism, not a mood or event prediction.`
  },
  {
    id: 'astro-moon-2',
    category: 'astrology',
    template: (ctx) => `The Moon's current sign is ${ctx.moonSign} and phase is ${ctx.moonPhase}. Use that geometry as a reflection anchor only where it matches lived experience.`
  },
  {
    id: 'astro-moon-3',
    category: 'astrology',
    template: (ctx) => `Current lunar position: ${ctx.moonSign}; phase: ${ctx.moonPhase}. This does not establish how you feel, what will happen, or what decision is correct.`
  },
  {
    id: 'astro-moon-4',
    category: 'astrology',
    template: (ctx) => `Reflection prompt: with the Moon in ${ctx.moonSign} at ${ctx.moonPhase}, notice one real situation first and use the symbolism only as a question about it.`
  },
  {
    id: 'astro-moon-5',
    category: 'astrology',
    template: (ctx) => `The ${ctx.moonPhase} Moon in ${ctx.moonSign} is astronomical context plus optional symbolic interpretation. Keep facts and symbolism separate.`
  },
  {
    id: 'astro-moon-6',
    category: 'astrology',
    template: (ctx) => `Moon in ${ctx.moonSign}: measured placement. ${ctx.moonPhase}: measured phase category. Personal interpretation remains a reflection layer, not evidence of behavior.`
  },
  {
    id: 'astro-moon-7',
    category: 'astrology',
    template: (ctx) => `Today's lunar geometry is ${ctx.moonSign} / ${ctx.moonPhase}. Use it to generate a reflection question, not to infer emotions, motives, luck, or outcomes.`
  },
  {
    id: 'astro-planetary-1',
    category: 'astrology',
    template: (ctx) => `Traditional planetary-hour label: ${ctx.planetaryHour}. Treat it as historical timing symbolism, not evidence that a planet governs this hour's events.`
  },
  {
    id: 'astro-planetary-2',
    category: 'astrology',
    template: (ctx) => `Planetary hour ${ctx.planetaryHour} is an optional traditional reflection label; it does not establish opportunity, mood, or causation.`
  },
  {
    id: 'astro-planetary-3',
    category: 'astrology',
    template: (ctx) => `If you use planetary-hour symbolism, ${ctx.planetaryHour} can frame a question to test against current facts rather than a prediction.`
  },
  {
    id: 'astro-planetary-4',
    category: 'astrology',
    template: (ctx) => `Planetary hour: ${ctx.planetaryHour}. Soul Codex treats this as symbolic timing only and does not infer behavior or outcomes from it.`
  },
  {
    id: 'astro-lunar-wisdom-1',
    category: 'astrology',
    template: (ctx) => `The Moon is about ${Math.round(ctx.moonPhasePercentage)}% illuminated in ${ctx.moonSign}. That percentage is astronomical data, not a measure of emotional intensity.`
  },
  {
    id: 'astro-lunar-wisdom-2',
    category: 'astrology',
    template: (ctx) => `Lunar illumination is about ${Math.round(ctx.moonPhasePercentage)}% with the Moon in ${ctx.moonSign}. Use any astrological meaning as optional reflection only.`
  },
];

const humanDesignTemplates: TemplateVariation[] = [
  {
    id: 'hd-gate-1',
    category: 'humandesign',
    template: (ctx) => `Current solar longitude maps to Human Design Gate ${ctx.currentHDGate}, Line ${ctx.currentHDLine}. The gate/line meaning is symbolic and does not predict behavior.`
  },
  {
    id: 'hd-gate-2',
    category: 'humandesign',
    template: (ctx) => `Human Design transit mapping: Gate ${ctx.currentHDGate}.${ctx.currentHDLine}. Use the traditional gate/line theme as a reflection prompt, not a causal influence.`
  },
  {
    id: 'hd-gate-3',
    category: 'humandesign',
    template: (ctx) => `The Sun currently maps to Gate ${ctx.currentHDGate}, Line ${ctx.currentHDLine} in the Human Design mandala. This is a deterministic mapping plus symbolic interpretation.`
  },
  {
    id: 'hd-gate-4',
    category: 'humandesign',
    template: (ctx) => `Reflection prompt: Gate ${ctx.currentHDGate}.${ctx.currentHDLine} is the current Human Design solar transit label. Check any theme against lived experience.`
  },
  {
    id: 'hd-gate-5',
    category: 'humandesign',
    template: (ctx) => `Current HD gate/line: ${ctx.currentHDGate}.${ctx.currentHDLine}. The mapping is calculated; claims about personality, decisions, or events are not implied.`
  },
  {
    id: 'hd-gate-6',
    category: 'humandesign',
    template: (ctx) => `Human Design solar transit ${ctx.currentHDGate}.${ctx.currentHDLine} can organize a reflection question, but it does not establish what you should do today.`
  },
  {
    id: 'hd-gate-7',
    category: 'humandesign',
    template: (ctx) => `Gate ${ctx.currentHDGate}, Line ${ctx.currentHDLine}: deterministic mandala position, optional symbolic meaning. Keep interpretation separate from observed behavior.`
  },
  {
    id: 'hd-gate-8',
    category: 'humandesign',
    template: (ctx) => `Solar longitude currently corresponds to Human Design Gate ${ctx.currentHDGate}.${ctx.currentHDLine}. Treat traditional meaning as reflection, not instruction.`
  },
  {
    id: 'hd-gate-9',
    category: 'humandesign',
    template: (ctx) => `Current Human Design transit label: Gate ${ctx.currentHDGate}, Line ${ctx.currentHDLine}. No "cosmic transmission" or behavioral effect is asserted.`
  },
  {
    id: 'hd-gate-10',
    category: 'humandesign',
    template: (ctx) => `Gate ${ctx.currentHDGate}.${ctx.currentHDLine} is today's calculated HD solar position. Use it only as a symbolic lens you can accept, reject, or test.`
  },
  {
    id: 'hd-gate-11',
    category: 'humandesign',
    template: (ctx) => `Human Design Gate ${ctx.currentHDGate}, Line ${ctx.currentHDLine} is active as a transit label in the mandala; Soul Codex does not treat that label as measured psychology.`
  },
];

const personalityTemplates: TemplateVariation[] = [
  {
    id: 'personality-combo-1',
    category: 'personality',
    template: (ctx) => `As a ${ctx.profile.hdType || 'being'} with ${ctx.profile.sunSign} Sun, ${getPersonalityAlignment(ctx)}.`
  },
  {
    id: 'personality-combo-2',
    category: 'personality',
    template: (ctx) => `Your ${ctx.profile.enneagramType || 'unique essence'} energy ${getPersonalityWithContext(ctx)}.`
  },
  {
    id: 'personality-combo-3',
    category: 'personality',
    template: (ctx) => `${ctx.profile.mbtiType || 'Your nature'} ${getPersonalityDayGuidance(ctx)}.`
  },
  {
    id: 'personality-combo-4',
    category: 'personality',
    template: (ctx) => `Your ${ctx.profile.sunSign} Sun harmonizes with your ${ctx.profile.hdType || 'unique'} design, ${getPersonalityAlignment(ctx)}.`
  },
  {
    id: 'personality-combo-5',
    category: 'personality',
    template: (ctx) => `${ctx.profile.mbtiType || 'Your cognitive pattern'} finds powerful expression through today's ${getPersonalityWithContext(ctx)}.`
  },
  {
    id: 'personality-combo-6',
    category: 'personality',
    template: (ctx) => `As ${ctx.profile.enneagramType || 'your core type'}, you're perfectly positioned to ${getPersonalityDayGuidance(ctx)}.`
  },
  {
    id: 'personality-combo-7',
    category: 'personality',
    template: (ctx) => `Your ${ctx.profile.hdType || 'energetic'} blueprint ${getPersonalityAlignment(ctx)} with ${ctx.profile.sunSign} Sun leading the way.`
  },
  {
    id: 'personality-combo-8',
    category: 'personality',
    template: (ctx) => `The intersection of your ${ctx.profile.mbtiType || 'personality'} and ${ctx.profile.enneagramType || 'core essence'} ${getPersonalityWithContext(ctx)}.`
  },
  {
    id: 'personality-combo-9',
    category: 'personality',
    template: (ctx) => `${ctx.profile.sunSign} energy flows through your ${ctx.profile.hdType || 'unique'} design—${getPersonalityDayGuidance(ctx)}.`
  },
  {
    id: 'personality-combo-10',
    category: 'personality',
    template: (ctx) => `Your ${ctx.profile.enneagramType || 'core motivation'} aligns powerfully with ${ctx.profile.mbtiType || 'your cognitive style'} today.`
  },
  {
    id: 'personality-combo-11',
    category: 'personality',
    template: (ctx) => `As a ${ctx.profile.hdType || 'being'} navigating with ${ctx.profile.mbtiType || 'your mind'}, ${getPersonalityAlignment(ctx)}.`
  },
  {
    id: 'personality-combo-12',
    category: 'personality',
    template: (ctx) => `Your ${ctx.profile.sunSign}-${ctx.profile.moonSign || 'Moon'} combo ${getPersonalityWithContext(ctx)} powerfully today.`
  },
];

// Chinese Astrology Templates
const chineseTemplates: TemplateVariation[] = [
  {
    id: 'chinese-1',
    category: 'chinese',
    template: (ctx) => `Your ${ctx.profile.chineseYear || 'Chinese zodiac'} energy ${getChineseYearWisdom(ctx.profile.chineseYear)} today${ctx.profile.chineseElement ? `, amplified by ${ctx.profile.chineseElement} element` : ''}.`
  },
  {
    id: 'chinese-2',
    category: 'chinese',
    template: (ctx) => `The ${ctx.profile.chineseYear || 'animal sign'} within you ${getChineseYearAction(ctx.profile.chineseYear)} under today's cosmic currents.`
  },
  {
    id: 'chinese-3',
    category: 'chinese',
    template: (ctx) => `${ctx.profile.chineseElement || 'Your elemental'} ${ctx.profile.chineseYear || 'nature'} ${getChineseElementGuidance(ctx.profile.chineseElement)} this cycle.`
  },
];

// Ayurveda Templates
const ayurvedaTemplates: TemplateVariation[] = [
  {
    id: 'ayurveda-1',
    category: 'ayurveda',
    template: (ctx) => `Your ${ctx.profile.primaryDosha || 'Ayurvedic'} constitution ${getAyurvedaBalance(ctx.profile.primaryDosha)} today. ${getAyurvedaGuidance(ctx.profile.primaryDosha)}`
  },
  {
    id: 'ayurveda-2',
    category: 'ayurveda',
    template: (ctx) => `${ctx.profile.primaryDosha || 'Your dominant dosha'} energy ${getAyurvedaVibe(ctx.profile.primaryDosha)} under today's influences.`
  },
  {
    id: 'ayurveda-3',
    category: 'ayurveda',
    template: (ctx) => `Balance your ${ctx.profile.primaryDosha || 'dosha'} by ${getAyurvedaPractice(ctx.profile.primaryDosha)} throughout the day.`
  },
];

// Vedic Astrology Templates
const vedicTemplates: TemplateVariation[] = [
  {
    id: 'vedic-1',
    category: 'vedic',
    template: (ctx) => `Your ${ctx.profile.moonNakshatra || 'lunar nakshatra'} ${getVedicMoonEnergy(ctx.profile.moonNakshatra)} with today's planetary movements.`
  },
  {
    id: 'vedic-2',
    category: 'vedic',
    template: (ctx) => `The wisdom of ${ctx.profile.moonNakshatra || 'your nakshatra'} ${getVedicMoonGuidance(ctx.profile.moonNakshatra)} this lunar cycle.`
  },
  {
    id: 'vedic-3',
    category: 'vedic',
    template: (ctx) => `${ctx.profile.vedicSun || 'Your Vedic Sun'} harmonizes with ${ctx.profile.vedicMoon || 'lunar energies'} ${getVedicAlignment()} today.`
  },
];

// Gene Keys Templates
const geneKeysTemplates: TemplateVariation[] = [
  {
    id: 'genekeys-1',
    category: 'genekeys',
    template: (ctx) => `Your Life's Work gift of ${ctx.profile.lifeWorkGift || 'divine purpose'} ${getGeneKeyExpression(ctx.profile.lifeWorkGift)} today.`
  },
  {
    id: 'genekeys-2',
    category: 'genekeys',
    template: (ctx) => `The genius of ${ctx.profile.evolutionGenius || 'your evolution'} ${getGeneKeyEvolution(ctx.profile.evolutionGenius)} this cycle.`
  },
  {
    id: 'genekeys-3',
    category: 'genekeys',
    template: (ctx) => `Express your ${ctx.profile.lifeWorkGift || 'unique gift'} through ${getGeneKeyPractice()} to unlock higher frequencies.`
  },
];

// I Ching Templates
const iChingTemplates: TemplateVariation[] = [
  {
    id: 'iching-1',
    category: 'iching',
    template: (ctx) => `Hexagram ${ctx.profile.iChingNumber || ''} ${ctx.profile.iChingName ? `(${ctx.profile.iChingName})` : 'guides you'} ${getIChingWisdom(ctx.profile.iChingName)} today.`
  },
  {
    id: 'iching-2',
    category: 'iching',
    template: (ctx) => `The essence of ${ctx.profile.iChingName || 'your I Ching hexagram'} ${getIChingGuidance(ctx.profile.iChingName)} in this moment.`
  },
  {
    id: 'iching-3',
    category: 'iching',
    template: (ctx) => `${ctx.profile.iChingName || 'Your hexagram'} teaches ${getIChingLesson(ctx.profile.iChingName)} through today's experiences.`
  },
];

// Mayan Astrology Templates
const mayanTemplates: TemplateVariation[] = [
  {
    id: 'mayan-1',
    category: 'mayan',
    template: (ctx) => `Your ${ctx.profile.mayanDaySign || 'Mayan day sign'} ${getMayanEnergy(ctx.profile.mayanDaySign)} with Tone ${ctx.profile.mayanTone || ''} vibration.`
  },
  {
    id: 'mayan-2',
    category: 'mayan',
    template: (ctx) => `The ${ctx.profile.mayanDaySign || 'sacred sign'} within you ${getMayanPurpose(ctx.profile.mayanDaySign)} today's cosmic timing.`
  },
];

// Chakra Templates
const chakraTemplates: TemplateVariation[] = [
  {
    id: 'chakra-1',
    category: 'chakras',
    template: (ctx) => `Your ${ctx.profile.dominantChakra || 'primary chakra'} ${getChakraEnergy(ctx.profile.dominantChakra)} powerfully today.`
  },
  {
    id: 'chakra-2',
    category: 'chakras',
    template: (ctx) => `Channel energy through your ${ctx.profile.dominantChakra || 'dominant energy center'} ${getChakraPractice(ctx.profile.dominantChakra)}.`
  },
];

// Runes Templates
const runesTemplates: TemplateVariation[] = [
  {
    id: 'runes-1',
    category: 'runes',
    template: (ctx) => `The ${ctx.profile.birthRune || 'rune'} carries ${getRuneWisdom(ctx.profile.birthRune)} into your day.`
  },
  {
    id: 'runes-2',
    category: 'runes',
    template: (ctx) => `${ctx.profile.birthRune || 'Your birth rune'} whispers ${getRuneMessage(ctx.profile.birthRune)} through today's unfolding.`
  },
];

// Tarot Templates
const tarotTemplates: TemplateVariation[] = [
  {
    id: 'tarot-1',
    category: 'tarot',
    template: (ctx) => `The ${ctx.profile.tarotCard || 'Tarot card'} of your soul ${getTarotWisdom(ctx.profile.tarotCard)} this cycle.`
  },
  {
    id: 'tarot-2',
    category: 'tarot',
    template: (ctx) => `${ctx.profile.tarotCard || 'Your birth card'} reveals ${getTarotGuidance(ctx.profile.tarotCard)} in today's journey.`
  },
];

// Kabbalah Templates
const kabbalahTemplates: TemplateVariation[] = [
  {
    id: 'kabbalah-1',
    category: 'kabbalah',
    template: (ctx) => `Your Kabbalistic path of ${ctx.profile.kabbalisticPath || 'sacred wisdom'} ${getKabbalahWisdom(ctx.profile.kabbalisticPath)} today.`
  },
  {
    id: 'kabbalah-2',
    category: 'kabbalah',
    template: (ctx) => `The Tree of Life flows through ${ctx.profile.kabbalisticPath || 'your path'}, ${getKabbalahGuidance(ctx.profile.kabbalisticPath)}.`
  },
];

// Sacred Geometry Templates
const sacredGeomTemplates: TemplateVariation[] = [
  {
    id: 'sacredgeom-1',
    category: 'sacredgeom',
    template: (ctx) => `The ${ctx.profile.primaryShape || 'sacred pattern'} ${getSacredGeomEnergy(ctx.profile.primaryShape)} in your energy field today.`
  },
  {
    id: 'sacredgeom-2',
    category: 'sacredgeom',
    template: (ctx) => `Your ${ctx.profile.primaryShape || 'geometric blueprint'} ${getSacredGeomWisdom(ctx.profile.primaryShape)} divine order.`
  },
];

// Sabian Symbols Templates
const sabianTemplates: TemplateVariation[] = [
  {
    id: 'sabian-1',
    category: 'sabian',
    template: (ctx) => `Your Sun's Sabian Symbol ${ctx.profile.sabianSun ? `"${ctx.profile.sabianSun}"` : ''} ${getSabianWisdom()} today.`
  },
  {
    id: 'sabian-2',
    category: 'sabian',
    template: (ctx) => `The Moon's Sabian Symbol ${ctx.profile.sabianMoon ? `"${ctx.profile.sabianMoon}"` : ''} ${getSabianGuidance()} through your emotions.`
  },
];

// Biorhythms Templates
const biorhythmsTemplates: TemplateVariation[] = [
  {
    id: 'biorhythms-1',
    category: 'biorhythms',
    template: (ctx) => `Your biorhythms ${getBiorhythmsEnergy()} today${ctx.profile.physicalPeakDay ? `, with physical peak on day ${ctx.profile.physicalPeakDay}` : ''}.`
  },
  {
    id: 'biorhythms-2',
    category: 'biorhythms',
    template: (ctx) => `Life rhythms ${getBiorhythmsGuidance()} through your physical, emotional, and intellectual cycles.`
  },
];

// Asteroids Templates
const asteroidsTemplates: TemplateVariation[] = [
  {
    id: 'asteroids-1',
    category: 'asteroids',
    template: (ctx) => `${ctx.profile.keyAsteroid || 'Key asteroid placements'} ${getAsteroidsEnergy(ctx.profile.keyAsteroid)} nuanced depth to your chart.`
  },
  {
    id: 'asteroids-2',
    category: 'asteroids',
    template: (ctx) => `The asteroid ${ctx.profile.keyAsteroid || 'influences'} ${getAsteroidsWisdom()} through subtle cosmic currents.`
  },
];

// Arabic Parts Templates
const arabicPartsTemplates: TemplateVariation[] = [
  {
    id: 'arabicparts-1',
    category: 'arabicparts',
    template: (ctx) => `Part of Fortune${ctx.profile.fortuneSign ? ` in ${ctx.profile.fortuneSign}` : ''} ${getArabicPartsWisdom()} today's opportunities.`
  },
  {
    id: 'arabicparts-2',
    category: 'arabicparts',
    template: (ctx) => `Part of Spirit${ctx.profile.spiritSign ? ` in ${ctx.profile.spiritSign}` : ''} ${getArabicPartsGuidance()} your higher purpose.`
  },
];

// Fixed Stars Templates
const fixedStarsTemplates: TemplateVariation[] = [
  {
    id: 'fixedstars-1',
    category: 'fixedstars',
    template: (ctx) => `${ctx.profile.primaryStar || 'Fixed star influences'} ${getFixedStarsEnergy(ctx.profile.primaryStar)} ancient stellar wisdom.`
  },
  {
    id: 'fixedstars-2',
    category: 'fixedstars',
    template: (ctx) => `The fixed star ${ctx.profile.primaryStar || 'connections'} ${getFixedStarsWisdom()} timeless cosmic power.`
  },
];

function getPersonalDayTheme(num: number): string {
  const themes: Record<number, string> = {
    1: 'new beginnings and bold action',
    2: 'cooperation and patience',
    3: 'creativity and self-expression',
    4: 'structure and foundation-building',
    5: 'freedom and adventure',
    6: 'responsibility and harmony',
    7: 'introspection and spiritual insight',
    8: 'power and material success',
    9: 'completion and release',
    11: 'spiritual illumination and intuition',
    22: 'master building and practical magic',
    33: 'compassionate service and healing',
  };
  return themes[num] || 'unique opportunities';
}

function getPersonalDayAction(num: number): string {
  const actions: Record<number, string> = {
    1: 'Take initiative on something you\'ve been postponing.',
    2: 'Listen deeply and collaborate with others.',
    3: 'Express yourself creatively without holding back.',
    4: 'Focus on practical matters and long-term planning.',
    5: 'Embrace change and try something new.',
    6: 'Nurture relationships and create beauty.',
    7: 'Spend time in solitude for spiritual connection.',
    8: 'Pursue your ambitions with confidence.',
    9: 'Let go of what no longer serves you.',
    11: 'Trust your intuition and inspire others.',
    22: 'Work on projects that benefit the greater good.',
    33: 'Offer your gifts in service to others.',
  };
  return actions[num] || 'Follow your inner guidance.';
}

function getPersonalDayVibe(num: number): string {
  const vibes: Record<number, string> = {
    1: 'empowers you to lead and initiate',
    2: 'asks for patience and diplomatic connection',
    3: 'sparks your creative fire and joy',
    4: 'grounds you in practical reality',
    5: 'ignites your adventurous spirit',
    6: 'centers you in love and service',
    7: 'opens portals to inner wisdom',
    8: 'aligns you with abundance and authority',
    9: 'completes cycles and clears space',
    11: 'illuminates your spiritual path',
    22: 'activates your master builder frequency',
    33: 'channels divine compassion through you',
  };
  return vibes[num] || 'brings unique energy to your path';
}

function getUniversalDayTheme(num: number): string {
  const themes: Record<number, string> = {
    1: 'independence and new beginnings',
    2: 'partnership and balance',
    3: 'communication and joy',
    4: 'hard work and stability',
    5: 'change and freedom',
    6: 'love and responsibility',
    7: 'wisdom and reflection',
    8: 'achievement and power',
    9: 'compassion and endings',
    11: 'inspiration and enlightenment',
    22: 'manifestation and vision',
    33: 'healing and divine service',
  };
  return themes[num] || 'collective growth';
}

function getUniversalDayGuidance(num: number): string {
  const guidance: Record<number, string> = {
    1: 'The world favors pioneers and risk-takers today.',
    2: 'Collective harmony grows through cooperation.',
    3: 'Share your voice—the world needs your message.',
    4: 'Build foundations that will last generations.',
    5: 'Liberation and progress move through humanity.',
    6: 'Acts of love ripple across consciousness.',
    7: 'Truth seekers find answers in stillness.',
    8: 'Material and spiritual power unite.',
    9: 'Humanity releases old patterns collectively.',
    11: 'Intuitive downloads are heightened globally.',
    22: 'Visionary projects gain momentum.',
    33: 'Healing energy flows through all beings.',
  };
  return guidance[num] || 'The cosmos supports collective evolution.';
}

function getUniversalDayVibe(num: number): string {
  const vibes: Record<number, string> = {
    1: 'calls everyone to step into their power',
    2: 'invites harmony and balance worldwide',
    3: 'lifts the collective mood with creativity',
    4: 'anchors stability across all realms',
    5: 'breaks chains and opens doors globally',
    6: 'centers the world in heart energy',
    7: 'draws humanity inward for reflection',
    8: 'magnifies success and manifestation',
    9: 'brings closure to collective chapters',
    11: 'elevates spiritual awareness everywhere',
    22: 'empowers master builders and visionaries',
    33: 'bathes the world in healing light',
  };
  return vibes[num] || 'shapes the collective energy field';
}

function getCombinedDayEnergy(personal: number, universal: number): string {
  const combinations = [
    'a powerful synergy for manifestation',
    'dynamic tension that sparks growth',
    'harmonious flow between inner and outer',
    'creative friction that births innovation',
    'balanced energy for aligned action',
    'amplified potential in both realms',
    'complementary forces dancing together',
    'unified purpose across dimensions',
    'sacred alignment of personal and collective',
    'potent alchemy for transformation',
  ];
  const index = (personal + universal) % combinations.length;
  return combinations[index];
}

function getMoonSignEnergy(sign: string): string {
  const energies: Record<string, string> = {
    'Aries': 'ignites emotional courage and spontaneity',
    'Taurus': 'grounds feelings in sensory pleasure',
    'Gemini': 'quickens mental connections and curiosity',
    'Cancer': 'deepens emotional sensitivity and nurturing',
    'Leo': 'amplifies heart-centered expression',
    'Virgo': 'refines emotional discernment',
    'Libra': 'seeks harmony in all connections',
    'Scorpio': 'intensifies emotional depth and transformation',
    'Sagittarius': 'expands emotional horizons',
    'Capricorn': 'structures feelings with wisdom',
    'Aquarius': 'liberates emotions with objectivity',
    'Pisces': 'dissolves boundaries with compassion',
  };
  return energies[sign] || 'brings unique emotional frequency';
}

function getMoonPhaseGuidance(phase: string): string {
  const guidance: Record<string, string> = {
    'New Moon': 'Plant seeds for new intentions.',
    'Waxing Crescent': 'Take small steps toward your goals.',
    'First Quarter': 'Push through resistance with determination.',
    'Waxing Gibbous': 'Refine and adjust your approach.',
    'Full Moon': 'Celebrate manifestations and release what\'s complete.',
    'Waning Gibbous': 'Share wisdom gained from recent experiences.',
    'Last Quarter': 'Let go of what no longer aligns.',
    'Waning Crescent': 'Rest and surrender to the void.',
  };
  return guidance[phase] || 'Honor this lunar transition.';
}

function getMoonPhaseVibe(phase: string): string {
  const vibes: Record<string, string> = {
    'New Moon': 'opens portals for fresh starts',
    'Waxing Crescent': 'builds momentum with faith',
    'First Quarter': 'challenges you to commit fully',
    'Waxing Gibbous': 'perfects your manifestation',
    'Full Moon': 'illuminates all that is hidden',
    'Waning Gibbous': 'asks for gratitude and sharing',
    'Last Quarter': 'clears space through release',
    'Waning Crescent': 'whispers of rest and renewal',
  };
  return vibes[phase] || 'marks this lunar moment';
}

function getMoonSignAction(sign: string): string {
  const actions: Record<string, string> = {
    'Aries': 'Act on your instincts boldly.',
    'Taurus': 'Savor simple pleasures mindfully.',
    'Gemini': 'Engage in stimulating conversations.',
    'Cancer': 'Create emotional safety for yourself and others.',
    'Leo': 'Step into the spotlight with confidence.',
    'Virgo': 'Organize your space and thoughts.',
    'Libra': 'Strengthen connections through beauty and balance.',
    'Scorpio': 'Dive deep into emotional truth.',
    'Sagittarius': 'Explore new philosophies or places.',
    'Capricorn': 'Set boundaries with compassionate authority.',
    'Aquarius': 'Connect with your community and ideals.',
    'Pisces': 'Surrender to creative flow and spiritual connection.',
  };
  return actions[sign] || 'Align with this lunar energy.';
}

function getMoonCombinedMessage(sign: string, phase: string): string {
  return `emotions flow through ${sign}'s lens during this ${phase}, creating unique opportunities for ${getMoonSignEnergy(sign).split(' ')[1] || 'growth'}`;
}

function getPlanetaryHourEnergy(planet: string): string {
  const energies: Record<string, string> = {
    'Sun': 'radiating vitality, success, and recognition',
    'Moon': 'nurturing intuition, emotions, and receptivity',
    'Mars': 'activating courage, action, and assertion',
    'Mercury': 'sharpening communication, learning, and commerce',
    'Jupiter': 'expanding opportunities, wisdom, and abundance',
    'Venus': 'attracting love, beauty, and harmony',
    'Saturn': 'strengthening discipline, structure, and mastery',
  };
  return energies[planet] || 'bringing planetary influence';
}

function getPlanetaryHourAction(planet: string): string {
  const actions: Record<string, string> = {
    'Sun': 'Shine your light on important projects.',
    'Moon': 'Trust your feelings and nurture connections.',
    'Mars': 'Take decisive action on pending matters.',
    'Mercury': 'Communicate clearly and learn something new.',
    'Jupiter': 'Seize opportunities for growth.',
    'Venus': 'Beautify your surroundings or strengthen relationships.',
    'Saturn': 'Commit to long-term goals with discipline.',
  };
  return actions[planet] || 'Work with this planetary frequency.';
}

function getPlanetaryHourVibe(planet: string): string {
  const vibes: Record<string, string> = {
    'Sun': 'success and recognition come more easily',
    'Moon': 'emotional intelligence guides your way',
    'Mars': 'warrior energy fuels your actions',
    'Mercury': 'mental clarity sharpens your perception',
    'Jupiter': 'luck and expansion favor your efforts',
    'Venus': 'grace and beauty infuse your experiences',
    'Saturn': 'wisdom and endurance strengthen your path',
  };
  return vibes[planet] || 'this hour carries special power';
}

function getHDGateMessage(gate: number, line: number): string {
  return `This energy ${getHDGateEnergy(gate)} ${getHDLineTheme(line)}.`;
}

function getHDGateEnergy(gate: number): string {
  const gateThemes: Record<number, string> = {
    1: 'calls you to express your unique creativity',
    2: 'invites receptivity and direction from the universe',
    3: 'marks the beginning of new orders',
    4: 'seeks answers through mental clarity',
    5: 'teaches patience through waiting',
    6: 'navigates emotional intimacy',
    7: 'empowers democratic leadership',
    8: 'encourages authentic contribution',
  };
  return gateThemes[gate] || `brings Gate ${gate}'s unique frequency`;
}

function getHDGateName(gate: number): string {
  const names: Record<number, string> = {
    1: 'Self-Expression',
    2: 'Direction of the Self',
    3: 'Ordering',
    4: 'Mental Solutions',
    5: 'Fixed Patterns',
    6: 'Friction',
    7: 'The Role of the Self',
    8: 'Contribution',
  };
  return names[gate] || `Gate ${gate}`;
}

function getHDGateGuidance(gate: number): string {
  const guidance: Record<number, string> = {
    1: 'Your creative impulse is the universe speaking through you.',
    2: 'Wait for the right direction before moving forward.',
    3: 'New beginnings emerge from apparent chaos.',
    4: 'The answer you seek is already within you.',
    5: 'Trust the timing of your life.',
    6: 'Intimacy requires vulnerability and honesty.',
    7: 'Lead by example, not by force.',
    8: 'Your unique gifts are needed now.',
  };
  return guidance[gate] || 'Trust this cosmic transmission.';
}

function getHDLineTheme(line: number): string {
  const themes: Record<number, string> = {
    1: 'through introspection and investigation',
    2: 'through natural talent and ease',
    3: 'through experimentation and discovery',
    4: 'through networking and friendship',
    5: 'through practical solutions and heresy',
    6: 'through wisdom and role-modeling',
  };
  return themes[line] || `with Line ${line} energy`;
}

function getPersonalityAlignment(ctx: any): string {
  return `today's cosmic weather aligns powerfully with your natural design`;
}

function getPersonalityWithContext(ctx: any): string {
  return `finds resonance with today's numerological and astrological currents`;
}

function getPersonalityDayGuidance(ctx: any): string {
  return `can leverage today's energy by staying true to your authentic expression`;
}

// Chinese Astrology Helpers
function getChineseYearWisdom(animal: string): string {
  const wisdom: Record<string, string> = {
    'Rat': 'brings resourcefulness and quick adaptability',
    'Ox': 'grounds you in steadfast determination',
    'Tiger': 'ignites courageous action',
    'Rabbit': 'invites gentle diplomacy',
    'Dragon': 'empowers with bold vision',
    'Snake': 'deepens intuitive wisdom',
    'Horse': 'channels dynamic freedom',
    'Goat': 'nurtures creative harmony',
    'Monkey': 'sparks clever innovation',
    'Rooster': 'sharpens confident expression',
    'Dog': 'strengthens loyal integrity',
    'Pig': 'enriches generous abundance',
  };
  return wisdom[animal] || 'carries ancient wisdom';
}

function getChineseYearAction(animal: string): string {
  return 'aligns powerfully with your natural strengths';
}

function getChineseElementGuidance(element: string): string {
  const guidance: Record<string, string> = {
    'Wood': 'grows and expands',
    'Fire': 'transforms and illuminates',
    'Earth': 'stabilizes and nourishes',
    'Metal': 'refines and strengthens',
    'Water': 'flows and adapts',
  };
  return guidance[element] || 'harmonizes';
}

// Ayurveda Helpers
function getAyurvedaBalance(dosha: string): string {
  const balance: Record<string, string> = {
    'Vata': 'seeks grounding and warmth',
    'Pitta': 'needs cooling and moderation',
    'Kapha': 'benefits from stimulation and movement',
  };
  return balance[dosha] || 'seeks balance';
}

function getAyurvedaGuidance(dosha: string): string {
  const guidance: Record<string, string> = {
    'Vata': 'Embrace routine and nourishing warmth.',
    'Pitta': 'Cool your fire with gentle practices.',
    'Kapha': 'Energize with movement and variety.',
  };
  return guidance[dosha] || 'Honor your unique constitution.';
}

function getAyurvedaVibe(dosha: string): string {
  return 'finds harmony with mindful practices';
}

function getAyurvedaPractice(dosha: string): string {
  const practices: Record<string, string> = {
    'Vata': 'grounding meditation and warm foods',
    'Pitta': 'cooling breathwork and gentle movement',
    'Kapha': 'invigorating exercise and light meals',
  };
  return practices[dosha] || 'honoring your natural rhythm';
}

// Vedic Astrology Helpers
function getVedicMoonEnergy(nakshatra: string): string {
  return 'illuminates your emotional landscape';
}

function getVedicMoonGuidance(nakshatra: string): string {
  return 'whispers ancient lunar wisdom';
}

function getVedicAlignment(): string {
  return 'creating powerful synergy';
}

// Gene Keys Helpers
function getGeneKeyExpression(gift: string): string {
  return 'seeks authentic expression';
}

function getGeneKeyEvolution(genius: string): string {
  return 'unfolds through conscious awareness';
}

function getGeneKeyPractice(): string {
  return 'contemplation and embodiment';
}

// I Ching Helpers
function getIChingWisdom(name: string): string {
  return 'with timeless wisdom';
}

function getIChingGuidance(name: string): string {
  return 'offers guidance for navigating change';
}

function getIChingLesson(name: string): string {
  return 'the art of flowing with natural rhythms';
}

// Mayan Astrology Helpers
function getMayanEnergy(sign: string): string {
  return 'activates sacred purpose';
}

function getMayanPurpose(sign: string): string {
  return 'dances with';
}

// Chakra Helpers
function getChakraEnergy(chakra: string): string {
  const energies: Record<string, string> = {
    'Root': 'grounds your foundation',
    'Sacral': 'ignites creative flow',
    'Solar Plexus': 'empowers your will',
    'Heart': 'opens compassionate connection',
    'Throat': 'liberates authentic voice',
    'Third Eye': 'awakens intuitive sight',
    'Crown': 'connects cosmic consciousness',
  };
  return energies[chakra] || 'channels vital energy';
}

function getChakraPractice(chakra: string): string {
  return 'to amplify your energy field';
}

// Runes Helpers
function getRuneWisdom(rune: string): string {
  return 'ancient Norse wisdom';
}

function getRuneMessage(rune: string): string {
  return 'guidance from ancestral knowing';
}

// Tarot Helpers
function getTarotWisdom(card: string): string {
  return 'reflects archetypal truths';
}

function getTarotGuidance(card: string): string {
  return 'deep symbolic meaning';
}

// Kabbalah Helpers
function getKabbalahWisdom(path: string): string {
  return 'illuminates sacred mysteries';
}

function getKabbalahGuidance(path: string): string {
  return 'revealing divine wisdom';
}

// Sacred Geometry Helpers
function getSacredGeomEnergy(shape: string): string {
  const energies: Record<string, string> = {
    'Circle': 'represents wholeness and unity',
    'Triangle': 'channels manifestation power',
    'Square': 'anchors stability and structure',
    'Pentagon': 'harmonizes natural order',
    'Hexagon': 'connects heaven and earth',
    'Spiral': 'spirals evolutionary growth',
    'Flower of Life': 'seeds infinite creation',
    'Metatron\'s Cube': 'holds universal blueprints',
  };
  return energies[shape] || 'resonates with divine proportion';
}

function getSacredGeomWisdom(shape: string): string {
  return 'reflects';
}

// Sabian Symbols Helpers
function getSabianWisdom(): string {
  return 'carries symbolic guidance';
}

function getSabianGuidance(): string {
  return 'speaks';
}

// Biorhythms Helpers
function getBiorhythmsEnergy(): string {
  return 'flow through natural cycles';
}

function getBiorhythmsGuidance(): string {
  return 'pulse';
}

// Asteroids Helpers
function getAsteroidsEnergy(asteroid: string): string {
  return 'adds';
}

function getAsteroidsWisdom(): string {
  return 'weaves';
}

// Arabic Parts Helpers
function getArabicPartsWisdom(): string {
  return 'illuminates';
}

function getArabicPartsGuidance(): string {
  return 'guides';
}

// Fixed Stars Helpers
function getFixedStarsEnergy(star: string): string {
  return 'carries';
}

function getFixedStarsWisdom(): string {
  return 'channels';
}

export function selectTemplates(
  dailyContext: DailyContext,
  profileData: any,
  lastUsedIds: string[] = []
): { selectedTemplates: TemplateVariation[]; templateIds: string[] } {
  const eligibleAstrologyTemplates = dailyContext.planetaryHour
    ? astrologyTemplates
    : astrologyTemplates.filter((template) => !template.id.startsWith('astro-planetary-'));

  // Daily Insights may draw only from currently governed, directly computed
  // daily systems. Registry-disabled identity systems and unverified profile
  // combinations are deliberately excluded from rotation.
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

  // First take one from each governed category so the daily card is balanced.
  for (let i = 0; i < shuffledCategories.length; i += 1) {
    const category = shuffledCategories[i];
    const fullPool = governedByCategory[category];
    const unused = fullPool.filter((template) => !lastUsedIds.includes(template.id));
    const options = unused.length > 0 ? unused : fullPool;
    if (options.length === 0) continue;
    selected.push(options[(seed + i * 17) % options.length]);
  }

  // Add a fourth item from the governed pool only.
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
