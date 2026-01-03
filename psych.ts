import type { Psych } from "./types";

const ATTACHMENT: Record<string, number> = {
  "secure|secure": 0.9,
  "secure|anxious": 0.8, "anxious|secure": 0.8,
  "secure|avoidant": 0.8, "avoidant|secure": 0.8,
  "secure|disorganized": 0.6, "disorganized|secure": 0.6,
  "anxious|avoidant": 0.5, "avoidant|anxious": 0.5,
  "anxious|anxious": 0.6,
  "avoidant|avoidant": 0.5,
  "disorganized|disorganized": 0.4
};

const loveOverlap = (a?: string[], b?: string[]): number => {
  if (!a?.length || !b?.length) return 0.5;
  const A = new Set(a);
  const B = new Set(b);
  const inter = Array.from(A).filter(x => B.has(x)).length;
  const uni = new Set([...a, ...b]).size || 1;
  return inter / uni;
};

export const scorePsych = (a?: Psych, b?: Psych) => {
  const ak = a?.attachment;
  const bk = b?.attachment;
  const att = ak && bk ? (ATTACHMENT[`${ak}|${bk}`] ?? 0.6) : 0.5;
  const ll = loveOverlap(a?.loveLanguages, b?.loveLanguages);
  
  return {
    attachment: Math.round(att * 100),
    loveLanguages: Math.round(ll * 100),
    present: { 
      attachment: !!(ak && bk), 
      loveLanguages: !!(a?.loveLanguages?.length && b?.loveLanguages?.length) 
    }
  };
};
