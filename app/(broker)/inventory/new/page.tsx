import CreditPoolForm from "../components/CreditPoolForm"

export default function NewCreditPoolPage() {
  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-su-text mb-2">
          Add Credit Pool
        </h1>
        <p className="text-su-muted">Create a new tax credit offering</p>
      </div>

      <CreditPoolForm mode="create" />
    </div>
  )
}
