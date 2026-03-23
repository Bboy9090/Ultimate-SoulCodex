export interface TodayCardData {
  codename: string;
  title: string;
  focus: string;
  doList: string[];
  dontList: string[];
  watchouts: string[];
  decisionAdvice: string;
  moonPhase: string;
  personalDayNumber: number;
  confidenceLabel: string;
  topTheme?: string;
  date: string;
}

const DAY_DO: Record<number, string[]> = {
  1: ["Start the one thing you've been circling", "Initiate — don't wait for permission", "Trust your first instinct today"],
  2: ["Listen before you speak", "Let a partnership carry some weight", "Resolve one tension with honesty"],
  3: ["Say what's actually on your mind", "Make something — write, build, draw", "Connect with someone who challenges you"],
  4: ["Organize one thing that's been messy", "Block time for uninterrupted work", "Finish what you started last week"],
  5: ["Move — change your environment", "Say yes to something outside routine", "Clear one thing from the stale pile"],
  6: ["Support someone without keeping score", "Repair something you've been avoiding", "Create a moment of order at home"],
  7: ["Go quiet for an hour — no input", "Research or study something deep", "Trust the pattern you keep seeing"],
  8: ["Make one bold financial or strategic call", "Take responsibility for something you've delayed", "Set a boundary that protects your build"],
  9: ["Complete or close one chapter", "Give something away — time, knowledge, energy", "Reflect on what this cycle taught you"]
};

const DAY_DONT: Record<number, string[]> = {
  1: ["Defer to others when you know the answer", "Overthink before acting", "Let perfectionism stall the first move"],
  2: ["Force outcomes before they're ready", "Argue when you should be listening", "Let pride block collaboration"],
  3: ["Stay silent when you have something real to say", "Suppress creativity to look 'professional'", "Spend the day in pure reaction mode"],
  4: ["Start something new before the old is done", "Ignore structure because it feels boring", "Skip the plan and wing it today"],
  5: ["Stay in the same loop hoping for different results", "Commit to anything you're not actually ready for", "Let fear of the unknown keep you static"],
  6: ["Neglect your own needs to fix everyone else", "Avoid a difficult but necessary conversation", "Say yes when you mean no"],
  7: ["Make a big decision based on noise", "Expose your process before it's ready", "Seek validation for a choice only you can make"],
  8: ["Back down from something you've already committed to", "Let others define the terms", "Spend energy on the small when the big is waiting"],
  9: ["Hold on to what's already finished", "Start a new project before closing the current one", "Ignore what this period is trying to teach you"]
};

const DAY_WATCHOUTS: Record<number, string[]> = {
  1: ["Impatience with people moving slower than you", "Starting strong, losing steam by afternoon"],
  2: ["Over-accommodating — you may lose your own thread", "Emotional undercurrents in group dynamics"],
  3: ["Scattered energy that spreads thin", "Saying more than you meant to"],
  4: ["Frustration when results don't match the effort", "Rigidity passing as discipline"],
  5: ["Impulsive decisions that feel liberating but cost you later", "Restlessness masking avoidance"],
  6: ["Over-responsibility for others' problems", "Resentment building from unspoken needs"],
  7: ["Overthinking replacing action", "Isolation deepening rather than refreshing"],
  8: ["Pressure creating tunnel vision", "Ignoring feedback from people who see what you don't"],
  9: ["Nostalgia slowing forward movement", "Completion anxiety — finishing feels like loss"]
};

const DECISION_ADVICE: Record<string, string> = {
  calm_logic:     "Your clearest thinking lands between 10am and noon. Lock big decisions into that window.",
  sleep_on_it:    "Don't finalize anything today that you haven't slept on. Your best answer will come tonight.",
  quiet_instinct: "The first signal you got this morning is probably right. Trust it before the noise builds.",
  willpower:      "Commit early and hold the line. Second-guessing costs you more energy than following through.",
  gut_yes_no:     "If you can't feel a clear yes, it's a no. Trust the silence.",
  analysis:       "Map the decision before noon, choose by 2pm. More data after that won't help you.",
  gut:            "Your intuition is ahead of your logic today. Move on the feeling.",
  consensus:      "Check your thinking with one trusted person before acting. One voice, not five.",
  impulse:        "Notice which impulses have energy and which have anxiety. Act on energy. Pause on anxiety.",
  avoidance:      "Pick the thing you've been avoiding longest. Address it first — the rest is easier after."
};

const MOON_TITLE_PREFIX: Record<string, string> = {
  "new moon":        "Seed",
  "waxing crescent": "Build",
  "first quarter":   "Push",
  "waxing gibbous":  "Refine",
  "full moon":       "Release",
  "waning gibbous":  "Integrate",
  "third quarter":   "Decide",
  "waning crescent": "Rest",
  "balsamic":        "Clear"
};

export function buildTodayCard(
  horoscopeData: any,
  profile: any,
  codexSynthesis?: any
): TodayCardData {
  const dayNum = Math.min(9, Math.max(1, horoscopeData?.personalDayNumber ?? 4));
  const moonPhase = (horoscopeData?.moonPhase?.phase ?? "Full Moon").toLowerCase();
  const moonPrefix = MOON_TITLE_PREFIX[moonPhase] ?? "Focus";

  const decisionStyle: string =
    profile?.signals?.decisionStyle ??
    profile?.userInputs?.decisionStyle ??
    "";

  const confidence = profile?.confidence ?? profile?.meta?.confidence;
  const confidenceLabel = confidence?.label ?? confidence?.badge ?? "Unverified";

  const codename = codexSynthesis?.codename ?? profile?.archetype?.name ?? "The Quiet Builder";
  const topTheme = codexSynthesis?.topThemes?.[0]?.tag ?? "precision";

  const topTransit = horoscopeData?.personalTransits?.[0];
  let focus = `Personal Day ${dayNum} — a ${moonPrefix.toLowerCase()} phase for ${
    topTheme.replace(/_/g, " ")
  }. ${topTransit ? topTransit.description?.slice(0, 80) + "." : "Stay in your build lane today."}`;

  if (focus.length > 120) focus = focus.slice(0, 117) + "…";

  const dayIndex = ((dayNum - 1) % 9) + 1;

  return {
    codename,
    title: `Day ${dayNum} — ${moonPrefix}`,
    focus,
    doList: (DAY_DO[dayIndex] ?? DAY_DO[4]).slice(0, 3),
    dontList: (DAY_DONT[dayIndex] ?? DAY_DONT[4]).slice(0, 3),
    watchouts: (DAY_WATCHOUTS[dayIndex] ?? DAY_WATCHOUTS[4]).slice(0, 2),
    decisionAdvice: DECISION_ADVICE[decisionStyle] ?? "Give your decision time to breathe before committing. Clarity comes after the noise settles.",
    moonPhase: horoscopeData?.moonPhase?.phase ?? "Full Moon",
    personalDayNumber: dayNum,
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
