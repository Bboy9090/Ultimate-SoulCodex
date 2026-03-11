import type { SoulProfile } from "../types/soulcodex";

export type PatternResult = {
  category: string;
  pattern: string;
  explanation: string;
  strategy: string;
};

type SignalBundle = {
  sunSign: string;
  moonSign: string;
  risingSign: string;
  mercurySign: string;
  venusSign: string;
  marsSign: string;
  lifePath: number;
  driver: string;
  shadowTrigger: string;
  decisionStyle: string;
  stressElement: string;
  values: string[];
  intolerances: string[];
  hdType: string;
  hdStrategy: string;
  phase: string;
  themes: string[];
};

function extractSignals(profile: SoulProfile): SignalBundle {
  return {
    sunSign: profile.chart?.sun?.sign || "",
    moonSign: profile.chart?.moon?.sign || "",
    risingSign: profile.chart?.rising?.sign || "",
    mercurySign: profile.chart?.mercury?.sign || "",
    venusSign: profile.chart?.venus?.sign || "",
    marsSign: profile.chart?.mars?.sign || "",
    lifePath: profile.numerology?.lifePath || 0,
    driver: profile.mirror?.driver || "",
    shadowTrigger: profile.mirror?.shadowTrigger || "",
    decisionStyle: profile.mirror?.decisionStyle || "",
    stressElement: profile.elements
      ? Object.entries(profile.elements).sort((a, b) => b[1] - a[1])[0]?.[0] || ""
      : "",
    values: profile.morals?.values || [],
    intolerances: profile.morals?.intolerances || [],
    hdType: profile.humanDesign?.type || "",
    hdStrategy: profile.humanDesign?.strategy || "",
    phase: profile.timeline?.currentPhase || "",
    themes: profile.themes?.topThemes || [],
  };
}

const CATEGORIES = ["relationships", "work", "motivation", "stress", "direction", "conflict"] as const;

function classifyQuestion(question: string): typeof CATEGORIES[number] {
  const q = question.toLowerCase();
  if (q.includes("relationship") || q.includes("partner") || q.includes("love") || q.includes("attract") || q.includes("trust") || q.includes("end relationship") || q.includes("cutting") || q.includes("cut off") || q.includes("dating"))
    return "relationships";
  if (q.includes("work") || q.includes("job") || q.includes("career") || q.includes("bored") || q.includes("boss") || q.includes("colleague") || q.includes("inefficien"))
    return "work";
  if (q.includes("motivat") || q.includes("finish") || q.includes("start") || q.includes("procrastinat") || q.includes("give up") || q.includes("abandon") || q.includes("follow through"))
    return "motivation";
  if (q.includes("stress") || q.includes("overthink") || q.includes("anxiety") || q.includes("argument") || q.includes("head for days") || q.includes("burnout") || q.includes("exhaust") || q.includes("pressure"))
    return "stress";
  if (q.includes("conflict") || q.includes("fight") || q.includes("anger") || q.includes("confrontat") || q.includes("disagree") || q.includes("toleran"))
    return "conflict";
  return "direction";
}

const SIGN_ELEMENT: Record<string, string> = {
  Aries: "fire", Taurus: "earth", Gemini: "air", Cancer: "water",
  Leo: "fire", Virgo: "earth", Libra: "air", Scorpio: "water",
  Sagittarius: "fire", Capricorn: "earth", Aquarius: "air", Pisces: "water",
};

