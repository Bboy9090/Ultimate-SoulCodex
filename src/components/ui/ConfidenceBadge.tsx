const colors: Record<string, string> = {
  verified: "bg-green-500",
  partial: "bg-yellow-500",
  unverified: "bg-red-500",
}

export default function ConfidenceBadge({ level }: { level: "verified" | "partial" | "unverified" }){

  return(
    <span className={`text-xs px-2 py-1 rounded ${colors[level]}`}>
      {level}
    </span>
  )
}
