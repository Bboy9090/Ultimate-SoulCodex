import { astroCacheKey } from "./key";
const cache = new Map();
export function withAstroCache(provider) {
    return {
        name: `${provider.name}+cache`,
        async getChart(req) {
            const key = astroCacheKey(req);
            const cached = cache.get(key);
            if (cached) {
                console.log(`[AstroCache] HIT: ${key}`);
                return cached;
            }
            console.log(`[AstroCache] MISS: ${key}`);
            const fresh = await provider.getChart(req);
            cache.set(key, fresh);
            return fresh;
        },
    };
}
