type InsightData = {
  title: string
  subtitle?: string
  layer1: { items: { label: string; value: string }[] }
  layer2?: string
  layer3?: { label: string; value: string }[]
}

const SIGN_ELEMENT: Record<string, string> = {
  Aries: "Fire", Taurus: "Earth", Gemini: "Air", Cancer: "Water",
  Leo: "Fire", Virgo: "Earth", Libra: "Air", Scorpio: "Water",
  Sagittarius: "Fire", Capricorn: "Earth", Aquarius: "Air", Pisces: "Water",
}

const SIGN_MODE: Record<string, string> = {
  Aries: "Cardinal", Taurus: "Fixed", Gemini: "Mutable", Cancer: "Cardinal",
  Leo: "Fixed", Virgo: "Mutable", Libra: "Cardinal", Scorpio: "Fixed",
  Sagittarius: "Mutable", Capricorn: "Cardinal", Aquarius: "Fixed", Pisces: "Mutable",
}

const PLANET_MEANING: Record<string, { role: string; question: string }> = {
  Sun: { role: "Core identity and drive", question: "Who am I at my most authentic?" },
  Moon: { role: "Emotional processing and needs", question: "What do I need to feel safe?" },
  Mercury: { role: "Thinking and communication style", question: "How does my mind work?" },
  Venus: { role: "Connection and values", question: "How do I love and what do I value?" },
  Mars: { role: "Action and conflict style", question: "How do I fight, compete, and pursue?" },
  Jupiter: { role: "Growth and expansion", question: "Where do I seek meaning?" },
  Saturn: { role: "Discipline and limitations", question: "Where must I build mastery?" },
}

const SIGN_TRAITS: Record<string, { drive: string; strength: string; risk: string; tip: string; deep: string }> = {
  Aries: { drive: "Direct and initiating", strength: "You act fast when others hesitate", risk: "Impatience can burn opportunities before they develop", tip: "Count to ten before the impulse becomes a decision", deep: "Aries energy initiates. Combined with any planet, it adds urgency, directness, and a bias toward action over deliberation. The shadow is burning out before the work compounds." },
  Taurus: { drive: "Steady and resource-building", strength: "You create stability others depend on", risk: "Resistance to change can become a trap", tip: "Distinguish between healthy consistency and fear of the unknown", deep: "Taurus energy stabilizes. It builds slowly, values tangible results, and resists disruption. The shadow is mistaking rigidity for strength, especially when the situation has already changed." },
  Gemini: { drive: "Curious and information-driven", strength: "You connect ideas across domains faster than most", risk: "Scattered focus dilutes impact", tip: "Finish one thought before starting three more", deep: "Gemini energy gathers and connects. It processes through language, variety, and mental stimulation. The shadow is mistaking breadth for depth — knowing about everything but mastering nothing." },
  Cancer: { drive: "Protective and emotionally motivated", strength: "You defend people and values you care about", risk: "Emotional reactions can override rational assessment", tip: "Pause before reacting to emotional triggers", deep: "Cancer energy protects. It operates through emotional intelligence, loyalty, and intuitive caregiving. The shadow is absorbing other people's pain as your own responsibility and losing boundaries in the process." },
  Leo: { drive: "Creative and recognition-seeking", strength: "You bring warmth and confidence to any room", risk: "Needing validation can compromise authenticity", tip: "Create for the work itself, not the applause", deep: "Leo energy creates and performs. It needs to be seen, appreciated, and recognized for genuine contribution. The shadow is performing for approval instead of expressing truth." },
  Virgo: { drive: "Analytical and improvement-focused", strength: "You notice what others miss and refine it", risk: "Over-analysis can paralyze action", tip: "Set a deadline for perfection — then ship", deep: "Virgo energy refines. It notices flaws, inefficiencies, and opportunities for improvement that others accept as normal. The shadow is turning that precision inward and never feeling ready enough." },
  Libra: { drive: "Balanced and relationship-oriented", strength: "You find the fair answer in any conflict", risk: "Avoiding confrontation builds hidden resentment", tip: "Speak the uncomfortable truth before it becomes a crisis", deep: "Libra energy harmonizes. It seeks fairness, beauty, and partnership. The shadow is sacrificing your own position to maintain peace, until the resentment forces an eruption." },
  Scorpio: { drive: "Intense and truth-seeking", strength: "You see through surfaces to what's actually happening", risk: "Control instincts can push people away", tip: "Not everything hidden is a threat — sometimes people are just slow to reveal themselves", deep: "Scorpio energy investigates. It goes deep, holds intensity, and refuses superficiality. The shadow is interpreting every ambiguity as betrayal and holding onto pain longer than it teaches." },
  Sagittarius: { drive: "Expansive and meaning-seeking", strength: "You find hope and possibility where others see dead ends", risk: "Chasing the next horizon can mean never landing", tip: "Stay with depth long enough for it to compound", deep: "Sagittarius energy expands. It seeks meaning, adventure, and philosophical understanding. The shadow is using optimism as avoidance — running toward the next experience instead of sitting with what the current one is teaching." },
  Capricorn: { drive: "Disciplined and legacy-building", strength: "You build things that last through sheer persistence", risk: "Measuring worth only by output leads to emptiness", tip: "Rest is not laziness — it's maintenance for the machine", deep: "Capricorn energy structures. It builds through discipline, patience, and long-term strategy. The shadow is defining yourself entirely by achievement and experiencing rest as failure." },
  Aquarius: { drive: "Independent and systems-thinking", strength: "You see how things should work before others catch up", risk: "Emotional detachment can feel cold to people who need warmth", tip: "Show people you care in their language, not yours", deep: "Aquarius energy innovates. It questions defaults, designs alternatives, and values independence of thought. The shadow is prioritizing ideas over people and detaching when emotional presence is what's actually needed." },
  Pisces: { drive: "Intuitive and boundary-dissolving", strength: "You feel the room before anyone speaks", risk: "Absorbing everyone's emotions without a filter", tip: "Ask: is this feeling mine? If not, let it pass through", deep: "Pisces energy absorbs. It feels everything — beauty, pain, potential — without natural filters. The shadow is losing yourself in other people's emotional states and confusing their needs with your own." },
}

