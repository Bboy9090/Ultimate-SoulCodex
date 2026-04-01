/**
 * Full 78-card Tarot Deck — Major Arcana (22) + Minor Arcana (56).
 * Every card has behavioral meaning, not vague symbolism.
 */

export interface TarotCard {
  id: number;
  name: string;
  arcana: "major" | "minor";
  suit?: "wands" | "cups" | "swords" | "pentacles";
  number?: number;
  keywords: string[];
  upright: string;
  reversed: string;
  behavior: string;
  shadow: string;
  action: string;
}

export const MAJOR_ARCANA: TarotCard[] = [
  { id: 0, name: "The Fool", arcana: "major", keywords: ["beginning", "leap", "trust"], upright: "A new chapter begins — trust the process of not knowing yet", reversed: "Recklessness disguised as spontaneity", behavior: "You're at the edge of something unfamiliar. The impulse to start is real.", shadow: "Jumping without looking because staying still feels worse", action: "Take the first step. A small one. Don't plan the whole journey — just start." },
  { id: 1, name: "The Magician", arcana: "major", keywords: ["focus", "skill", "action"], upright: "You have everything you need to make this work right now", reversed: "Scattered energy or using skill to manipulate instead of create", behavior: "Your resources are in place. The bottleneck is focus, not capability.", shadow: "Overthinking your readiness instead of using what you already have", action: "Pick one tool, one skill, one resource. Apply it to the most important task today." },
  { id: 2, name: "The High Priestess", arcana: "major", keywords: ["intuition", "patience", "knowing"], upright: "The answer is already inside you — stop looking outside for it", reversed: "Ignoring your intuition because it's inconvenient", behavior: "You know more than you're admitting. The quiet signal is correct.", shadow: "Seeking validation from others when your gut already decided", action: "Sit with the question for 10 minutes in silence. The first answer that surfaces is the one." },
  { id: 3, name: "The Empress", arcana: "major", keywords: ["nurture", "growth", "abundance"], upright: "What you've planted needs tending, not more planting", reversed: "Overgiving to others while neglecting your own needs", behavior: "Something you started is growing. Give it attention instead of starting something new.", shadow: "Nurturing everyone else's projects while yours wither", action: "Spend 30 minutes today on something you've already started. Water it." },
  { id: 4, name: "The Emperor", arcana: "major", keywords: ["structure", "authority", "boundary"], upright: "Create order. Set the boundary. Hold the line.", reversed: "Controlling behavior or refusing to adapt", behavior: "The situation needs structure, not inspiration. Build the container.", shadow: "Mistaking rigidity for strength", action: "Set one clear boundary today. Communicate it directly." },
  { id: 5, name: "The Hierophant", arcana: "major", keywords: ["tradition", "mentorship", "learning"], upright: "Learn from someone who's already done what you're attempting", reversed: "Blind conformity or rejecting guidance out of pride", behavior: "You're trying to figure this out alone when someone can show you.", shadow: "Refusing help because asking feels like weakness", action: "Ask one person who's ahead of you: 'What would you do in my position?'" },
  { id: 6, name: "The Lovers", arcana: "major", keywords: ["choice", "values", "alignment"], upright: "A values-based decision is in front of you — choose what aligns, not what's easy", reversed: "Avoiding a difficult choice by pretending it doesn't exist", behavior: "Two paths. You're stalling because both have costs.", shadow: "Trying to have both when the situation demands one", action: "Name both options out loud. Choose the one that matches who you're becoming, not who you were." },
  { id: 7, name: "The Chariot", arcana: "major", keywords: ["drive", "discipline", "momentum"], upright: "Move forward with controlled force — discipline, not aggression", reversed: "Forcing an outcome instead of steering toward it", behavior: "You have the momentum. The question is direction, not speed.", shadow: "Bulldozing through resistance that's actually trying to redirect you", action: "Channel your energy into one direction. Drop the side projects for today." },
  { id: 8, name: "Strength", arcana: "major", keywords: ["patience", "composure", "endurance"], upright: "Hold steady. This requires patience, not force.", reversed: "Suppressing emotions instead of managing them", behavior: "The situation is testing your patience. You're stronger than you think.", shadow: "Performing calm while seething underneath", action: "When you feel the urge to react, pause 3 seconds. Then respond. Those 3 seconds change everything." },
  { id: 9, name: "The Hermit", arcana: "major", keywords: ["solitude", "clarity", "wisdom"], upright: "Step back from the noise. Clarity comes from solitude, not more input.", reversed: "Isolating to avoid, not to reflect", behavior: "You need space to think. Not days — even 30 minutes would help.", shadow: "Using 'I need space' as avoidance instead of genuine reflection", action: "Block 30 minutes today. No phone. No people. Just you and one question." },
  { id: 10, name: "Wheel of Fortune", arcana: "major", keywords: ["cycles", "change", "timing"], upright: "A cycle is turning — what served you before may not serve you now", reversed: "Resisting change that's already underway", behavior: "Something is shifting. You can feel it. Fighting it makes it harder.", shadow: "Clinging to a phase that's already ending", action: "Name one thing that used to work but doesn't anymore. Let it go today." },
  { id: 11, name: "Justice", arcana: "major", keywords: ["truth", "consequence", "balance"], upright: "Face the truth of the situation. No spin, no softening.", reversed: "Avoiding accountability or distorting the facts", behavior: "There's something you know is true but haven't admitted yet.", shadow: "Justifying your actions instead of examining them", action: "Write down the honest version of the situation. The one you'd tell someone you trust completely." },
  { id: 12, name: "The Hanged Man", arcana: "major", keywords: ["surrender", "perspective", "pause"], upright: "Stop pushing. The answer comes from a different angle.", reversed: "Stalling or martyrdom disguised as patience", behavior: "Your default approach isn't working. Try the opposite.", shadow: "Waiting for something to change while doing nothing differently", action: "Flip one assumption about this situation. What if the opposite were true?" },
  { id: 13, name: "Death", arcana: "major", keywords: ["ending", "transformation", "release"], upright: "Something is ending. Let it. The next thing can't start until this finishes.", reversed: "Resisting a necessary ending", behavior: "You're holding onto something that's already finished.", shadow: "Keeping it alive because the unknown feels worse than the familiar", action: "Name what needs to end. Say it out loud. Then take one step toward closing it." },
  { id: 14, name: "Temperance", arcana: "major", keywords: ["balance", "moderation", "integration"], upright: "Find the middle path. You're swinging between extremes.", reversed: "Overindulgence or excessive restraint", behavior: "You've been all-or-nothing. The answer is somewhere in between.", shadow: "Thinking moderation means mediocrity", action: "Identify where you're at an extreme today. Pull 20% toward center." },
  { id: 15, name: "The Devil", arcana: "major", keywords: ["attachment", "pattern", "awareness"], upright: "You're stuck in a pattern you can leave — but you have to see it first", reversed: "Breaking free from a destructive habit", behavior: "Something has more hold on you than you're admitting.", shadow: "Telling yourself you can stop anytime while continuing", action: "Name the attachment. Not vaguely — specifically. That's step one." },
  { id: 16, name: "The Tower", arcana: "major", keywords: ["disruption", "breakthrough", "truth"], upright: "A structure you've built on false assumptions is collapsing. Let it.", reversed: "Avoiding inevitable change or rebuilding on the same faulty foundation", behavior: "Something you thought was solid is shaking. The cracks were already there.", shadow: "Trying to repair what needs to be rebuilt from scratch", action: "Stop patching. Ask: what's the foundation made of? If it's weak, start over." },
  { id: 17, name: "The Star", arcana: "major", keywords: ["hope", "vision", "renewal"], upright: "After difficulty, clarity returns. Trust the recovery.", reversed: "Losing faith or forcing optimism you don't feel", behavior: "You've been through something hard. The worst part is behind you.", shadow: "Pretending to be fine before you've actually recovered", action: "Allow yourself one moment today of genuine hope. Not forced — felt." },
  { id: 18, name: "The Moon", arcana: "major", keywords: ["uncertainty", "subconscious", "illusion"], upright: "Things aren't as clear as they seem. Don't force certainty yet.", reversed: "Ignoring red flags or letting fear make the decision", behavior: "Confusion is the information right now. Don't rush through it.", shadow: "Making a permanent decision during a temporary fog", action: "Label today's decisions as 'clear' or 'foggy.' Only act on the clear ones." },
  { id: 19, name: "The Sun", arcana: "major", keywords: ["clarity", "vitality", "truth"], upright: "Clarity is available. Act on what you can see plainly.", reversed: "Forced positivity or burnout from overexposure", behavior: "You know what's true. Today is for acting on it, not questioning it more.", shadow: "Over-optimism that ignores real constraints", action: "Do the thing you've been clear about for days. Stop second-guessing it." },
  { id: 20, name: "Judgement", arcana: "major", keywords: ["reckoning", "calling", "evaluation"], upright: "It's time to evaluate what you've built and decide if it still fits", reversed: "Self-doubt blocking a necessary step forward", behavior: "A phase of your life is asking for honest review.", shadow: "Being so critical of your past that you can't move forward", action: "Look at the last 6 months. Keep what works. Release what doesn't. Move." },
  { id: 21, name: "The World", arcana: "major", keywords: ["completion", "integration", "wholeness"], upright: "A cycle is complete. Acknowledge what you've accomplished before starting the next one.", reversed: "Rushing to the next thing without closing the current chapter", behavior: "You've done more than you're giving yourself credit for.", shadow: "Restlessness disguised as ambition", action: "Pause. List 3 things you completed this month. Let them land before starting more." },
];

