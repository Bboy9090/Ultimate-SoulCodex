import PageContainer from "@/components/layout/PageContainer"
import CompatibilityForm from "@/components/relationships/CompatibilityForm"
import CompatibilityResult from "@/components/relationships/CompatibilityResult"

export default function RelationshipsPage(){

  return(
    <PageContainer>

      <h1 className="text-xl font-bold">Relationships</h1>

      <CompatibilityForm />

      <CompatibilityResult />

    </PageContainer>
  )
}
