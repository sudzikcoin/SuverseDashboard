import Link from "next/link"
import { Plus } from "lucide-react"
import { prisma } from "@/lib/db"
import { getCurrentBrokerOrThrow } from "@/lib/broker/currentBroker"

export default async function InventoryPage() {
  const broker = await getCurrentBrokerOrThrow()

  const pools = await prisma.brokerCreditPool.findMany({
    where: { brokerId: broker.id },
    orderBy: { createdAt: "desc" },
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-500/20 text-emerald-400"
      case "PAUSED":
        return "bg-yellow-500/20 text-yellow-400"
      case "DRAFT":
        return "bg-gray-500/20 text-gray-400"
      case "CLOSED":
        return "bg-red-500/20 text-red-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-su-text mb-2">
            Inventory
          </h1>
          <p className="text-su-muted">Manage your credit pools</p>
        </div>
        <Link
          href="/broker/inventory/new"
          className="flex items-center gap-2 px-6 py-3 bg-su-emerald hover:bg-su-emerald/90 text-white rounded-xl transition font-medium w-fit"
        >
          <Plus size={20} />
          Add Credit Pool
        </Link>
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-sm font-medium text-su-muted pb-3">Program</th>
                <th className="text-center text-sm font-medium text-su-muted pb-3">Year</th>
                <th className="text-center text-sm font-medium text-su-muted pb-3">State</th>
                <th className="text-right text-sm font-medium text-su-muted pb-3">Available</th>
                <th className="text-right text-sm font-medium text-su-muted pb-3">Min Block</th>
                <th className="text-right text-sm font-medium text-su-muted pb-3">Price per $1</th>
                <th className="text-right text-sm font-medium text-su-muted pb-3">Discount</th>
                <th className="text-center text-sm font-medium text-su-muted pb-3">Status</th>
                <th className="text-center text-sm font-medium text-su-muted pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pools.map((pool) => {
                const discount = (1 - Number(pool.pricePerDollar)) * 100
                return (
                  <tr key={pool.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition">
                    <td className="py-4 text-sm text-su-text font-medium">{pool.programName}</td>
                    <td className="py-4 text-sm text-su-muted text-center">{pool.creditYear}</td>
                    <td className="py-4 text-sm text-su-muted text-center">{pool.jurisdiction}</td>
                    <td className="py-4 text-sm text-su-text text-right font-medium">
                      {formatCurrency(Number(pool.availableFaceValueUsd))}
                    </td>
                    <td className="py-4 text-sm text-su-muted text-right">
                      {formatCurrency(Number(pool.minBlockUsd))}
                    </td>
                    <td className="py-4 text-sm text-su-text text-right">${Number(pool.pricePerDollar).toFixed(2)}</td>
                    <td className="py-4 text-sm text-su-emerald text-right font-medium">{discount.toFixed(1)}%</td>
                    <td className="py-4">
                      <div className="flex justify-center">
                        <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getStatusColor(pool.status)}`}>
                          {pool.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex justify-center gap-2">
                        <Link
                          href={`/broker/inventory/${pool.id}`}
                          className="px-3 py-1 text-xs glass hover:text-su-emerald rounded-lg transition"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {pools.length === 0 && (
          <div className="text-center py-12">
            <p className="text-su-muted">No credit pools yet. Create your first pool to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}
