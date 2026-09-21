/** Original educational content. Browsing a combination never establishes a natal placement. */
export const ATLAS_SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'] as const;
export type AtlasSign = typeof ATLAS_SIGNS[number];
export const PLANET_FUNCTIONS: Record<string, { function: string; question: string }> = {
  sun: { function: 'identity, vitality, and the direction of conscious growth', question: 'What am I learning to stand behind?' },
  moon: { function: 'emotional needs, instinctive responses, and ways of restoring safety', question: 'What helps me settle and feel held?' },
  mercury: { function: 'perception, language, learning, and the exchange of information', question: 'How do I make sense of what I notice?' },
  venus: { function: 'attraction, values, affection, pleasure, and relational taste', question: 'What do I value and how do I invite closeness?' },
  mars: { function: 'assertion, pursuit, desire, conflict, and the use of effort', question: 'How do I go after what matters and protect a boundary?' },
  jupiter: { function: 'growth, confidence, meaning, opportunity, and expanded perspective', question: 'Where do I grow by trusting a larger possibility?' },
  saturn: { function: 'limits, responsibility, discipline, fear, and earned authority', question: 'What becomes stronger through patience and accountability?' },
  uranus: { function: 'independence, disruption, experimentation, and awakening', question: 'Where must I make room for a truer form of freedom?' },
  neptune: { function: 'imagination, ideals, sensitivity, longing, and blurred boundaries', question: 'Where do inspiration and projection need to be distinguished?' },
  pluto: { function: 'power, compulsion, loss, renewal, and deep transformation', question: 'Where am I asked to face what control cannot solve?' },
  northNode: { function: 'a symbolic direction of unfamiliar development', question: 'Which stretch may broaden my familiar way of operating?' },
  southNode: { function: 'a symbolic pattern of familiarity and practiced instinct', question: 'Which strength can support me without running the whole life?' },
  chiron: { function: 'a symbolic theme of sensitivity, repair, and hard-won understanding', question: 'Where might care grow from meeting a tender edge honestly?' },
};
const styles: Record<AtlasSign, { approach: string; gift: string; tension: string; practice: string }> = {
  Aries: { approach: 'direct action, initiative, and a willingness to begin', gift: 'courage to act before every answer is available', tension: 'urgency can crowd out listening', practice: 'pause long enough to ask who else is affected' },
  Taurus: { approach: 'steadiness, sensory awareness, and gradual investment', gift: 'patience that turns a promise into something dependable', tension: 'protecting stability can become resistance to needed change', practice: 'choose one small adjustment that preserves what matters' },
  Gemini: { approach: 'curiosity, conversation, and trying more than one perspective', gift: 'finding language and options where others see a dead end', tension: 'collecting possibilities can replace making a choice', practice: 'turn one useful question into a concrete next step' },
  Cancer: { approach: 'emotional memory, care, and attention to belonging', gift: 'noticing the conditions that help people feel safe', tension: 'protectiveness can become indirectness or withdrawal', practice: 'name a need plainly instead of expecting it to be sensed' },
  Leo: { approach: 'creative expression, warmth, and personal investment', gift: 'bringing vitality and generosity to a shared experience', tension: 'recognition can become the measure of whether an effort matters', practice: 'offer something meaningful without making applause the goal' },
  Virgo: { approach: 'discernment, practical service, and careful refinement', gift: 'making a complicated situation more workable', tension: 'constant improvement can make enough feel unreachable', practice: 'define a useful stopping point before beginning the task' },
  Libra: { approach: 'dialogue, proportion, and attention to reciprocity', gift: 'making room for different needs without abandoning fairness', tension: 'avoiding disagreement can obscure a real preference', practice: 'state your own position before searching for agreement' },
  Scorpio: { approach: 'depth, privacy, and close attention to trust', gift: 'staying present when a situation calls for honesty and change', tension: 'self-protection can turn uncertainty into suspicion', practice: 'separate what you observed from what you fear it means' },
  Sagittarius: { approach: 'exploration, meaning, and a wider perspective', gift: 'seeing possibilities beyond an immediate setback', tension: 'conviction can outrun detail or another person’s experience', practice: 'test a big idea against one specific lived example' },
  Capricorn: { approach: 'structure, responsibility, and sustained effort', gift: 'building something that can carry weight over time', tension: 'achievement can become a condition for feeling worthy', practice: 'set a boundary around what is actually your responsibility' },
  Aquarius: { approach: 'independent thought, experimentation, and collective concerns', gift: 'imagining arrangements that serve more than familiar interests', tension: 'distance can protect an idea at the expense of connection', practice: 'ask how an abstract principle feels to the person beside you' },
  Pisces: { approach: 'imagination, sensitivity, and openness to experience', gift: 'recognizing nuance that a rigid explanation can miss', tension: 'empathy can blur the line between caring and taking everything on', practice: 'give a compassionate intention a clear practical boundary' },
};
export const ATLAS_HOUSES = [
  { name: 'Presence & beginnings', domain: 'self-presentation, embodiment, and first responses', question: 'How do I enter an unfamiliar situation?', action: 'Notice the first move you make when meeting someone new.' },
  { name: 'Resources & values', domain: 'personal resources, possessions, and what feels worth protecting', question: 'What does enough mean to me?', action: 'Choose one use of your time or money that reflects a stated value.' },
  { name: 'Learning & conversation', domain: 'everyday communication, learning, and the nearby environment', question: 'How do I exchange information?', action: 'Ask a clarifying question before assuming you understand.' },
  { name: 'Home & roots', domain: 'home, family history, and private foundations', question: 'What helps me feel at home?', action: 'Make one small change that makes your private space more supportive.' },
  { name: 'Play & expression', domain: 'creative expression, enjoyment, and playful romance', question: 'What do I make when nobody is grading it?', action: 'Spend a few minutes creating or playing without a performance goal.' },
  { name: 'Routines & care', domain: 'daily work, habits, service, and the practical care of life', question: 'Which routine supports me and which drains me?', action: 'Simplify one recurring task so it is easier to sustain.' },
  { name: 'Partnership & agreements', domain: 'one-to-one relationships, cooperation, and explicit agreements', question: 'How do I balance my needs with another person’s?', action: 'Clarify one expectation with a partner or collaborator.' },
  { name: 'Trust & shared resources', domain: 'intimacy, shared resources, vulnerability, and change', question: 'What must be discussed before I share responsibility?', action: 'Put one shared boundary or obligation into clear words.' },
  { name: 'Perspective & exploration', domain: 'beliefs, advanced learning, travel, and the search for meaning', question: 'Which assumption deserves a wider view?', action: 'Read a thoughtful account from a perspective different from your own.' },
  { name: 'Vocation & public role', domain: 'public responsibilities, reputation, and long-term contribution', question: 'What do I want my work to stand for?', action: 'Choose a next step that serves your contribution rather than only your image.' },
  { name: 'Community & aspirations', domain: 'friendships, groups, collective projects, and future hopes', question: 'Where can I contribute without disappearing into the group?', action: 'Offer a specific contribution to a group you value.' },
  { name: 'Solitude & reflection', domain: 'rest, retreat, private reflection, and patterns outside immediate awareness', question: 'What becomes audible when I slow down?', action: 'Protect a short period of quiet without turning it into another task.' },
] as const;
export function atlasEntry(sign: AtlasSign, house: number) {
  if (!ATLAS_SIGNS.includes(sign) || !Number.isInteger(house) || house < 1 || house > 12) throw new RangeError('Choose a zodiac sign and a house from 1 to 12.');
  const style = styles[sign], area = ATLAS_HOUSES[house - 1];
  return {
    title: `${sign} · House ${house}`,
    meaning: `In this symbolic combination, ${sign} brings ${style.approach} to ${area.domain}.`,
    gift: `A possible strength is ${style.gift}, especially when navigating ${area.domain}.`,
    tension: `A question to explore in this area: ${style.tension}. This is a reflection prompt, not a prediction or a diagnosis.`,
    practice: `When considering “${area.question}”, ${style.practice}. ${area.action}`,
  };
}
export function personalPlacementMeaning(body: string, sign: AtlasSign, house: number) {
  const planet = PLANET_FUNCTIONS[body];
  if (!planet) throw new RangeError('Choose a supported planet or point.');
  const entry = atlasEntry(sign, house);
  const area = ATLAS_HOUSES[house - 1];
  return {
    what: `${planet.function}.`,
    how: `${sign} describes a style of ${styles[sign].approach}.`,
    where: `House ${house} brings attention to ${area.domain}.`,
    synthesis: `Symbolically, ${titleBody(body)} in ${sign} in House ${house} explores ${planet.function} through ${styles[sign].approach}, within ${area.domain}.`,
    question: `${planet.question} ${area.question}`,
    practice: entry.practice,
  };
}

