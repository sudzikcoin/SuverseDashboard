import CreditPoolForm from "../components/CreditPoolForm"

export default function EditCreditPoolPage({ params }: { params: { poolId: string } }) {
  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-su-text mb-2">
          Edit Credit Pool
        </h1>
        <p className="text-su-muted">Pool ID: {params.poolId}</p>
      </div>

      <CreditPoolForm mode="edit" poolId={params.poolId} />
    </div>
  )
}
