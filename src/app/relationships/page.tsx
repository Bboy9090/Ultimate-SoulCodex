"use client"

import PageContainer from "@/components/layout/PageContainer"
import CompatibilityForm from "@/components/relationships/CompatibilityForm"
import CompatibilityResult from "@/components/relationships/CompatibilityResult"
import { useCompatibility } from "@/hooks/useCompatibility"

export default function RelationshipsPage(){

  const { result } = useCompatibility()

  return(
    <PageContainer>

      <h1 className="text-xl font-bold">Relationships</h1>

      <CompatibilityForm />

      <CompatibilityResult data={result} />

    </PageContainer>
  )
}
