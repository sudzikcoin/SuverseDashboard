export default function PayoutsPage() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const upcomingPayouts = [
    {
      batchId: "PO-2025-02",
      period: "Jan 16-31, 2025",
      ordersCount: 12,
      amount: 285000,
      status: "PENDING",
    },
    {
      batchId: "PO-2025-01",
      period: "Jan 1-15, 2025",
      ordersCount: 8,
      amount: 192000,
      status: "PROCESSING",
    },
  ]

  const payoutHistory = [
    {
      batchId: "PO-2024-24",
      dateSent: "Dec 31, 2024",
      amount: 450000,
      method: "USDC",
      reference: "0xabcd...1234",
    },
    {
      batchId: "PO-2024-23",
      dateSent: "Dec 15, 2024",
      amount: 380000,
      method: "Wire",
      reference: "REF-20241215-001",
    },
    {
      batchId: "PO-2024-22",
      dateSent: "Nov 30, 2024",
      amount: 520000,
      method: "USDC",
      reference: "0x5678...abcd",
    },
  ]

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-su-text mb-2">
          Payouts
        </h1>
        <p className="text-su-muted">Track your earnings and payout schedule</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass rounded-2xl p-6">
          <p className="text-sm text-su-muted mb-2">Pending Payout</p>
          <p className="text-3xl font-bold text-su-emerald mb-1">{formatCurrency(285000)}</p>
          <p className="text-xs text-su-muted">12 orders included</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="text-sm text-su-muted mb-2">Next Scheduled Payout</p>
          <p className="text-3xl font-bold text-su-text mb-1">Jan 31</p>
          <p className="text-xs text-su-muted">2025</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="text-sm text-su-muted mb-2">Last Payout</p>
          <p className="text-3xl font-bold text-su-text mb-1">{formatCurrency(450000)}</p>
          <p className="text-xs text-su-muted">Dec 31, 2024</p>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 mb-6">
        <h2 className="text-xl font-semibold text-su-text mb-4">Upcoming / Pending Payouts</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-sm font-medium text-su-muted pb-3">Batch ID</th>
                <th className="text-left text-sm font-medium text-su-muted pb-3">Period</th>
                <th className="text-center text-sm font-medium text-su-muted pb-3">Orders</th>
                <th className="text-right text-sm font-medium text-su-muted pb-3">Amount</th>
                <th className="text-center text-sm font-medium text-su-muted pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {upcomingPayouts.map((payout) => (
                <tr key={payout.batchId} className="border-b border-white/5 last:border-0">
                  <td className="py-4 text-sm text-su-text font-medium">{payout.batchId}</td>
                  <td className="py-4 text-sm text-su-muted">{payout.period}</td>
                  <td className="py-4 text-sm text-su-text text-center">{payout.ordersCount}</td>
                  <td className="py-4 text-sm text-su-text text-right font-medium">
                    {formatCurrency(payout.amount)}
                  </td>
                  <td className="py-4">
                    <div className="flex justify-center">
                      <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-xs font-semibold">
                        {payout.status}
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
        <h2 className="text-xl font-semibold text-su-text mb-4">Payout History</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-sm font-medium text-su-muted pb-3">Batch ID</th>
                <th className="text-left text-sm font-medium text-su-muted pb-3">Date Sent</th>
                <th className="text-right text-sm font-medium text-su-muted pb-3">Amount</th>
                <th className="text-center text-sm font-medium text-su-muted pb-3">Method</th>
                <th className="text-left text-sm font-medium text-su-muted pb-3">Reference / Tx Hash</th>
              </tr>
            </thead>
            <tbody>
              {payoutHistory.map((payout) => (
                <tr key={payout.batchId} className="border-b border-white/5 last:border-0">
                  <td className="py-4 text-sm text-su-text font-medium">{payout.batchId}</td>
                  <td className="py-4 text-sm text-su-muted">{payout.dateSent}</td>
                  <td className="py-4 text-sm text-su-text text-right font-medium">
                    {formatCurrency(payout.amount)}
                  </td>
                  <td className="py-4 text-sm text-su-text text-center">
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold">
                      {payout.method}
                    </span>
                  </td>
                  <td className="py-4 text-sm text-su-muted font-mono">{payout.reference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
