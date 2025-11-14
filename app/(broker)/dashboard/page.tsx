import StatCard from "../components/StatCard"

export default function BrokerDashboardPage() {
  const recentOrders = [
    {
      id: "ORD-2025-001",
      date: "2025-01-14",
      company: "Acme Solar Inc.",
      faceValue: 500000,
      status: "PAID",
    },
    {
      id: "ORD-2025-002",
      date: "2025-01-13",
      company: "GreenTech Manufacturing",
      faceValue: 250000,
      status: "PAYMENT_PENDING",
    },
    {
      id: "ORD-2025-003",
      date: "2025-01-12",
      company: "Solar Solutions LLC",
      faceValue: 750000,
      status: "SETTLED",
    },
  ]

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

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-su-text mb-2">
          Dashboard
        </h1>
        <p className="text-su-muted">Your portfolio at a glance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Active Pools" 
          value={12} 
          subtitle="Available for sale"
        />
        <StatCard 
          title="Available Face Value" 
          value={formatCurrency(45000000)} 
          subtitle="Across all pools"
        />
        <StatCard 
          title="Reserved (72h)" 
          value={formatCurrency(1500000)} 
          subtitle="Pending payment"
        />
        <StatCard 
          title="Completed Sales (YTD)" 
          value={formatCurrency(12300000)} 
          subtitle="+15.3% vs last year"
          trend={{ value: "15.3%", positive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-su-text mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-sm font-medium text-su-muted pb-3">Order ID</th>
                  <th className="text-left text-sm font-medium text-su-muted pb-3">Date</th>
                  <th className="text-left text-sm font-medium text-su-muted pb-3">Company</th>
                  <th className="text-right text-sm font-medium text-su-muted pb-3">Face Value</th>
                  <th className="text-center text-sm font-medium text-su-muted pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-white/5 last:border-0">
                    <td className="py-4 text-sm text-su-text font-medium">{order.id}</td>
                    <td className="py-4 text-sm text-su-muted">{order.date}</td>
                    <td className="py-4 text-sm text-su-text">{order.company}</td>
                    <td className="py-4 text-sm text-su-text text-right font-medium">
                      {formatCurrency(order.faceValue)}
                    </td>
                    <td className="py-4">
                      <div className="flex justify-center">
                        <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getStatusColor(order.status)}`}>
                          {order.status.replace(/_/g, " ")}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-su-text mb-6">Payout Summary</h2>
          <div className="space-y-6">
            <div>
              <p className="text-sm text-su-muted mb-2">Pending Payout</p>
              <p className="text-2xl font-bold text-su-emerald">{formatCurrency(285000)}</p>
            </div>
            <div>
              <p className="text-sm text-su-muted mb-2">Next Payout Date</p>
              <p className="text-lg font-medium text-su-text">Jan 31, 2025</p>
            </div>
            <div>
              <p className="text-sm text-su-muted mb-2">Last Payout</p>
              <p className="text-lg font-medium text-su-text">{formatCurrency(450000)}</p>
              <p className="text-xs text-su-muted mt-1">Dec 31, 2024</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
