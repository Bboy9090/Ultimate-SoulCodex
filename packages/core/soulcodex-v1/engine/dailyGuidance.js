function topTrait(traits, prefix) {
    const filtered = prefix ? traits.filter((t) => t.trait_key.startsWith(prefix)) : traits;
    if (filtered.length === 0)
        return null;
    return filtered.slice().sort((a, b) => Math.abs(b.value) - Math.abs(a.value))[0] ?? null;
}
function pickDailyStatement(statements, tone) {
    const toneMatches = statements.filter((s) => s.tone === tone);
    const pool = (toneMatches.length ? toneMatches : statements).filter((s) => s.confidence !== "low");
    if (pool.length === 0)
        return null;
    // deterministic pick: stable sort by id
    return pool.slice().sort((a, b) => a.id.localeCompare(b.id))[0] ?? null;
}
export function buildDailyGuidance(input) {
    const focusStatement = pickDailyStatement(input.dailyStatements, input.toneMode);
    const focus = focusStatement?.text ?? "Protect your attention before you protect your schedule.";
    const work = topTrait(input.traits, "work_");
    const decision = topTrait(input.traits, "decision_");
    const relation = topTrait(input.traits, "rel_");
    const doList = [];
    const dontList = [];
    const watchOuts = [];
    if (work?.trait_key === "work_structure" && work.value > 0)
        doList.push("Set one clear constraint before you start");
    if (work?.trait_key === "work_adaptability" && work.value > 0)
        doList.push("Keep the plan light; iterate in small passes");
    if (decision?.trait_key === "decision_wait" && decision.value > 0)
        doList.push("Wait for clarity; decide after the data settles");
    if (decision?.trait_key === "decision_fast" && decision.value > 0)
        doList.push("Choose quickly on low-stakes items to keep momentum");
    if (relation?.trait_key === "rel_depth" && relation.value > 0)
        doList.push("Name the real topic; skip surface debate");
    if (relation?.trait_key === "rel_independence" && relation.value > 0)
        doList.push("Protect a small pocket of solo time");
    if (work?.trait_key === "work_structure" && work.value > 0)
        dontList.push("Open too many loops at once");
    if (decision?.trait_key === "decision_wait" && decision.value > 0)
        dontList.push("Force a decision to relieve pressure");
    if (relation?.trait_key === "rel_depth" && relation.value > 0)
        dontList.push("Over-explain to people who aren’t listening");
    if (work?.trait_key === "work_adaptability" && work.value > 0)
        watchOuts.push("Drifting without a finish line");
    if (decision?.trait_key === "decision_fast" && decision.value > 0)
        watchOuts.push("Speed used as avoidance");
    if (relation?.trait_key === "rel_independence" && relation.value > 0)
        watchOuts.push("Self-isolating instead of restoring");
    if (doList.length === 0)
        doList.push("Observe before committing", "Clean one system that is draining you", "Choose depth over reaction");
    if (dontList.length === 0)
        dontList.push("Force clarity", "Argue with obvious patterns", "Stay too long in draining environments");
    if (watchOuts.length === 0)
        watchOuts.push("Mental looping", "Absorbing other people's chaos");
    const decision_advice = decision?.trait_key === "decision_wait" && decision.value > 0
        ? "Decide after you have a clean map — not inside emotional static."
        : "Do not decide inside emotional static.";
    return {
        title: "Today’s Guidance",
        focus,
        do: doList.slice(0, 3),
        dont: dontList.slice(0, 3),
        watch_outs: watchOuts.slice(0, 3),
        decision_advice,
    };
}
