export default function LoadingCards({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card animate-pulse">
          <div className="h-3 w-24 bg-codex-border rounded mx-auto mb-3" />
          <div className="h-5 w-40 bg-codex-border rounded mx-auto mb-4" />
          <div className="space-y-2">
            <div className="h-3 w-full bg-codex-border rounded" />
            <div className="h-3 w-4/5 bg-codex-border rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
