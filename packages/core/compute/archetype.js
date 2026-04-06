const ELEMENTS = [
    "Iron",
    "Ocean",
    "Solar",
    "Stone",
    "Storm",
    "Ember",
    "Frost",
    "Silk",
    "Thorn",
    "Ash",
    "Copper",
    "Coral",
];
const ROLES = [
    "Architect",
    "Sage",
    "Catalyst",
    "Sentinel",
    "Navigator",
    "Healer",
    "Strategist",
    "Rebel",
    "Builder",
    "Weaver",
    "Scout",
    "Anchor",
];
const TAGLINES = {
    "Iron Architect": "I design systems that outlast me.",
    "Ocean Sage": "I feel first, then I know.",
    "Solar Catalyst": "I ignite what others are afraid to start.",
    "Stone Sentinel": "I hold the line when everything shakes.",
    "Storm Navigator": "I thrive in chaos and find the path through.",
    "Ember Healer": "I stay warm long after the fire dies down.",
    "Frost Strategist": "I think clearly when everyone else panics.",
    "Silk Rebel": "I disrupt gently — and it sticks.",
    "Thorn Builder": "I protect what I create.",
    "Ash Weaver": "I make something new from what burned down.",
    "Copper Scout": "I spot the opening before anyone else moves.",
    "Coral Anchor": "I grow slowly, and I don't break.",
};
function defaultTagline(element, role) {
    return TAGLINES[`${element} ${role}`] ?? `I move through life as the ${element} ${role}.`;
}
function signIndex(sign) {
    if (!sign)
        return 0;
    const signs = [
        "aries", "taurus", "gemini", "cancer", "leo", "virgo",
        "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
    ];
    const idx = signs.indexOf(sign.toLowerCase());
    return idx >= 0 ? idx : 0;
}
export function chooseArchetype(signals) {
    const sunIdx = signIndex(signals.sunSign);
    const elementIdx = (sunIdx + signals.lifePath) % ELEMENTS.length;
    const roleIdx = (signals.lifePath +
        (signals.moonSign ? signIndex(signals.moonSign) : 0)) %
        ROLES.length;
    const element = ELEMENTS[elementIdx];
    const role = ROLES[roleIdx];
    const name = `${element} ${role}`;
    const tagline = defaultTagline(element, role);
    return { name, tagline, element, role };
}
