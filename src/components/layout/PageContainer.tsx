interface PageContainerProps {
  children: React.ReactNode
  className?: string
  topPad?: boolean
}

export default function PageContainer({ children, className = "", topPad = false }: PageContainerProps) {
  return (
    <div
      className={`max-w-xl mx-auto p-4 pb-28 space-y-6 animate-fadeIn ${topPad ? "pt-8" : ""} ${className}`}
    >
      {children}
    </div>
  )
}
