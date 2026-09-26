import { getPersonalDayLabel } from "@soulcodex/core";

export interface TodayCardData {
  codename: string;
  title: string;
  focus: string;
  doList: string[];
  dontList: string[];
  watchouts: string[];
  decisionAdvice: string;
  moonPhase: string;
  personalDayNumber: number | null;
  personalDayLabel: string;
  confidenceLabel: string;
  topTheme?: string;
  date: string;
  tomorrowTension?: string;
  memoryCallout?: string;
}

const DAY_DO: Record<number, string[]> = {
  1: ["Pick one useful beginning and take its first concrete step", "Choose a small action you can initiate without waiting for perfect certainty", "Write down your first instinct, then check it against the facts"],
  2: ["Listen long enough to understand before responding", "Ask where collaboration would actually reduce friction", "Name one tension clearly and address the part you can influence"],
  3: ["Express one idea clearly instead of scattering attention", "Make something concrete — write, build, sketch, or prototype", "Have one conversation that adds a useful perspective"],
  4: ["Organize one messy area that is slowing progress", "Protect one focused work block", "Finish one existing task before opening another"],
  5: ["Change one routine deliberately and observe the effect", "Try one low-cost option outside the usual pattern", "Clear one stale commitment, file, or task that no longer helps"],
  6: ["Offer support without taking over someone else's responsibility", "Repair one avoidable point of friction", "Create one practical improvement in the home or daily routine"],
  7: ["Reduce input for a while and review what you already know", "Research one question deeply enough to improve a real decision", "Write down the pattern you notice and look for evidence for and against it"],
  8: ["Review one important financial or strategic decision before acting", "Take responsibility for one delayed obligation", "Set one boundary that protects a real priority"],
  9: ["Complete or formally close one unfinished item", "Share time, knowledge, or resources only where it is genuinely useful", "Review what this cycle taught you without treating the symbolism as a prediction"]
};

const DAY_DONT: Record<number, string[]> = {
  1: ["Treat urgency as proof that an action is correct", "Keep analyzing after the next useful step is already clear", "Let perfectionism block a low-risk first move"],
  2: ["Force agreement before the other person has been heard", "Argue past useful information", "Confuse cooperation with abandoning your own position"],
  3: ["Say more just to fill space", "Hide a useful idea because it is unfinished", "Let constant reaction replace deliberate expression"],
  4: ["Open several new tasks while important existing work is unfinished", "Reject structure only because it feels repetitive", "Skip a necessary plan for a high-cost decision"],
  5: ["Change something important only to escape boredom", "Commit before checking the cost and consequences", "Treat novelty as automatically better"],
  6: ["Take responsibility for problems that are not yours", "Delay a necessary repair conversation indefinitely", "Agree when your actual capacity says otherwise"],
  7: ["Make a high-stakes decision from noise or isolation alone", "Publish unfinished work before its purpose is clear", "Collect validation instead of testing the reasoning"],
  8: ["Double down on a commitment only because it already consumed effort", "Accept terms you have not reviewed", "Make a financial move because the day symbolism says to be bold"],
  9: ["Keep an obligation only because it is familiar", "Start a replacement project before deciding what is actually complete", "Treat closure symbolism as proof that something must end"]
};

const DAY_WATCHOUTS: Record<number, string[]> = {
  1: ["Notice whether urgency is turning into impatience", "Check whether an energetic start has a realistic follow-through"],
  2: ["Notice whether accommodation is erasing your own position", "Check for assumptions about other people's emotions before acting on them"],
  3: ["Watch for attention spreading across too many ideas", "Pause before saying more than the situation needs"],
  4: ["Separate slow results from evidence that the method is wrong", "Check whether discipline has become unnecessary rigidity"],
  5: ["Pause before treating an impulse as liberation", "Ask whether restlessness is pointing to a real problem or simple boredom"],
  6: ["Check whether support has turned into over-responsibility", "Name needs early instead of assuming resentment proves what others should know"],
  7: ["Watch for analysis replacing the next useful action", "Make sure solitude is helping rather than cutting off useful feedback"],
  8: ["Check whether pressure is narrowing the evidence you are willing to see", "Review relevant feedback before increasing commitment"],
  9: ["Notice whether familiarity is delaying a necessary review", "Treat feelings about completion as information, not proof that you should stay or leave"]
};

