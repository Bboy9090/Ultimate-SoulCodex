import type { ReactNode } from "react";
import { AlertTriangle, LoaderCircle, RefreshCw } from "lucide-react";

type Props = {
  kind: "loading" | "empty" | "error";
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
  className?: string;
};

/** Uniform loading/empty/error state used by release surfaces. */
export default function FeatureState({
  kind,
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className = "",
}: Props) {
  const defaultIcon = kind === "loading"
    ? <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
    : kind === "error"
      ? <AlertTriangle className="h-5 w-5" aria-hidden="true" />
      : null;

  return (
    <section
      className={`sc-panel p-5 sm:p-6 ${className}`.trim()}
      aria-live="polite"
      aria-busy={kind === "loading" ? "true" : undefined}
    >
      <div className="flex items-start gap-3">
        {(icon ?? defaultIcon) ? (
          <span className="sc-icon-well h-10 w-10 shrink-0">{icon ?? defaultIcon}</span>
        ) : null}
        <div className="min-w-0">
          <h2 className="m-0 font-serif text-xl font-semibold text-[var(--sc-ivory)]">{title}</h2>
          <p className="mb-0 mt-2 text-sm leading-6 text-[var(--sc-stone)]">{description}</p>
          {actionLabel && onAction ? (
            <button type="button" onClick={onAction} className="sc-button-secondary mt-4">
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              {actionLabel}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