const LP_INSIGHT: Record<number, { theme: string; strength: string; risk: string; tip: string; deep: string }> = {
  1: { theme: "Independence and pioneering", strength: "Self-reliance and original thinking", risk: "Interpreting help as weakness", tip: "Ask for support — it's not surrender, it's strategy", deep: "Life Path 1 drives self-reliance. The core lesson is learning to lead without isolating, and to pioneer without dismissing the people who want to walk with you." },
  2: { theme: "Partnership and sensitivity", strength: "Emotional intelligence and diplomatic skill", risk: "Losing yourself in other people's needs", tip: "Your needs are data too — don't ignore them", deep: "Life Path 2 drives cooperation. The core lesson is learning to support without disappearing, and to be sensitive without absorbing everyone's weight." },
  3: { theme: "Expression and creativity", strength: "Communication and creative output", risk: "Scattering energy across too many outlets", tip: "Pick one creative thread and follow it to completion", deep: "Life Path 3 drives expression. The core lesson is learning to channel creativity into form — not just inspiration, but finished work that others can receive." },
  4: { theme: "Structure and foundation", strength: "Building systems that last", risk: "Rigidity disguised as discipline", tip: "Bend the structure before it breaks you", deep: "Life Path 4 drives construction. The core lesson is building something real — not for speed or recognition, but because you need to create order from chaos." },
  5: { theme: "Freedom and experience", strength: "Adaptability and experiential learning", risk: "Restlessness mistaken for growth", tip: "Depth requires staying — not just experiencing", deep: "Life Path 5 drives freedom. The core lesson is learning that real freedom comes from mastery, not from running. Experience teaches, but only if you stay long enough to absorb the lesson." },
  6: { theme: "Responsibility and service", strength: "Nurturing and healing instinct", risk: "Taking responsibility for problems that aren't yours", tip: "Compassion without self-sacrifice is the real skill", deep: "Life Path 6 drives service. The core lesson is learning to care deeply without carrying the world. Your gift is healing — but you can't pour from an empty container." },
  7: { theme: "Analysis and truth-seeking", strength: "Intellectual depth and pattern recognition", risk: "Trusting data more than people", tip: "Some truths are felt, not proven — make room for both", deep: "Life Path 7 drives investigation. The core lesson is learning to trust people as much as you trust data, and to accept that some answers arrive through experience, not analysis." },
  8: { theme: "Power and material mastery", strength: "Strategic thinking and resource management", risk: "Conflating net worth with self-worth", tip: "Build power that serves something larger than yourself", deep: "Life Path 8 drives mastery over the material world. The core lesson is learning that money, influence, and achievement are tools — not identity. What you build with them is what matters." },
  9: { theme: "Legacy and humanitarian purpose", strength: "Big-picture thinking and emotional range", risk: "Holding onto things past their expiration", tip: "Letting go is not losing — it's completing", deep: "Life Path 9 drives completion and service. The core lesson is learning to release what's finished — relationships, projects, identities — so that what comes next has room to arrive." },
  11: { theme: "Intuition and visionary insight", strength: "Seeing what others can't yet perceive", risk: "Overwhelm from sensing too much", tip: "Ground the vision into one actionable step", deep: "Life Path 11 is a master number. The core lesson is learning to translate intuitive downloads into grounded action without losing the vision in the translation." },
  22: { theme: "Master building and large-scale impact", strength: "Turning impossible visions into real structures", risk: "The pressure of potential can become paralysis", tip: "Build one brick at a time — the scale will come", deep: "Life Path 22 is the master builder. The core lesson is learning that massive impact is built through incremental discipline, not dramatic gestures." },
  33: { theme: "Master teaching and uplifting", strength: "Teaching through lived example", risk: "Sacrificing personal life for others' growth", tip: "You teach best from fullness, not depletion", deep: "Life Path 33 is the master teacher. The core lesson is learning that your example is your teaching — people learn from what you do, not what you say." },
}