function titleBody(value: string): string {
  if (value === 'northNode') return 'North Node';
  if (value === 'southNode') return 'South Node';
  return value.charAt(0).toUpperCase() + value.slice(1);
}
export function birthInputGuidance(profile: { birthDate?: string; birthTime?: string; birthTimeStatus?: string; timezone?: string } | null) {
  if (!profile?.birthDate) return { title: 'Explore before you know your chart', detail: 'All 144 combinations are available as a learning guide. Add your birth date to begin a personal profile; nothing selected here is saved as your natal placement.' };
  if (profile.birthTimeStatus === 'unknown' || !/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(profile.birthTime ?? '')) return { title: 'Your birth time can stay unknown', detail: 'Keep using your saved reading, date-based numerology, and this complete learning guide. Personal Rising, houses, and Midheaven need a reliable birth time. We do not substitute noon or guess them from personality. A time-window calculation is needed before identifying planetary signs that remain stable throughout your birth date.' };
  if (!profile.timezone) return { title: 'Resolve your birthplace timezone', detail: 'The recorded clock time needs the timezone at your birthplace. The timezone on your current device is not a substitute. Until this is resolved, explore the guide without treating its combinations as personal placements.' };
  return { title: 'Keep calculation and interpretation distinct', detail: 'Your birth inputs support a timed chart. Verify the chart before treating a house or angle as personal. Equal, Porphyry, Placidus, and Whole Sign are different house conventions; comparisons need the same birth inputs and house system.' };
}
