function asNumber(x) {
    if (typeof x === "number" && Number.isFinite(x))
        return x;
    if (typeof x === "string" && x.trim()) {
        const n = Number(x);
        return Number.isFinite(n) ? n : null;
    }
    return null;
}
function pick(obj, key) {
    if (!obj)
        return undefined;
    return obj[key];
}
function uniqueSources(sources) {
    const out = [];
    for (const s of sources)
        if (!out.includes(s))
            out.push(s);
    return out;
}
function mergeConfidence(a, b) {
    const rank = { low: 0, medium: 1, high: 2 };
    return rank[a] >= rank[b] ? a : b;
}
function upgradeConfidenceForConvergence(conf, sourceCount) {
    if (sourceCount >= 2 && conf === "medium")
        return "high";
    if (sourceCount >= 2 && conf === "low")
        return "medium";
    return conf;
}
export function mapTraitSignals(input, matrix) {
    const astro = (input.astrology ?? null);
    const hd = (input.human_design ?? null);
    const num = (input.numerology ?? null);
    const signals = [];
    for (const entry of matrix.entries) {
        const srcObj = entry.source === "astrology" ? astro : entry.source === "human_design" ? hd : num;
        const rawVal = pick(srcObj, entry.signal_key);
        const n = asNumber(rawVal);
        if (n == null)
            continue;
        // If the input signal is present, emit a scaled trait value (matrix entry provides direction + intensity).
        // Keep deterministic: clamp to [-10, 10].
        const scaled = Math.max(-10, Math.min(10, Math.round((n >= 1 ? 1 : -1) * entry.value)));
        signals.push({
            trait_key: entry.trait_key,
            value: scaled,
            confidence: entry.confidence,
            sources: [entry.source],
        });
    }
    return consolidateSignals(signals);
}
export function consolidateSignals(signals) {
    const byKey = new Map();
    for (const s of signals) {
        const prev = byKey.get(s.trait_key);
        if (!prev) {
            byKey.set(s.trait_key, { ...s, sources: uniqueSources(s.sources) });
            continue;
        }
        const mergedSources = uniqueSources([...prev.sources, ...s.sources]);
        const mergedValue = Math.max(-10, Math.min(10, prev.value + s.value));
        const mergedConfidence = upgradeConfidenceForConvergence(mergeConfidence(prev.confidence, s.confidence), mergedSources.length);
        byKey.set(s.trait_key, {
            trait_key: s.trait_key,
            value: mergedValue,
            confidence: mergedConfidence,
            sources: mergedSources,
            notes: prev.notes ?? s.notes,
        });
    }
    return [...byKey.values()].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
}
export function extractActiveSources(signals) {
    const out = [];
    for (const s of signals)
        for (const src of s.sources)
            if (!out.includes(src))
                out.push(src);
    return out;
}
