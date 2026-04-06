const PRESSURE_CODES = {
    fight: {
        name: "The Enforcer",
        base: "I confront what's wrong head-on and won't let injustice slide.",
    },
    freeze: {
        name: "The Sentinel",
        base: "I hold my ground quietly until I'm sure of the right move.",
    },
    adapt: {
        name: "The Diplomat",
        base: "I bend without breaking and find a workable middle ground.",
    },
    withdraw: {
        name: "The Watcher",
        base: "I step back, observe, and protect my energy before acting.",
    },
    perform: {
        name: "The Standard-Bearer",
        base: "I raise my performance and refuse to let pressure lower my standards.",
    },
};
export function deriveMoralCode(pressureStyle, nonNegotiables) {
    const entry = PRESSURE_CODES[pressureStyle] ?? PRESSURE_CODES.adapt;
    const top = nonNegotiables.slice(0, 2);
    const nonNegPart = top.length > 0
        ? ` I won't tolerate ${top.join(" or ")}.`
        : "";
    return {
        name: entry.name,
        notes: entry.base + nonNegPart,
    };
}