function buildMinorArcana(): TarotCard[] {
  const suits: Array<{ suit: "wands" | "cups" | "swords" | "pentacles"; element: string; domain: string }> = [
    { suit: "wands", element: "Fire", domain: "action, drive, ambition" },
    { suit: "cups", element: "Water", domain: "emotions, relationships, intuition" },
    { suit: "swords", element: "Air", domain: "thoughts, decisions, conflict" },
    { suit: "pentacles", element: "Earth", domain: "work, resources, material reality" },
  ];

  const numbers: Array<{ num: number; name: string; theme: string; upright: string; reversed: string }> = [
    { num: 1, name: "Ace", theme: "new beginning", upright: "A fresh start is available in this area", reversed: "Missed opportunity or false start" },
    { num: 2, name: "Two", theme: "choice or partnership", upright: "A decision or collaboration needs attention", reversed: "Indecision or imbalanced partnership" },
    { num: 3, name: "Three", theme: "growth and expansion", upright: "Early results are showing — keep building", reversed: "Scattered effort or premature celebration" },
    { num: 4, name: "Four", theme: "stability or stagnation", upright: "Foundation is solid — but don't get complacent", reversed: "Restlessness under a stable surface" },
    { num: 5, name: "Five", theme: "conflict and challenge", upright: "A difficulty that's forcing growth", reversed: "Avoiding the necessary confrontation" },
    { num: 6, name: "Six", theme: "harmony and exchange", upright: "Balance restored through giving or receiving", reversed: "Unequal exchange or strings attached" },
    { num: 7, name: "Seven", theme: "assessment and patience", upright: "Evaluate progress before the next push", reversed: "Impatience or poor strategy" },
    { num: 8, name: "Eight", theme: "movement and mastery", upright: "Rapid progress through focused effort", reversed: "Haste or burnout from overcommitment" },
    { num: 9, name: "Nine", theme: "near-completion", upright: "Almost there — persistence required for the final stretch", reversed: "Exhaustion right before the finish line" },
    { num: 10, name: "Ten", theme: "completion and consequence", upright: "A cycle finishes — the full weight of what you've built is here", reversed: "Carrying the burden of over-responsibility" },
    { num: 11, name: "Page", theme: "curiosity and learning", upright: "A new skill, message, or perspective arrives", reversed: "Naivety or ignoring important information" },
    { num: 12, name: "Knight", theme: "action and pursuit", upright: "Bold movement toward a goal", reversed: "Reckless action or all talk, no follow-through" },
    { num: 13, name: "Queen", theme: "mastery and nurture", upright: "Confident command of this area through experience", reversed: "Manipulation or emotional withdrawal" },
    { num: 14, name: "King", theme: "authority and leadership", upright: "Full command and responsibility in this domain", reversed: "Tyranny, burnout, or abdication of responsibility" },
  ];

  const cards: TarotCard[] = [];
  let id = 22;

  for (const s of suits) {
    for (const n of numbers) {
      const cardName = `${n.name} of ${s.suit.charAt(0).toUpperCase() + s.suit.slice(1)}`;
      cards.push({
        id: id++,
        name: cardName,
        arcana: "minor",
        suit: s.suit,
        number: n.num,
        keywords: [n.theme, s.domain.split(",")[0].trim()],
        upright: `${n.upright} — specifically in ${s.domain}`,
        reversed: `${n.reversed} — watch for this in ${s.domain}`,
        behavior: `${n.theme} is active in your ${s.domain}. This is about what you're actually doing, not what you're thinking about.`,
        shadow: `The trap here is ${n.reversed.toLowerCase().split(" or ")[0]}`,
        action: `Focus on ${s.domain.split(",")[0].trim()} today. ${n.num <= 5 ? "Build" : n.num <= 10 ? "Evaluate and adjust" : "Lead or learn"}.`,
      });
    }
  }

  return cards;
}

export const MINOR_ARCANA = buildMinorArcana();
export const FULL_DECK: TarotCard[] = [...MAJOR_ARCANA, ...MINOR_ARCANA];

export function drawCards(count: number, seed?: number): TarotCard[] {
  const deck = [...FULL_DECK];
  const s = seed ?? Date.now();
  let state = s;

  for (let i = deck.length - 1; i > 0; i--) {
    state = ((state * 1103515245 + 12345) & 0x7fffffff);
    const j = state % (i + 1);
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck.slice(0, count);
}
