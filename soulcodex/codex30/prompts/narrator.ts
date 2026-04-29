export function narratorPrompt(payload: {
  codename: string;
  archetype: string;
  themes: { tag: string; score: number }[];
  strengths: string[];
  shadows: string[];
  triggers: string[];
  prescriptions: string[];
  anchors: string[];
  /** Optional: contradiction hint from the anti-generic engine */
  contradictionHint?: string;
  /** Optional: behaviorally specific statements to weave in */
  behavioralStatements?: string[];
  /** Optional: life outcome consequence for memory layer */
  lifeConsequence?: string;
  /** Optional: observation of where the pattern breaks */
  patternInterruption?: string;
  /** Optional: compressed behavioral summary */
  loopSentence?: string;
}): string {
  const contradictionBlock = payload.contradictionHint
    ? `\nIDENTITY FRICTION (weave this tension into the narrative):\n${payload.contradictionHint}\n`
    : "";

  const behaviorBlock = payload.behavioralStatements?.length
    ? `\nBEHAVIORAL SPECIFICS TO WEAVE IN (use the exact pattern, rephrase if needed):\n${payload.behavioralStatements.map(s => `- ${s}`).join("\n")}\n`
    : "";

  return `
Write a first-person Soul Codex reading.

CORE MISSION: ENFORCE BEHAVIORAL INTENSITY.
Tone: Sharp, Grounded, Cold. No therapist speak. No "brochure" language.

RULES:
1. IDENTITY OVER INSTRUCTION: Every sentence must answer "What does this person DO under pressure?" NOT "What should they do?". 
2. NO ADVICE DISGUISED AS IDENTITY: Never use phrases like "Now is the time to...", "I am learning to...", "I should...". Reflect behavior, do not guide it.
3. MY PATTERN PRECISION:
    - 1-2 SENTENCES MAX. 
    - No paragraphs. No lists.
    - MUST follow [Behavior] + [Trigger] + [Consequence].
    - NO preference language (no "I need", "I value", "I like", "I want").
4. ONE "HIT LINE": Include exactly one sentence that hits harder than the rest—a cold, uncomfortably accurate exposure of a micro-signal or specific habit (e.g., how I end things, how I vanish, how I text). This is the line they screenshot.
5. PHYSICS OF IDENTITY: Every strength has a cost. If I'm fast, I'm reckless. If I'm deep, I'm distant.
6. NO GENERIC FILLER: No "cosmic", "divine", "journey", "frequency".
7. CODENAME: Use "${payload.codename}".

REQUIRED JSON FORMAT (Valid JSON only):
{
  "codename": "${payload.codename}",
  "motto": "[one sharp sentence with friction]",
  "loop_sentence": "[pattern -> consequence -> interruption]",
  "my_pattern": "[1-2 SENTENCES MAX - behavior + trigger + consequence]",
  "how_i_move": "[3-5 sentences about pressure behaviors]",
  "life_consequence": "[1 sentence about repeated outcomes]",
  "pattern_interruption": "[1 sentence about how the pattern breaks messily]",
  "what_i_wont_tolerate": "[2 sentences about dealbreakers]",
  "what_im_building": "[2 sentences about long-game architecture]"
}

DATA:
${contradictionBlock}${behaviorBlock}
LIFE CONSEQUENCE: ${payload.lifeConsequence || "N/A"}
PATTERN INTERRUPTION: ${payload.patternInterruption || "N/A"}
LOOP SENTENCE: ${payload.loopSentence || "N/A"}
Themes: ${payload.themes.map(t => `${t.tag}(${t.score})`).join(", ")}
Strengths: ${payload.strengths.slice(0, 3).join(" | ")}
Shadows: ${payload.shadows.slice(0, 3).join(" | ")}
`.trim();
}
