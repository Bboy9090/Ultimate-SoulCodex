type Props = {
  phase: string;
  confidence: "verified" | "partial" | "unverified";
};

export default function CurrentPhaseCard({ phase, confidence }: Props) {
  const badgeColor =
    confidence === "verified"
      ? "bg-green-500"
      : confidence === "partial"
      ? "bg-yellow-500"
      : "bg-red-500";

  return (
    <div className="card">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-codex-textMuted uppercase tracking-wide">Current Era</p>
          <h1 className="text-xl font-bold">{phase}</h1>
        </div>

        <span className={`text-xs px-2 py-1 rounded text-black ${badgeColor}`}>
          {confidence}
        </span>
      </div>
    </div>
  );
}