function decodeRelationships(s: SignalBundle): PatternResult {
  const venusTrait = SIGN_ELEMENT[s.venusSign] || "";
  const moonTrait = SIGN_ELEMENT[s.moonSign] || "";

  let pattern = "Your profile shows a strong filter in relationships.";
  let explanation = "";
  let strategy = "";

  if (s.intolerances.length > 0) {
    pattern = `A strong ${s.intolerances[0].toLowerCase()}-detection pattern runs through your profile.`;
  } else if (s.shadowTrigger) {
    pattern = `A strong ${s.shadowTrigger.toLowerCase()} detection pattern runs through your profile.`;
  }

  if (moonTrait === "water" || s.moonSign === "Scorpio") {
    explanation = `Your ${s.moonSign} Moon processes trust slowly and deeply. You test people through observation, not conversation. When someone's behavior contradicts their words, your tolerance drops fast — often before you consciously decide to end things.`;
  } else if (moonTrait === "air") {
    explanation = `Your ${s.moonSign} Moon processes relationships through mental models. You analyze patterns in how someone communicates and behaves. When the pattern stops making sense, you detach mentally before emotionally.`;
  } else if (moonTrait === "fire") {
    explanation = `Your ${s.moonSign} Moon reacts fast in relationships. You know within moments whether something feels right or wrong. The risk is that you act on that instinct before giving people a chance to show their full picture.`;
  } else {
    explanation = `Your ${s.moonSign} Moon needs stability and consistency in relationships. Unpredictability registers as a threat, not excitement. You pull away when you can't predict how someone will behave.`;
  }

  if (venusTrait === "water") {
    explanation += ` Your Venus in ${s.venusSign} connects through emotional depth — surface-level relationships feel pointless to you.`;
  } else if (venusTrait === "air") {
    explanation += ` Your Venus in ${s.venusSign} connects through intellectual rapport — you need stimulating conversation to stay interested.`;
  } else if (venusTrait === "fire") {
    explanation += ` Your Venus in ${s.venusSign} needs passion and directness — you lose interest when relationships become routine.`;
  } else if (venusTrait === "earth") {
    explanation += ` Your Venus in ${s.venusSign} values reliability — grand gestures mean less to you than consistent follow-through.`;
  }

  if (s.decisionStyle.toLowerCase().includes("logic") || s.decisionStyle.toLowerCase().includes("analyz")) {
    strategy = "Slow the final decision slightly. Give people 48 hours to clarify or correct behavior before concluding the relationship is broken. Your analysis is usually right, but the timing of the exit can be premature.";
  } else {
    strategy = "Name the specific behavior that triggered the reaction before acting on it. Your instinct is usually accurate, but articulating it first prevents unnecessary damage and gives the other person a chance to respond.";
  }

  return { category: "relationships", pattern, explanation, strategy };
}

function decodeWork(s: SignalBundle): PatternResult {
  let pattern = "Your profile shows a pattern of high initial engagement that drops when the work stops being interesting.";
  let explanation = "";
  let strategy = "";

  if (s.lifePath === 5 || s.themes.some(t => t.toLowerCase().includes("freedom"))) {
    pattern = "A freedom-driven work pattern runs through your profile.";
    explanation = `Life Path ${s.lifePath || "yours"} is wired for variety and experience. Routine work environments feel suffocating, not because you lack discipline but because your mind needs novel problems to stay engaged. You tend to master the core of a job quickly, then feel trapped by the maintenance phase.`;
  } else if (s.lifePath === 4 || s.themes.some(t => t.toLowerCase().includes("precision") || t.toLowerCase().includes("structure"))) {
    pattern = "A precision-driven work pattern runs through your profile.";
    explanation = `You notice inefficiencies that others accept as normal. In work environments, this makes you the person who sees what's broken before anyone else. The frustration builds when you can't fix it — either because of politics, hierarchy, or other people's indifference.`;
  } else {
    explanation = `Your ${s.sunSign} drive pushes you to work that feels meaningful, not just profitable. When a job stops feeling like it matters, your engagement drops visibly — and you start looking for what's next before you've officially left what's current.`;
  }

  if (s.hdType === "Projector") {
    explanation += " As a Projector, you're designed to guide systems, not grind through them. Burnout happens when you try to sustain Generator-level output.";
    strategy = "Wait for roles where your insight is recognized and invited. Working harder won't fix a role that doesn't use your actual skill.";
  } else if (s.hdType === "Generator" || s.hdType === "Manifesting Generator") {
    strategy = "Your sustained energy only works when the task excites you. Stop forcing engagement with work that consistently drains you. The solution isn't more discipline — it's better alignment between the work and what actually lights you up.";
  } else {
    strategy = "Identify the specific moment engagement drops. It's usually when you've solved the interesting problem and only maintenance remains. Build work around problem-solving phases, not maintenance roles.";
  }

  return { category: "work", pattern, explanation, strategy };
}

