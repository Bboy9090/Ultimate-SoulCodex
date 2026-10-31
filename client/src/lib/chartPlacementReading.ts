import { ATLAS_SIGNS, PLANET_FUNCTIONS, atlasSignMeaning, personalPlacementMeaning, type AtlasSign } from "./astrologyAtlas";

export interface ChartPlacementReading {
  key: string;
  title: string;
  meaning: string;
  gift: string;
  tension: string;
  action: string;
  evidence: string;
  depth?: { relationships: string; decisions: string; reflection: string };
}

// Distinguish planets sharing a sign: a stellium must not repeat one personality
// paragraph. These are symbolic prompts, never astronomical or behavioral facts.
const BODY_PRACTICE: Record<string, { gift: string; tension: string; practice: string }> = {
  sun: { gift: "build a sense of direction through choices you can stand behind", tension: "making your worth depend on how well you perform", practice: "Name one value you want today's choices to express; choose one small act that serves it without needing recognition." },
  moon: { gift: "recognize what helps you feel settled and respond to emotional needs", tension: "treating an immediate feeling as the whole story", practice: "Name the feeling, identify the need beneath it, and try one comforting action before deciding what the situation means." },
  mercury: { gift: "turn observations into language, questions, and useful understanding", tension: "mistaking your first explanation for shared understanding", practice: "Write the observation separately from your interpretation, then ask the other person to explain what they heard." },
  venus: { gift: "make your values visible through affection, enjoyment, and reciprocity", tension: "letting approval replace an honest preference", practice: "Name one thing you enjoy and one relationship need; make a clear invitation that leaves room for the other person's answer." },
  mars: { gift: "turn desire into effort and state a boundary directly", tension: "using pressure where a clear request or a pause would work better", practice: "Choose one goal or boundary, state it without an accusation, and commit to one proportionate next step." },
  jupiter: { gift: "connect an opportunity with a larger sense of purpose", tension: "letting enthusiasm outrun evidence or available resources", practice: "Describe the opportunity, check one assumption, and set a small budget of time or money for testing it." },
  saturn: { gift: "build reliability through limits, practice, and responsibility", tension: "confusing responsibility with carrying everything alone", practice: "Choose one obligation, define what completion requires, and name what you can delegate or decline." },
  uranus: { gift: "question a stale rule and experiment with an alternative", tension: "changing direction before understanding what still works", practice: "Identify one rule that frustrates you, keep its useful purpose, and test a reversible alternative." },
  neptune: { gift: "give imagination and sensitivity a concrete creative outlet", tension: "filling a gap in the facts with an appealing story", practice: "Write what you hope is true beside what you actually know; give the hope a creative outlet while checking one missing fact." },
  pluto: { gift: "notice where honesty can make room for meaningful change", tension: "trying to control uncertainty or another person's response", practice: "Separate what you can choose from what belongs to someone else, then take one honest action within your own control." },
};

/** Call only with evidence-qualified placements; this function never calculates a chart. */
export function chartPlacementReading(body: string, sign: string, house: number | null, evidence: string, expanded = false): ChartPlacementReading | null {
  if (!Object.hasOwn(PLANET_FUNCTIONS, body) || !ATLAS_SIGNS.includes(sign as AtlasSign)) return null;
  const style = atlasSignMeaning(sign as AtlasSign);
  const label = body.charAt(0).toUpperCase() + body.slice(1);
  const validHouse = Number.isInteger(house) && Number(house) >= 1 && Number(house) <= 12;
  const personal = validHouse ? personalPlacementMeaning(body, sign as AtlasSign, house!) : null;
  const bodyPractice = BODY_PRACTICE[body];
  const action = bodyPractice
    ? `${bodyPractice.practice} Work with the ${sign} prompt: ${style.practice}.${personal ? ` ${personal.where} Use a recent example from that area.` : " Your house is unresolved; choose the real-life context yourself."}`
    : personal?.practice ?? `For ${PLANET_FUNCTIONS[body].function}, ${style.practice}. Ask yourself: ${PLANET_FUNCTIONS[body].question}`;
  return {
    key: body,
    title: `${label} in ${sign}${validHouse ? ` · House ${house}` : ""}`,
    meaning: `In your chart, ${label} in ${sign} connects ${PLANET_FUNCTIONS[body].function} with ${style.approach}.${personal ? ` ${personal.where}` : " Your house is unresolved, so this reading does not assign a life area."} This is a symbolic lens to test against your experience, not a measured effect on your personality.`,
    gift: `${label} in ${sign}: a possible strength is ${bodyPractice ? `the ability to ${bodyPractice.gift}, expressed through ${style.approach}` : style.gift}.`,
    tension: `${label} in ${sign}: watch for ${bodyPractice?.tension ?? style.tension}. The ${sign} tradeoff is that ${style.tension}. Notice whether this fits before treating it as your pattern.`,
    action,
    evidence,
    ...(expanded ? { depth: {
      relationships: `${label} in ${sign} offers a symbolic lens on ${PLANET_FUNCTIONS[body].function} in connection. ${style.tension}. Before assuming another person shares your priorities, describe one specific need, ask how they experience it, and agree on a response both people can observe.${personal ? ` Keep the conversation grounded in the life area shown by your placement: ${personal.where}` : " Your house is unresolved; do not assign this theme to a particular life area."}`,
      decisions: `When a decision involves ${PLANET_FUNCTIONS[body].function}, your ${sign} symbolism emphasizes ${style.approach}. Separate that preferred style from the facts of the decision. Write the goal, the cost of acting, and the cost of waiting; then ${style.practice}. Check the result against what actually happens rather than treating the chart as an instruction.`,
      reflection: `${personal?.question ?? PLANET_FUNCTIONS[body].question} Find one recent example of ${bodyPractice?.gift ?? style.gift} and one counterexample. Then notice whether ${bodyPractice?.tension ?? style.tension} fits. Choose what fits your experience and discard what does not.`,
    } } : {}),
  };
}