const NEUTRAL_DO = [
  "Choose one concrete priority and finish the next useful step",
  "Use observed facts before symbolic interpretation",
  "Record what actually happens so tomorrow has better evidence",
];

const NEUTRAL_DONT = [
  "Invent a personal cycle from missing birth data",
  "Treat symbolic guidance as a guaranteed prediction",
  "Force a decision because a placeholder says today is special",
];

const NEUTRAL_WATCHOUTS = [
  "Filling missing evidence with certainty",
  "Confusing a reflection prompt with a measured outcome",
];

const DECISION_ADVICE: Record<string, string> = {
  calm_logic:     "I slow the decision down enough to separate facts, assumptions, and preferences before I commit.",
  sleep_on_it:    "For a non-urgent decision, I give myself another review after rest instead of forcing certainty now.",
  quiet_instinct: "I notice my first reaction, then compare it with the facts before treating it as guidance.",
  willpower:      "I check whether the commitment still matches my goal before I spend more effort defending it.",
  gut_yes_no:     "I treat a strong yes/no feeling as one input, then check it against consequences and constraints.",
  analysis:       "I define what information would actually change the decision, then stop collecting data once that threshold is met.",
  gut:            "I record the intuitive signal and test it against observable evidence before acting on it.",
  consensus:      "I ask one relevant person for a useful counterpoint, then make the decision from the full evidence I have.",
  impulse:        "I separate urgency from importance and give high-cost impulses a deliberate review before acting.",
  avoidance:      "I name what I am avoiding, identify the smallest concrete next step, and decide whether it truly belongs on today's list."
};

const DAY_TITLE_LABELS: Record<number, string> = {
  1: "Initiate",
  2: "Connect",
  3: "Express",
  4: "Build",
  5: "Shift",
  6: "Tend",
  7: "Reflect",
  8: "Command",
  9: "Release",
};

const DAY_THEME_DESC: Record<number, string> = {
  1: "a starting phase for bold moves, independence, and forward momentum",
  2: "a receptive phase for listening, partnerships, and patience",
  3: "a creative phase for speaking up, sharing, and social energy",
  4: "a structure phase for order, discipline, and follow-through",
  5: "a change phase for movement, freedom, and clearing the stale",
  6: "a responsibility phase for home, health, and showing up",
  7: "an inner phase for study, solitude, and trusting the pattern",
  8: "a power phase for bold calls, boundaries, and leverage",
  9: "a completion phase for closing chapters, giving, and letting go",
};

