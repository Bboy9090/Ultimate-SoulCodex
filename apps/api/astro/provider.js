import { withAstroCache } from "./cachedProvider";
import { localAstroProvider } from "./providers/localProvider";
let _provider = null;
export function getAstroProvider() {
    if (!_provider) {
        _provider = withAstroCache(localAstroProvider);
    }
    return _provider;
}