const HD_INSIGHT: Record<string, { drive: string; strength: string; risk: string; tip: string; deep: string }> = {
  Manifestor: { drive: "Initiate and inform", strength: "You start things without waiting for permission", risk: "Moving without informing alienates the people you need", tip: "Tell people what you're about to do — not for permission, but for peace", deep: "Manifestors initiate cycles. Their energy is designed to start, not sustain. The key mechanic is informing — not asking permission, but keeping others in the loop so the initiation doesn't create unnecessary resistance." },
  Generator: { drive: "Respond and sustain", strength: "Sustained energy when the work excites you", risk: "Saying yes out of obligation drains your core resource", tip: "Your gut response is your authority — trust it", deep: "Generators have sustainable life force energy, but only for work that genuinely excites them. The key mechanic is waiting to respond — not initiating, but waiting for something to show up and checking if the gut says yes." },
  "Manifesting Generator": { drive: "Respond, then initiate", strength: "Multi-tracking and fast pivoting between interests", risk: "Abandoning things before they compound", tip: "Not every pivot is progress — some things need you to stay", deep: "Manifesting Generators combine Generator sustainability with Manifestor initiation speed. The key mechanic is responding first (gut check), then moving fast. The risk is confusing speed with direction." },
  Projector: { drive: "Guide and recognize", strength: "You see how systems and people actually work", risk: "Offering guidance without invitation creates bitterness", tip: "Wait for recognition — then your insight lands perfectly", deep: "Projectors are designed to see, guide, and optimize. Their energy is not for sustained labor but for strategic direction. The key mechanic is waiting for invitation — not for everything, but for the big decisions: career, love, location." },
  Reflector: { drive: "Sample and mirror", strength: "You sense the health of any environment instantly", risk: "Absorbing the group's identity as your own", tip: "Wait a full lunar cycle before major decisions — your clarity takes time", deep: "Reflectors mirror the environment. They're designed to sample every energy type and reflect back the health of the community. The key mechanic is the lunar cycle — waiting 28 days before major decisions gives clarity that snap judgments never will." },
}

export function buildPlanetInsight(planet: string, sign: string, degree?: number): InsightData | null {
  const traits = SIGN_TRAITS[sign]
  const planetData = PLANET_MEANING[planet]
  if (!traits || !planetData) return null

  return {
    title: planet,
    subtitle: sign,
    layer1: {
      items: [
        { label: planetData.role, value: traits.drive },
        { label: "Strength", value: traits.strength },
        { label: "Risk", value: traits.risk },
        { label: "Action", value: traits.tip },
      ],
    },
    layer2: `${planetData.role}. ${planetData.question} ${traits.deep}`,
    layer3: [
      { label: "Planet", value: planet },
      { label: "Sign", value: sign },
      { label: "Element", value: SIGN_ELEMENT[sign] || "—" },
      { label: "Mode", value: SIGN_MODE[sign] || "—" },
      ...(degree !== undefined ? [{ label: "Degree", value: `${Math.floor(degree)}°` }] : []),
    ],
  }
}

export function buildLifePathInsight(lifePath: number): InsightData | null {
  const data = LP_INSIGHT[lifePath]
  if (!data) return null

  return {
    title: "Life Path",
    subtitle: String(lifePath),
    layer1: {
      items: [
        { label: "Core Theme", value: data.theme },
        { label: "Strength", value: data.strength },
        { label: "Risk", value: data.risk },
        { label: "Action", value: data.tip },
      ],
    },
    layer2: data.deep,
    layer3: [
      { label: "System", value: "Numerology" },
      { label: "Number", value: String(lifePath) },
      { label: "Type", value: lifePath >= 11 ? "Master Number" : "Core Number" },
    ],
  }
}

export function buildHDInsight(hdType: string, strategy?: string, authority?: string): InsightData | null {
  const data = HD_INSIGHT[hdType]
  if (!data) return null

  return {
    title: "Human Design",
    subtitle: hdType,
    layer1: {
      items: [
        { label: "Drive", value: data.drive },
        { label: "Strength", value: data.strength },
        { label: "Risk", value: data.risk },
        { label: "Action", value: data.tip },
      ],
    },
    layer2: data.deep,
    layer3: [
      { label: "Type", value: hdType },
      ...(strategy ? [{ label: "Strategy", value: strategy }] : []),
      ...(authority ? [{ label: "Authority", value: authority }] : []),
    ],
  }
}