export function buildTodayCard(
  horoscopeData: any,
  profile: any,
  codexSynthesis?: any
): TodayCardData {
  const rawDay = horoscopeData?.personalDayNumber;
  const dayNum =
    Number.isInteger(rawDay) && [1,2,3,4,5,6,7,8,9,11,22,33].includes(rawDay)
      ? rawDay as number
      : null;
  const dayLabel = dayNum === null ? "Unavailable" : getPersonalDayLabel(dayNum);
  const moonPhaseValue =
    typeof horoscopeData?.moonPhase?.phase === "string" &&
    horoscopeData.moonPhase.phase.trim()
      ? horoscopeData.moonPhase.phase.trim()
      : "Unavailable";
  const moonPhase = moonPhaseValue.toLowerCase();
  const moonPrefix = MOON_TITLE_PREFIX[moonPhase] ?? "Focus";

  const decisionStyle: string =
    profile?.userInputs?.decisionStyle ??
    "";

  const confidence = profile?.confidence ?? profile?.meta?.confidence;
  const confidenceLabel = confidence?.label ?? confidence?.badge ?? "Unverified";

  const codename = codexSynthesis?.codename ?? profile?.archetype?.name ?? "Identity unresolved";
  const topTheme =
    typeof codexSynthesis?.topThemes?.[0]?.tag === "string" &&
    codexSynthesis.topThemes[0].tag.trim()
      ? codexSynthesis.topThemes[0].tag.trim()
      : undefined;

  const topTransit = horoscopeData?.personalTransits?.[0];
  let focus =
    dayNum === null
      ? `Personal Day unavailable — I use only the evidence actually present today. ${topTransit ? topTransit.description?.slice(0, 80) + "." : "I keep the reflection general instead of inventing a cycle."}`
      : `Personal Day ${dayNum} — a ${dayLabel.toLowerCase()} reflection${
          topTheme ? ` with emphasis on ${topTheme.replace(/_/g, " ")}` : ""
        }. ${topTransit ? topTransit.description?.slice(0, 80) + "." : "I use this as a reflection prompt, not a prediction."}`;

  if (focus.length > 160) focus = focus.slice(0, 157) + "…";

  const dayIndex =
    dayNum === 11 ? 2 :
    dayNum === 22 ? 4 :
    dayNum === 33 ? 6 :
    dayNum;

  return {
    codename,
    title: dayNum === null ? "Today — Evidence First" : `Day ${dayNum} — ${dayLabel}`,
    focus,
    doList: dayIndex === null ? NEUTRAL_DO : (DAY_DO[dayIndex] ?? NEUTRAL_DO).slice(0, 3),
    dontList: dayIndex === null ? NEUTRAL_DONT : (DAY_DONT[dayIndex] ?? NEUTRAL_DONT).slice(0, 3),
    watchouts: dayIndex === null ? NEUTRAL_WATCHOUTS : (DAY_WATCHOUTS[dayIndex] ?? NEUTRAL_WATCHOUTS).slice(0, 2),
    decisionAdvice: DECISION_ADVICE[decisionStyle] ?? "I let my decision breathe before committing. Clarity comes after the noise settles.",
    moonPhase: moonPhaseValue,
    personalDayNumber: dayNum,
    personalDayLabel: dayLabel,
    confidenceLabel,
    topTheme,
    date: horoscopeData?.date ?? new Date().toISOString().slice(0, 10)
  };
}