function decodeMotivation(s: SignalBundle): PatternResult {
  let pattern = "Your motivation pattern follows a spike-and-fade cycle.";
  let explanation = "";
  let strategy = "";

  const marsElement = SIGN_ELEMENT[s.marsSign] || "";

  if (marsElement === "fire") {
    explanation = `Your Mars in ${s.marsSign} gives you explosive start energy. You begin projects with intensity that other people can't match. The drop happens when the initial excitement fades and the work becomes repetitive. You're not lazy — you're wired for ignition, not maintenance.`;
  } else if (marsElement === "air") {
    explanation = `Your Mars in ${s.marsSign} drives you through ideas. You start things because the concept excites you. Motivation drops when the execution becomes more physical than mental — when the work stops being interesting and starts being tedious.`;
  } else if (marsElement === "earth") {
    explanation = `Your Mars in ${s.marsSign} actually sustains effort well, but only for things you believe in. When motivation drops, it's usually a signal that the project no longer aligns with what you actually value. You don't lose motivation randomly — you lose it when the purpose disappears.`;
  } else {
    explanation = `Your Mars in ${s.marsSign} ties motivation to emotional investment. You can move mountains when you care. When the emotional connection to a project fades, so does the drive — and no amount of discipline replaces that.`;
  }

  if (s.lifePath === 3) {
    explanation += " Life Path 3 amplifies this — you're wired for creative expression, and repetitive execution feels like a cage.";
  }

  if (s.stressElement === "air") {
    strategy = "Your mind outpaces your hands. Reduce the gap between thinking and doing by setting a 10-minute action rule: when a new idea hits, do one concrete step within 10 minutes. This anchors the idea before your mind moves to the next one.";
  } else if (s.stressElement === "fire") {
    strategy = "Your energy comes in bursts. Instead of fighting that, plan your work in sprint cycles. Two hours of intense work, then a complete break. Don't try to sustain marathon sessions — they'll end in burnout and abandonment.";
  } else {
    strategy = "Break every project into the smallest visible milestone you can complete in one sitting. Your motivation returns when you see tangible progress, not when you lecture yourself about discipline.";
  }

  return { category: "motivation", pattern, explanation, strategy };
}

function decodeStress(s: SignalBundle): PatternResult {
  let pattern = "Your stress pattern is primarily mental.";
  let explanation = "";
  let strategy = "";

  if (s.stressElement === "air" || s.mercurySign === "Virgo" || s.mercurySign === "Gemini") {
    pattern = "Your stress response is mental acceleration.";
    explanation = `When pressure rises, your mind speeds up. You replay conversations, analyze decisions from multiple angles, and struggle to turn off the mental loop. ${s.mercurySign ? `Your Mercury in ${s.mercurySign} amplifies this — your thinking gear has no neutral.` : ""} Arguments and unresolved situations stay in your head for days because your mind keeps searching for the precise moment things went wrong.`;
    strategy = "Write the loop down. When the mental replay starts, put it on paper — the specific sentences, the specific moments. This externalizes the processing and breaks the cycle. Then pick one action item and do it. Your mind releases the loop once it sees a concrete next step.";
  } else if (s.stressElement === "fire" || s.marsSign === "Aries") {
    pattern = "Your stress response is physical escalation.";
    explanation = `Under pressure, your body activates before your mind catches up. You feel the tension in your chest, jaw, or hands. Your voice gets sharper, your patience disappears, and you say things at full intensity that you'd normally filter. Other people see your stress before you realize you're stressed.`;
    strategy = "Move your body before responding. Walk, exercise, or do something physical for 10 minutes. Your stress is somatic — it lives in your body, not your thoughts. Verbal processing under this kind of pressure makes things worse, not better.";
  } else if (s.stressElement === "water" || s.moonSign === "Pisces" || s.moonSign === "Cancer") {
    pattern = "Your stress response is emotional absorption.";
    explanation = `Under pressure, you absorb the emotional state of the environment. Other people's anxiety becomes your anxiety. You may not even realize the stress isn't originally yours. By the time you identify what's happening, you're already deep in the feeling and the boundary between your emotions and the situation has dissolved.`;
    strategy = "Before processing the feeling, ask: is this mine? Physically leave the environment for 15 minutes. If the stress reduces immediately, it wasn't yours. If it stays, then address the specific trigger — not the general feeling.";
  } else {
    pattern = "Your stress response is withdrawal and rigidity.";
    explanation = `Under pressure, you dig in. You stop adapting, slow your responses, and resist change even when the situation clearly requires it. This feels like strength from the inside, but from the outside it looks like stubbornness. The longer you hold the position, the harder it becomes to shift.`;
    strategy = "Set a time limit on your resistance. Give yourself 24 hours to hold your ground, then actively reconsider. The goal isn't to cave — it's to prevent rigidity from costing you more than flexibility would.";
  }

  return { category: "stress", pattern, explanation, strategy };
}

