import type { Profile } from './shared/schema';
import { calcLifePath, parseDateOnly } from '@soulcodex/core';
import { formatInTimeZone } from 'date-fns-tz';

export interface Affirmation {
  text: string;
  category: 'abundance' | 'peace' | 'love' | 'transformation' | 'power';
  focus: string;
}

// These are intentional reflection statements, not predictions, guarantees,
// diagnoses, or claims that a symbolic number causes personality or outcomes.
const LIFE_PATH_AFFIRMATIONS: Record<number, Affirmation[]> = {
  1: [
    { text: "I can take one clear first step without needing perfect certainty.", category: 'power', focus: "Initiative" },
    { text: "I can lead by making my reasoning visible and leaving room for other people.", category: 'power', focus: "Leadership" },
    { text: "I can protect my independence without treating every situation as a solo mission.", category: 'peace', focus: "Independence" },
  ],
  2: [
    { text: "I can listen carefully without abandoning my own position.", category: 'peace', focus: "Cooperation" },
    { text: "I can ask for clarity instead of guessing what another person feels.", category: 'love', focus: "Connection" },
    { text: "I can pursue harmony without avoiding a necessary disagreement.", category: 'power', focus: "Boundaries" },
  ],
  3: [
    { text: "I can express one useful idea clearly and let the response teach me something.", category: 'transformation', focus: "Expression" },
    { text: "I can make something concrete instead of waiting for inspiration to feel complete.", category: 'power', focus: "Creativity" },
    { text: "I can enjoy attention without depending on it to decide what my work is worth.", category: 'peace', focus: "Self-Expression" },
  ],
  4: [
    { text: "I can strengthen one foundation by finishing the next practical step.", category: 'power', focus: "Structure" },
    { text: "I can use discipline as a tool without turning it into rigidity.", category: 'peace', focus: "Flexibility" },
    { text: "I can measure progress by what is actually completed, not by how controlled the process feels.", category: 'abundance', focus: "Progress" },
  ],
  5: [
    { text: "I can test one change without treating novelty as proof that it is better.", category: 'transformation', focus: "Change" },
    { text: "I can keep freedom and responsibility in the same decision.", category: 'power', focus: "Freedom" },
    { text: "I can notice restlessness before deciding what truly needs to move.", category: 'peace', focus: "Adaptability" },
  ],
  6: [
    { text: "I can care for other people without taking over responsibilities that belong to them.", category: 'love', focus: "Care" },
    { text: "I can make one practical improvement where I actually have influence.", category: 'power', focus: "Responsibility" },
    { text: "I can include my own capacity when deciding what support I can give.", category: 'peace', focus: "Boundaries" },
  ],
  7: [
    { text: "I can investigate one question deeply enough to improve a real decision.", category: 'power', focus: "Inquiry" },
    { text: "I can value solitude without using it to avoid useful feedback.", category: 'peace', focus: "Reflection" },
    { text: "I can separate intuition, assumption, and evidence before acting.", category: 'transformation', focus: "Discernment" },
  ],
  8: [
    { text: "I can use resources and influence deliberately instead of reacting to pressure.", category: 'power', focus: "Execution" },
    { text: "I can review the cost, leverage, and downside before increasing a commitment.", category: 'abundance', focus: "Resources" },
    { text: "I can pursue results without measuring my worth by the result.", category: 'peace', focus: "Achievement" },
  ],
  9: [
    { text: "I can finish what is genuinely complete without forcing an ending.", category: 'transformation', focus: "Completion" },
    { text: "I can contribute where it is useful without depleting myself to prove I care.", category: 'love', focus: "Contribution" },
    { text: "I can keep perspective by asking what this experience actually taught me.", category: 'peace', focus: "Perspective" },
  ],
  11: [
    { text: "I can record a strong impression and test it against evidence before treating it as guidance.", category: 'power', focus: "Discernment" },
    { text: "I can turn inspiration into one concrete experiment.", category: 'transformation', focus: "Inspiration" },
    { text: "I can stay open to meaning without confusing symbolism with certainty.", category: 'peace', focus: "Perspective" },
  ],
  22: [
    { text: "I can reduce a large vision to the next buildable step.", category: 'power', focus: "Implementation" },
    { text: "I can test the structure before scaling the ambition.", category: 'abundance', focus: "Building" },
    { text: "I can value durable progress more than impressive scope.", category: 'peace', focus: "Scale" },
  ],
  33: [
    { text: "I can offer care without assuming I am responsible for everyone else's healing.", category: 'love', focus: "Service" },
    { text: "I can teach from what I have tested rather than from certainty I have not earned.", category: 'power', focus: "Teaching" },
    { text: "I can practice compassion while keeping clear limits.", category: 'peace', focus: "Compassion" },
  ],
};

const UNIVERSAL_AFFIRMATIONS: Affirmation[] = [
  { text: "I can choose one useful action and judge it by what actually happens.", category: 'power', focus: "Agency" },
  { text: "I can slow down enough to separate facts, assumptions, and preferences.", category: 'peace', focus: "Clarity" },
  { text: "I can communicate care without pretending to know what another person needs.", category: 'love', focus: "Connection" },
  { text: "I can change my approach when new evidence gives me a good reason.", category: 'transformation', focus: "Adaptation" },
  { text: "I can define abundance in practical terms I can observe, build, and maintain.", category: 'abundance', focus: "Resources" },
];

function seededShuffle<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  let currentSeed = seed >>> 0;

  const seededRandom = () => {
    currentSeed = (currentSeed * 1664525 + 1013904223) >>> 0;
    return currentSeed / 4294967296;
  };

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(seededRandom() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

function resolveAffirmationDate(profile: Profile, date?: string): string {
  if (date) {
    parseDateOnly(date);
    return date;
  }

  const timezone =
    typeof (profile as any)?.timezone === 'string' && (profile as any).timezone.trim()
      ? (profile as any).timezone.trim()
      : null;

  if (!timezone) {
    throw new RangeError('Daily affirmation date or profile timezone is required');
  }

  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(new Date());
  } catch {
    throw new RangeError(`Invalid daily affirmation timezone: ${timezone}`);
  }

  return formatInTimeZone(new Date(), timezone, 'yyyy-MM-dd');
}

function generateSeed(profileId: unknown, date: string): number {
  const stableId =
    typeof profileId === 'string' || typeof profileId === 'number'
      ? String(profileId)
      : 'anonymous';

  const str = `${stableId}-${date}`;
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function generateDailyAffirmations(
  profile: Profile,
  count: number = 3,
  date?: string,
): Affirmation[] {
  if (!Number.isInteger(count) || count < 1 || count > 10) {
    throw new RangeError('Daily affirmation count must be an integer from 1 to 10');
  }

  const resolvedDate = resolveAffirmationDate(profile, date);
  const seed = generateSeed((profile as any).id, resolvedDate);

  let specific: Affirmation[] = [];
  try {
    const lifePath = calcLifePath(profile.birthDate);
    specific = LIFE_PATH_AFFIRMATIONS[lifePath] ?? [];
  } catch {
    // Invalid or missing birth data does not create substitute symbolic identity.
  }

  const pool = [...specific, ...UNIVERSAL_AFFIRMATIONS];
  return seededShuffle(pool, seed).slice(0, count);
}
