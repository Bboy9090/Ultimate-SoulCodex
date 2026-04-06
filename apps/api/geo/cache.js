const geoCache = new Map();
function cacheKey(query) {
    return `geo:v1:${query.trim().toLowerCase()}`;
}
export function getGeoCached(query) {
    return geoCache.get(cacheKey(query));
}
export function setGeoCached(query, result) {
    geoCache.set(cacheKey(query), result);
}
