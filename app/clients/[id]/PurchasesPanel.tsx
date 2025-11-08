"use client"

interface PurchasesPanelProps {
  company: any
}

export default function PurchasesPanel({ company }: PurchasesPanelProps) {
  const purchases = company.purchases || []

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-500/20 text-emerald-400"
      case "PENDING_PAYMENT":
        return "bg-yellow-500/20 text-yellow-400"
      case "CANCELLED":
        return "bg-red-500/20 text-red-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-100 mb-4">Purchase Orders</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Total Purchases</p>
            <p className="text-2xl font-bold text-gray-100 mt-1">{purchases.length}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Total Value</p>
            <p className="text-2xl font-bold text-gray-100 mt-1">
              {formatCurrency(
                purchases.reduce((sum: number, p: any) => sum + parseFloat(p.totalUSD), 0)
              )}
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Completed</p>
            <p className="text-2xl font-bold text-gray-100 mt-1">
              {purchases.filter((p: any) => p.status === "COMPLETED").length}
            </p>
          </div>
        </div>
      </div>

      {purchases.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No purchase orders yet
        </div>
      ) : (
        <div className="space-y-3">
          {purchases.map((purchase: any) => (
            <div
              key={purchase.id}
              className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-gray-100 font-semibold">
                    {purchase.inventory.creditType} - Tax Year {purchase.inventory.taxYear}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Order ID: {purchase.id.slice(0, 8)}...
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${getStatusColor(purchase.status)}`}>
                  {purchase.status.replace(/_/g, " ")}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Face Value</p>
                  <p className="text-gray-100 font-semibold mt-1">
                    {formatCurrency(parseFloat(purchase.amountUSD))}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Price/Dollar</p>
                  <p className="text-gray-100 font-semibold mt-1">
                    ${parseFloat(purchase.pricePerDollar).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Total Cost</p>
                  <p className="text-gray-100 font-semibold mt-1">
                    {formatCurrency(parseFloat(purchase.totalUSD))}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Date</p>
                  <p className="text-gray-100 font-semibold mt-1">
                    {new Date(purchase.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {purchase.inventory.brokerName && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-sm text-gray-400">
                    Broker: <span className="text-gray-100">{purchase.inventory.brokerName}</span>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
