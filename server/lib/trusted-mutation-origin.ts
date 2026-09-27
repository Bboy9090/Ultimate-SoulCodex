import type { RequestHandler } from "express";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function isTrustedMutationOrigin(
  method: string,
  origin: string | undefined,
  hasSessionCookie: boolean,
  allowedOrigins: readonly string[],
): boolean {
  if (!MUTATING_METHODS.has(method.toUpperCase())) return true;
  if (!hasSessionCookie) return true;
  if (!origin) return false;
  return allowedOrigins.includes(origin);
}

export function trustedMutationOriginGuard(allowedOrigins: readonly string[]): RequestHandler {
  return (req, res, next) => {
    const hasSessionCookie = Boolean(req.headers.cookie?.includes("connect.sid="));
    const origin = typeof req.headers.origin === "string" ? req.headers.origin : undefined;

    if (!isTrustedMutationOrigin(req.method, origin, hasSessionCookie, allowedOrigins)) {
      return res.status(403).json({
        message: "Request origin is not trusted for a session-backed change.",
        code: "untrusted_mutation_origin",
      });
    }

    next();
  };
}
