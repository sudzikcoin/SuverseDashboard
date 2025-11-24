import StatCard from "../components/StatCard"
import { getCurrentBrokerOrThrow } from "@/lib/broker/currentBroker"
import { prisma } from "@/lib/db"

export default async function BrokerDashboardPage() {
  // Fetch current broker - throws if not authenticated as broker
  const broker = await getCurrentBrokerOrThrow()

  // Fetch broker's credit pools
  const creditPools = await prisma.brokerCreditPool.findMany({
    where: { brokerId: broker.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  // Calculate stats
  const activePools = creditPools.filter(pool => pool.status === 'ACTIVE')
  const totalAvailableValue = activePools.reduce(
    (sum, pool) => sum + Number(pool.availableFaceValueUsd),
    0
  )
  
  // TODO: Fetch real orders when TaxCreditOrder model is ready
  const recentOrders: any[] = []

  const getPoolStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-500/20 text-emerald-400"
      case "DRAFT":
        return "bg-gray-500/20 text-gray-400"
      case "PAUSED":
        return "bg-yellow-500/20 text-yellow-400"
      case "CLOSED":
        return "bg-red-500/20 text-red-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
      case "SETTLED":
        return "bg-emerald-500/20 text-emerald-400"
      case "PAYMENT_PENDING":
        return "bg-yellow-500/20 text-yellow-400"
      case "RESERVED":
        return "bg-sky-500/20 text-sky-400"
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

  // Helper for status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-400">Verified Broker</span>
      case "PENDING":
        return <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-yellow-500/20 text-yellow-400">Verification Pending</span>
      case "SUSPENDED":
        return <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-red-500/20 text-red-400">Suspended</span>
      default:
        return null
    }
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-su-text mb-2">
          Welcome, {broker.companyName}
        </h1>
        <div className="flex items-center gap-3">
          <p className="text-su-muted">Manage your tax credit pools and orders</p>
          {getStatusBadge(broker.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Pools" 
          value={creditPools.length} 
          subtitle={`${activePools.length} active`}
        />
        <StatCard 
          title="Available Face Value" 
          value={formatCurrency(totalAvailableValue)} 
          subtitle="Across active pools"
        />
        <StatCard 
          title="Pending Orders" 
          value={0} 
          subtitle="Awaiting settlement"
        />
        <StatCard 
          title="Broker Status" 
          value={broker.status}
          subtitle={broker.status === 'PENDING' ? 'Awaiting admin approval' : 'Active'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-su-text">Credit Pools</h2>
            <a 
              href="/broker/inventory/new" 
              className="px-4 py-2 bg-su-emerald hover:bg-su-emerald/90 text-su-base rounded-lg text-sm font-semibold transition"
            >
              Create Pool
            </a>
          </div>
          
          {creditPools.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-su-muted mb-4">You don't have any credit pools yet.</p>
              <a 
                href="/broker/inventory/new" 
                className="inline-block px-6 py-3 bg-su-emerald hover:bg-su-emerald/90 text-su-base rounded-lg font-semibold transition"
              >
                Create Your First Pool
              </a>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-sm font-medium text-su-muted pb-3">Program</th>
                    <th className="text-left text-sm font-medium text-su-muted pb-3">Type</th>
                    <th className="text-left text-sm font-medium text-su-muted pb-3">State</th>
                    <th className="text-right text-sm font-medium text-su-muted pb-3">Available Value</th>
                    <th className="text-right text-sm font-medium text-su-muted pb-3">Price per $</th>
                    <th className="text-center text-sm font-medium text-su-muted pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {creditPools.slice(0, 5).map((pool) => (
                    <tr key={pool.id} className="border-b border-white/5 last:border-0">
                      <td className="py-4 text-sm text-su-text font-medium">{pool.programName}</td>
                      <td className="py-4 text-sm text-su-muted">{pool.creditType}</td>
                      <td className="py-4 text-sm text-su-muted">{pool.jurisdiction}</td>
                      <td className="py-4 text-sm text-su-text text-right font-medium">
                        {formatCurrency(Number(pool.availableFaceValueUsd))}
                      </td>
                      <td className="py-4 text-sm text-su-text text-right">
                        ${pool.pricePerDollar}
                      </td>
                      <td className="py-4">
                        <div className="flex justify-center">
                          <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getPoolStatusColor(pool.status)}`}>
                            {pool.status}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {creditPools.length > 5 && (
            <div className="mt-4 text-center">
              <a href="/broker/inventory" className="text-su-sky hover:text-su-sky/80 text-sm font-medium">
                View all pools →
              </a>
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-su-text mb-6">Broker Profile</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-su-muted mb-1">Company</p>
              <p className="text-lg font-medium text-su-text">{broker.companyName}</p>
            </div>
            <div>
              <p className="text-sm text-su-muted mb-1">Contact</p>
              <p className="text-lg font-medium text-su-text">{broker.contactName}</p>
            </div>
            <div>
              <p className="text-sm text-su-muted mb-1">Email</p>
              <p className="text-lg font-medium text-su-text">{broker.email}</p>
            </div>
            {broker.phone && (
              <div>
                <p className="text-sm text-su-muted mb-1">Phone</p>
                <p className="text-lg font-medium text-su-text">{broker.phone}</p>
              </div>
            )}
            {broker.state && (
              <div>
                <p className="text-sm text-su-muted mb-1">State</p>
                <p className="text-lg font-medium text-su-text">{broker.state}</p>
              </div>
            )}
            {broker.status === "PENDING" && (
              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm text-yellow-400">
                  Your broker profile is under review. The marketplace team will approve it before you can start trading.
                </p>
              </div>
            )}
            <div className="mt-6">
              <a 
                href="/broker/settings" 
                className="block text-center px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-su-text transition"
              >
                Edit Profile
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
