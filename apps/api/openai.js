import { generateText, isGeminiAvailable } from "./gemini";
import { BANNED_PHRASES, stripBannedPhrases, buildResultsPrompt } from "@soulcodex/core";
import { validateAndClean } from "@soulcodex/ai/pipeline";
function generateFallbackBiography(data) {
    const sunSign = data.astrologyData?.sunSign || data.vedicAstrologyData?.sunSign || "";
    const moonSign = data.astrologyData?.moonSign || data.vedicAstrologyData?.moonSign || "";
    const lifePath = data.numerologyData?.lifePath || "";
    // Fallbacks should still match the product voice:
    // - behavior-first
    // - minimal system stacking
    // - ends with a concrete next move
    const templates = [
        `I move through life like a ${data.archetypeTitle}: I scan for what matters, I notice friction early, and I want the next step to be real — not performative.

My strength is focus. When I decide, I can cut distractions fast and build momentum. My shadow is speed turning into pressure: I push for clarity so hard that other people feel rushed, and I stop listening once I think I already know the answer.

The tension I carry is between control and closeness. I want to be understood, but I also protect myself by staying “busy” instead of being direct.

Today’s move: name one thing I’ve been avoiding (a conversation, a decision, or a finish). Put it on the calendar, send the message, or ship the first version — before I overthink it.`,
        `I’m a ${data.archetypeTitle}. I’m built to read patterns and act with intention — not drift.

Strength: I can see what’s not being said in a room and adjust quickly. Shadow: I take on too much, then resent the weight I agreed to carry. I’ll tell myself I’m “helping” when I’m actually controlling the outcome.

If I have ${moonSign ? `${moonSign} Moon` : "a sensitive inner rhythm"}, it shows up as replaying conversations after they’re over — searching for the one line I should have said. If I have ${sunSign ? `${sunSign} Sun` : "a strong drive"}, it shows up as moving anyway, even when I’m not emotionally caught up.

Action: pick one boundary I’ve been hinting at and state it cleanly. No speeches. One sentence. Then follow through.`,
        `I’m not here for vague self-improvement. As a ${data.archetypeTitle}, I want precision: what I do, why I do it, and what it costs.

My default pattern is: I spot the flaw → I try to fix it alone → I get tired → I go quiet. The growth edge is letting the right person in earlier, before I hit the “silent mode.”

${lifePath ? `Life Path ${lifePath} points me toward building something that lasts, not chasing short-lived intensity.` : "I’m built for long arcs, not quick applause."}

Do this today: finish one small unit of work (one page, one email, one decision). Completion is data.`,
    ];
    const randomIndex = Math.floor(Math.random() * templates.length);
    return stripBannedPhrases(templates[randomIndex]);
}
export async function generateBiography(data) {
    if (!isGeminiAvailable()) {
        console.log("Gemini AI not available, using fallback biography generation");
        return generateFallbackBiography(data);
    }
    try {
        const prompt = buildResultsPrompt({
            name: data.name,
            archetypeTitle: data.archetypeTitle,
            sunSign: data.astrologyData?.sunSign,
            moonSign: data.astrologyData?.moonSign,
            risingSign: data.astrologyData?.risingSign,
            lifePath: data.numerologyData?.lifePath,
            expression: data.numerologyData?.expression,
            soulUrge: data.numerologyData?.soulUrge,
            hdType: data.humanDesignData?.type,
            hdAuthority: data.humanDesignData?.authority,
            themes: data.archetype?.themes,
        }, "deep");
        const rawBiography = await generateText({
            model: "gemini-2.5-flash",
            temperature: 0.8,
            prompt
        });
        if (!rawBiography)
            return generateFallbackBiography(data);
        const report = await validateAndClean(rawBiography, (p) => generateText({ model: "gemini-2.5-flash", temperature: 0.85, prompt: p }));
        if (report.rewroteText) {
            console.log(`[Biography] Clarity rewrite triggered. Score: ${report.clarityScore}. Problems: ${report.clarityProblems.join(", ")}`);
        }
        return report.finalText || generateFallbackBiography(data);
    }
    catch (error) {
        console.error("Error generating biography with Gemini AI, using fallback:", error);
        return generateFallbackBiography(data);
    }
}
function generateFallbackDailyGuidance(data) {
    const sun = data.astrologyData?.sunSign || "";
    const lifePath = data.numerologyData?.lifePath || "";
    const guidanceTemplates = [
        `Observation: I’m tempted to “prepare” instead of act — research, organize, rewrite.\n\nMeaning: that’s how I avoid risk while still feeling productive.\n\nAction: choose one deliverable and make it real.\n\nDo this today: ship a first version before noon (even if it’s imperfect).`,
        `Observation: I feel a push to move fast${sun ? ` (${sun} drive)` : ""}.\n\nMeaning: speed helps, but it also makes me skip the one conversation that would prevent rework.\n\nAction: slow down for one checkpoint.\n\nDo this today: ask one direct question you’ve been dancing around, then decide.`,
        `Observation: I’m carrying more than I admitted.\n\nMeaning: when I say yes automatically, I trade my attention for short-term peace.\n\nAction: set one clean boundary.\n\nDo this today: send a one-sentence “no / not yet / here’s what I can do” message and stop negotiating with guilt.${lifePath ? ` (Life Path ${lifePath}: build deliberately.)` : ""}`,
    ];
    const randomIndex = Math.floor(Math.random() * guidanceTemplates.length);
    return stripBannedPhrases(guidanceTemplates[randomIndex]);
}
export async function generateDailyGuidance(data) {
    // If Gemini AI not available, use fallback guidance generator
    if (!isGeminiAvailable()) {
        console.log("Gemini AI not available, using fallback daily guidance generation");
        return generateFallbackDailyGuidance(data);
    }
    try {
        const bannedList = BANNED_PHRASES.map((p) => `"${p}"`).join(", ");
        const prompt = `Write a daily guidance card for ${data.name} in first person (I/my/me).

Profile:
- Archetype: ${data.archetypeTitle}
- Sun/Moon/Rising: ${data.astrologyData?.sunSign}/${data.astrologyData?.moonSign}/${data.astrologyData?.risingSign}
- Life Path: ${data.numerologyData?.lifePath}

RULES:
- Use behavioral language (what I do, avoid, choose, say)
- Lead with the insight; use placements only if they explain why
- Avoid system-stacking (reference 0–2 data points max)
- BANNED PHRASES (never use): ${bannedList}
- No fortune-cookie wisdom, no vague encouragement

Return exactly this structure (no extra headers):
Observation: (1–2 sentences)
Meaning: (1–2 sentences)
Action: (1–2 sentences)
Do this today: (1 sentence, concrete)`;
        const rawGuidance = await generateText({
            model: "gemini-2.5-flash",
            temperature: 0.8,
            prompt
        });
        if (!rawGuidance)
            return generateFallbackDailyGuidance(data);
        const report = await validateAndClean(rawGuidance);
        return report.finalText || generateFallbackDailyGuidance(data);
    }
    catch (error) {
        console.error("Error generating daily guidance with Gemini AI, using fallback:", error);
        return generateFallbackDailyGuidance(data);
    }
}
