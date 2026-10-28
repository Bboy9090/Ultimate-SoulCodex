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

/** Call only with evidence-qualified placements; this function never calculates a chart. */
export function chartPlacementReading(body: string, sign: string, house: number | null, evidence: string, expanded = false): ChartPlacementReading | null {
  if (!PLANET_FUNCTIONS[body] || !ATLAS_SIGNS.includes(sign as AtlasSign)) return null;
  const style = atlasSignMeaning(sign as AtlasSign);
  const label = body.charAt(0).toUpperCase() + body.slice(1);
  const validHouse = Number.isInteger(house) && Number(house) >= 1 && Number(house) <= 12;
  const personal = validHouse ? personalPlacementMeaning(body, sign as AtlasSign, house!) : null;
  return {
    key: body,
    title: `${label} in ${sign}${validHouse ? ` · House ${house}` : ""}`,
    meaning: `In your chart, ${label} in ${sign} connects ${PLANET_FUNCTIONS[body].function} with ${style.approach}.${personal ? ` ${personal.where}` : " Your house is unresolved, so this reading does not assign a life area."} This is a symbolic lens to test against your experience, not a measured effect on your personality.`,
    gift: `${label} in ${sign}: a possible strength is ${style.gift}.`,
    tension: `${label} in ${sign}: ${style.tension}. Notice whether this fits before treating it as your pattern.`,
    action: personal?.practice ?? `For ${PLANET_FUNCTIONS[body].function}, ${style.practice}. Ask yourself: ${PLANET_FUNCTIONS[body].question}`,
    evidence,
    ...(expanded ? { depth: {
      relationships: `${label} in ${sign} offers a symbolic lens on ${PLANET_FUNCTIONS[body].function} in connection. ${style.tension}. Before assuming another person shares your priorities, describe one specific need, ask how they experience it, and agree on a response both people can observe.${personal ? ` Keep the conversation grounded in the life area shown by your placement: ${personal.where}` : " Your house is unresolved; do not assign this theme to a particular life area."}`,
      decisions: `When a decision involves ${PLANET_FUNCTIONS[body].function}, your ${sign} symbolism emphasizes ${style.approach}. Separate that preferred style from the facts of the decision. Write the goal, the cost of acting, and the cost of waiting; then ${style.practice}. Check the result against what actually happens rather than treating the chart as an instruction.`,
      reflection: `${personal?.question ?? PLANET_FUNCTIONS[body].question} Find one recent example of ${style.gift} and one counterexample. Then notice whether ${style.tension}. Choose what fits your experience and discard what does not.`,
    } } : {}),
  };
}