export function buildTodayCardSvg(card: TodayCardData, format: "square" | "story"): string {
  const W = 1080;
  const H = format === "story" ? 1920 : 1080;
  const PAD = 80;

  const PURPLE  = "#7c3aed";
  const GOLD    = "#d4af37";
  const TEXT    = "#e8e6ff";
  const MUTED   = "rgba(232,230,255,0.5)";
  const BG_DARK = "#0a0a1a";
  const BG_CARD = "rgba(15,20,40,0.95)";

  const confColor =
    card.confidenceLabel === "Verified"   ? "#22c55e" :
    card.confidenceLabel === "Partial"    ? "#f59e0b" : "#6b7280";

  const bullets = (items: string[], icon: string, color: string, x: number, y: number, maxW: number): string => {
    return items.map((item, i) => {
      const text = item.length > 55 ? item.slice(0, 52) + "…" : item;
      return `
        <text x="${x}" y="${y + i * 52}" fill="${color}" font-size="26" font-family="Georgia, serif" opacity="0.8">${icon}</text>
        <text x="${x + 30}" y="${y + i * 52}" fill="${TEXT}" font-size="26" font-family="Georgia, serif" opacity="0.85"
          textLength="${maxW - 30}" lengthAdjust="spacingAndGlyphs">${escapeXml(text)}</text>
      `;
    }).join("");
  };

  if (format === "story") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0d0d2b"/>
          <stop offset="100%" stop-color="#050510"/>
        </linearGradient>
        <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="${PURPLE}"/>
          <stop offset="100%" stop-color="${GOLD}"/>
        </linearGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#bg)"/>
      <rect x="${PAD}" y="${PAD}" width="${W - PAD*2}" height="${H - PAD*2}" rx="32" fill="${BG_CARD}" stroke="${PURPLE}" stroke-width="1" stroke-opacity="0.3"/>
      <rect x="${PAD}" y="${PAD}" width="${W - PAD*2}" height="6" rx="3" fill="url(#accent)"/>

      <text x="${W/2}" y="200" text-anchor="middle" fill="${GOLD}" font-size="28" font-family="Georgia, serif" letter-spacing="8" opacity="0.7">SOUL CODEX</text>
      <text x="${W/2}" y="310" text-anchor="middle" fill="${TEXT}" font-size="68" font-family="Georgia, serif" font-weight="bold">${escapeXml(card.title)}</text>
      <text x="${W/2}" y="380" text-anchor="middle" fill="${MUTED}" font-size="30" font-family="Georgia, serif">${escapeXml(card.moonPhase)}</text>

      <line x1="${PAD + 60}" y1="430" x2="${W - PAD - 60}" y2="430" stroke="${PURPLE}" stroke-width="1" stroke-opacity="0.4"/>

      <text x="${W/2}" y="490" text-anchor="middle" fill="${GOLD}" font-size="22" font-family="Georgia, serif" letter-spacing="6">FOCUS</text>
      <text x="${W/2}" y="540" text-anchor="middle" fill="${TEXT}" font-size="32" font-family="Georgia, serif" opacity="0.9" style="white-space:pre-wrap">${escapeXml(card.focus.slice(0, 80))}</text>
      ${card.focus.length > 80 ? `<text x="${W/2}" y="582" text-anchor="middle" fill="${TEXT}" font-size="32" font-family="Georgia, serif" opacity="0.9">${escapeXml(card.focus.slice(80, 160))}</text>` : ""}

      <text x="${PAD + 60}" y="670" fill="${GOLD}" font-size="22" letter-spacing="6" font-family="Georgia, serif">DO</text>
      ${bullets(card.doList, "✓", "#22c55e", PAD + 60, 710, W - PAD*2 - 120)}

      <text x="${PAD + 60}" y="880" fill="${GOLD}" font-size="22" letter-spacing="6" font-family="Georgia, serif">DON'T</text>
      ${bullets(card.dontList, "×", "#ef4444", PAD + 60, 920, W - PAD*2 - 120)}

      <text x="${PAD + 60}" y="1130" fill="${GOLD}" font-size="22" letter-spacing="6" font-family="Georgia, serif">WATCH</text>
      ${bullets(card.watchouts, "▪", "#f59e0b", PAD + 60, 1170, W - PAD*2 - 120)}

      <line x1="${PAD + 60}" y1="1310" x2="${W - PAD - 60}" y2="1310" stroke="${PURPLE}" stroke-width="1" stroke-opacity="0.4"/>
      <text x="${W/2}" y="1370" text-anchor="middle" fill="${GOLD}" font-size="22" letter-spacing="6" font-family="Georgia, serif">DECISION</text>
      <text x="${W/2}" y="1420" text-anchor="middle" fill="${TEXT}" font-size="28" font-family="Georgia, serif" opacity="0.85">${escapeXml(card.decisionAdvice.slice(0, 70))}</text>
      ${card.decisionAdvice.length > 70 ? `<text x="${W/2}" y="1458" text-anchor="middle" fill="${TEXT}" font-size="28" font-family="Georgia, serif" opacity="0.85">${escapeXml(card.decisionAdvice.slice(70, 140))}</text>` : ""}

      <rect x="${W/2 - 120}" y="${H - 280}" width="240" height="60" rx="30" fill="${PURPLE}" fill-opacity="0.2" stroke="${PURPLE}" stroke-width="1" stroke-opacity="0.5"/>
      <text x="${W/2}" y="${H - 243}" text-anchor="middle" fill="${confColor}" font-size="24" font-family="Georgia, serif" letter-spacing="3">${escapeXml(card.confidenceLabel)}</text>

      <text x="${W/2}" y="${H - 160}" text-anchor="middle" fill="${GOLD}" font-size="20" font-family="Georgia, serif" opacity="0.6">${escapeXml(card.codename)}</text>
      <text x="${W/2}" y="${H - 110}" text-anchor="middle" fill="${MUTED}" font-size="22" font-family="Georgia, serif">soulcodex.app</text>
    </svg>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${W}" viewBox="0 0 ${W} ${W}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0d0d2b"/>
        <stop offset="100%" stop-color="#050510"/>
      </linearGradient>
      <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${PURPLE}"/>
        <stop offset="100%" stop-color="${GOLD}"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${W}" fill="url(#bg)"/>
    <rect x="${PAD}" y="${PAD}" width="${W - PAD*2}" height="${W - PAD*2}" rx="28" fill="${BG_CARD}" stroke="${PURPLE}" stroke-width="1" stroke-opacity="0.3"/>
    <rect x="${PAD}" y="${PAD}" width="${W - PAD*2}" height="5" rx="2" fill="url(#accent)"/>

    <text x="${W/2}" y="155" text-anchor="middle" fill="${GOLD}" font-size="22" font-family="Georgia, serif" letter-spacing="8" opacity="0.7">SOUL CODEX</text>
    <text x="${W/2}" y="230" text-anchor="middle" fill="${TEXT}" font-size="58" font-family="Georgia, serif" font-weight="bold">${escapeXml(card.title)}</text>
    <text x="${W/2}" y="278" text-anchor="middle" fill="${MUTED}" font-size="26" font-family="Georgia, serif">${escapeXml(card.moonPhase)}</text>

    <line x1="${PAD + 60}" y1="310" x2="${W - PAD - 60}" y2="310" stroke="${PURPLE}" stroke-width="1" stroke-opacity="0.4"/>

    <text x="${W/2}" y="358" text-anchor="middle" fill="${TEXT}" font-size="28" font-family="Georgia, serif" opacity="0.9">${escapeXml(card.focus.slice(0, 70))}</text>
    ${card.focus.length > 70 ? `<text x="${W/2}" y="396" text-anchor="middle" fill="${TEXT}" font-size="28" font-family="Georgia, serif" opacity="0.9">${escapeXml(card.focus.slice(70, 140))}</text>` : ""}

    <text x="${PAD + 60}" y="450" fill="${GOLD}" font-size="18" letter-spacing="6" font-family="Georgia, serif">DO</text>
    ${bullets(card.doList, "✓", "#22c55e", PAD + 60, 480, 420)}

    <text x="${W/2 + 20}" y="450" fill="${GOLD}" font-size="18" letter-spacing="6" font-family="Georgia, serif">DON'T</text>
    ${bullets(card.dontList, "×", "#ef4444", W/2 + 20, 480, 420)}

    <line x1="${PAD + 60}" y1="650" x2="${W - PAD - 60}" y2="650" stroke="${PURPLE}" stroke-width="1" stroke-opacity="0.3"/>

    <text x="${PAD + 60}" y="694" fill="${GOLD}" font-size="18" letter-spacing="6" font-family="Georgia, serif">WATCH</text>
    ${bullets(card.watchouts, "▪", "#f59e0b", PAD + 60, 724, W - PAD*2 - 120)}

    <text x="${W/2}" y="850" text-anchor="middle" fill="${TEXT}" font-size="24" font-family="Georgia, serif" opacity="0.8">${escapeXml(card.decisionAdvice.slice(0, 65))}</text>
    ${card.decisionAdvice.length > 65 ? `<text x="${W/2}" y="882" text-anchor="middle" fill="${TEXT}" font-size="24" font-family="Georgia, serif" opacity="0.8">${escapeXml(card.decisionAdvice.slice(65, 130))}</text>` : ""}

    <text x="${W/2}" y="970" text-anchor="middle" fill="${confColor}" font-size="20" font-family="Georgia, serif" letter-spacing="3">${escapeXml(card.confidenceLabel)}</text>
    <text x="${W/2}" y="1010" text-anchor="middle" fill="${MUTED}" font-size="20" font-family="Georgia, serif">soulcodex.app</text>
  </svg>`;
}

function escapeXml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
