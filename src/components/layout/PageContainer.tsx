export default function PageContainer({ children }: { children: React.ReactNode }) {

  return(
    <div className="max-w-xl mx-auto p-4 space-y-6">

      {children}

    </div>
  )
}
