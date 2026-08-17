import { AlertTriangle, RefreshCw } from "lucide-react";

export function featureErrorMessage(status?: number, fallback?: string) {
  if (status === 404 || status === 410) {
    return "This app build and the connected Soul Codex service do not expose the same feature contract. Check Diagnostics before retrying.";
  }
  if (status && status >= 500) return "Soul Codex is reachable, but the service could not complete this request.";
  return fallback || "This request could not be completed.";
}

export default function AsyncFeatureState({
  title,
  message,
  onRetry,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <section className="sc-panel mt-6 border-[rgba(232,138,90,.25)] p-5" role="alert">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-[#e8b95a]" />
        <div className="min-w-0 flex-1">
          <h2 className="m-0 text-lg font-semibold">{title || "This feature could not connect"}</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--sc-stone)]">{message}</p>
          {onRetry && (
            <button type="button" onClick={onRetry} className="sc-button-secondary mt-4 inline-flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> Retry
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
