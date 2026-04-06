const digitSum = (n) => Math.abs(n)
    .toString()
    .split("")
    .reduce((a, b) => a + Number(b), 0);
const reduce = (n) => {
    while (n > 9)
        n = digitSum(n);
    return n;
};
export function personalYear(birthDate, currentDate) {
    const d = new Date(birthDate);
    const total = digitSum(d.getMonth() + 1) +
        digitSum(d.getDate()) +
        digitSum(currentDate.getFullYear());
    return reduce(total) || 9;
}
// Map personal year (1-9) to a primary phase signal
const YEAR_PHASE_MAP = {
    1: "Ignition",
    2: "Exposure",
    3: "Expansion",
    4: "Construction",
    5: "Friction",
    6: "Integration",
    7: "Refinement",
    8: "Legacy",
    9: "Integration",
};
const YEAR_REASON_MAP = {
    1: "Personal Year 1 is a first-year cycle — raw starts, new directions, momentum before proof.",
    2: "Personal Year 2 is a sensitivity and feedback year — what you built is now visible and reacting.",
    3: "Personal Year 3 is an expression and growth year — doors open, range expands.",
    4: "Personal Year 4 is a foundation year — unglamorous construction work, systems, and discipline.",
    5: "Personal Year 5 is a change and disruption year — old structures are stress-tested.",
    6: "Personal Year 6 is a responsibility and synthesis year — threads of life are converging.",
    7: "Personal Year 7 is an introspection and precision year — go deeper, not broader.",
    8: "Personal Year 8 is a harvest and authority year — what you built is being recognized and scaled.",
    9: "Personal Year 9 is a completion and release year — consolidate before the next cycle starts.",
};
export function getNumerologySignal(birthDate, currentDate) {
    try {
        const py = personalYear(birthDate, currentDate);
        return {
            phase: YEAR_PHASE_MAP[py] ?? "Integration",
            weight: 3,
            reason: YEAR_REASON_MAP[py] ?? `Personal Year ${py} active.`,
        };
    }
    catch {
        return null;
    }
}