function decodeConflict(s: SignalBundle): PatternResult {
  let pattern = "Your conflict pattern is fast detection, slow response.";
  let explanation = "";
  let strategy = "";

  if (s.driver.toLowerCase().includes("truth") || s.intolerances.some(i => i.toLowerCase().includes("dishonest"))) {
    pattern = "Your conflict pattern is truth-enforcement.";
    explanation = "You detect dishonesty or inconsistency faster than most people. When someone says one thing and does another, your internal alarm fires immediately. The conflict doesn't come from your temper — it comes from your refusal to pretend the inconsistency isn't there.";
    strategy = "Verify before confronting. Your detection is usually accurate, but your timing can create unnecessary escalation. State the observation as a question first: 'I noticed X — is that what's happening?' This gives people a way to correct course without triggering a defensive reaction.";
  } else if (s.marsSign === "Aries" || s.marsSign === "Scorpio") {
    pattern = "Your conflict pattern is direct confrontation.";
    explanation = `Your Mars in ${s.marsSign} goes straight at the problem. You don't hint, imply, or passive-aggressively wait. When something is wrong, you name it. This is effective in situations that need directness, but it can overwhelm people who process conflict more slowly.`;
    strategy = "Match your delivery to the person, not the problem. Your directness is an asset, but calibrating the intensity to the listener prevents the message from getting lost in the reaction.";
  } else {
    explanation = `You tend to process conflict internally before responding externally. The delay between detection and response can confuse people — they think you're fine, but you've already been analyzing the situation for hours or days.`;
    strategy = "Shorten the gap between noticing and naming. The longer you sit with unspoken conflict, the more it compounds. A five-minute honest conversation today prevents a five-day mental replay later.";
  }

  return { category: "conflict", pattern, explanation, strategy };
}

function decodeDirection(s: SignalBundle): PatternResult {
  let pattern = "Your life direction pattern is purpose-driven, not goal-driven.";
  let explanation = "";
  let strategy = "";

  const lp = s.lifePath;

  if (lp === 9 || lp === 6) {
    pattern = "Your direction pattern is service and legacy.";
    explanation = `Life Path ${lp} drives you toward work that matters beyond yourself. You feel the pressure to build something meaningful — not for recognition, but because shallow achievement feels physically unsatisfying. Career decisions that prioritize money over purpose create internal friction that builds over time.`;
    strategy = "Stop trying to justify your need for meaningful work in practical terms. Accept that purpose is your practical need. Then evaluate every opportunity through one filter: does this contribute to what I want to leave behind?";
  } else if (lp === 1 || lp === 8) {
    pattern = "Your direction pattern is mastery and independence.";
    explanation = `Life Path ${lp} drives you to lead, not follow. You feel constrained in environments where someone else controls the direction. The recurring pattern: you build competence in a role, outgrow the structure, then feel pressure to create your own path.`;
    strategy = "The pattern isn't restlessness — it's growth exceeding the container. Instead of forcing yourself to stay comfortable, design your next move around autonomy. You perform best when you control the scope of your own decisions.";
  } else if (lp === 7 || lp === 11) {
    pattern = "Your direction pattern is truth-seeking.";
    explanation = `Life Path ${lp} makes surface-level work intolerable. You need to understand why things work, not just that they work. Career or life directions that don't offer depth of understanding eventually feel meaningless, regardless of external success.`;
    strategy = "Follow the curiosity, not the credential. Your best work happens when you go deep into a subject that genuinely fascinates you. External validation will follow the depth, not the other way around.";
  } else {
    explanation = `Your ${s.sunSign} drive combined with Life Path ${lp || "your number"} creates a pattern where you feel pulled toward building structures that reflect your values. The frustration comes when the external world rewards speed over substance.`;
    strategy = `Stay in ${s.phase || "your current phase"} long enough for the work to compound. Your pattern isn't about finding the right direction — you usually know the direction. It's about staying long enough for it to produce visible results.`;
  }

  return { category: "direction", pattern, explanation, strategy };
}

export function decodePattern(question: string, profile: SoulProfile): PatternResult {
  const signals = extractSignals(profile);
  const category = classifyQuestion(question);

  switch (category) {
    case "relationships": return decodeRelationships(signals);
    case "work": return decodeWork(signals);
    case "motivation": return decodeMotivation(signals);
    case "stress": return decodeStress(signals);
    case "conflict": return decodeConflict(signals);
    case "direction": return decodeDirection(signals);
  }
}
