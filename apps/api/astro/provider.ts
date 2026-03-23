import type { AstroProvider } from "./types";
import { withAstroCache } from "./cachedProvider";
import { localAstroProvider } from "./providers/localProvider";

let _provider: AstroProvider | null = null;

export function getAstroProvider(): AstroProvider {
  if (!_provider) {
    _provider = withAstroCache(localAstroProvider);
  }
  return _provider;
}
