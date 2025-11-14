import { Download } from "lucide-react"

export default function OrderDetailPage({ params }: { params: { orderId: string } }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const order = {
    id: params.orderId,
    date: "2025-01-14",
    program: "C48E 2025",
    poolId: "POOL-001",
    faceValue: 500000,
    pricePerDollar: 0.92,
    discount: 8,
    totalCost: 460000,
    company: {
      name: "Acme Solar Inc.",
      ein: "12-3456789",
      state: "CA",
      email: "admin@acmesolar.com",
    },
    accountant: {
      name: "Jane Smith, CPA",
      firm: "Smith & Associates",
    },
    status: "PAID",
    timeline: [
      { event: "Reservation created", date: "2025-01-14 10:30 AM", completed: true },
      { event: "Payment confirmed", date: "2025-01-14 11:45 AM", completed: true },
      { event: "Settlement", date: "2025-01-21 (estimated)", completed: false },
    ],
    payment: {
      method: "USDC (Base Network)",
      txHash: "0x1234...5678",
      platformFee: 4600,
      netAmount: 455400,
    },
    payout: {
      batchId: "PO-2025-01",
      scheduledDate: "2025-01-31",
    },
    documents: [
      { name: "Purchase Agreement.pdf", uploadedAt: "2025-01-14" },
      { name: "IRS Form 8835.pdf", uploadedAt: "2025-01-14" },
      { name: "Transfer Notice.pdf", uploadedAt: "2025-01-14" },
    ],
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-su-text mb-2">
          Order Details
        </h1>
        <p className="text-su-muted">Order ID: {order.id}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-su-text mb-4">Order Summary</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-su-muted mb-1">Order ID</p>
                <p className="text-su-text font-medium">{order.id}</p>
              </div>
              <div>
                <p className="text-sm text-su-muted mb-1">Date</p>
                <p className="text-su-text font-medium">{order.date}</p>
              </div>
              <div>
                <p className="text-sm text-su-muted mb-1">Program / Pool</p>
                <p className="text-su-text font-medium">{order.program}</p>
                <p className="text-xs text-su-muted">{order.poolId}</p>
              </div>
              <div>
                <p className="text-sm text-su-muted mb-1">Face Value</p>
                <p className="text-su-text font-medium text-lg">{formatCurrency(order.faceValue)}</p>
              </div>
              <div>
                <p className="text-sm text-su-muted mb-1">Price per $1</p>
                <p className="text-su-text font-medium">${order.pricePerDollar.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-su-muted mb-1">Discount</p>
                <p className="text-su-emerald font-medium text-lg">{order.discount}%</p>
              </div>
              <div className="col-span-2 pt-4 border-t border-white/10">
                <p className="text-sm text-su-muted mb-1">Total Purchase Price</p>
                <p className="text-su-text font-bold text-2xl">{formatCurrency(order.totalCost)}</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-su-text mb-4">Buyer Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-su-muted mb-1">Company Name</p>
                <p className="text-su-text font-medium">{order.company.name}</p>
              </div>
              <div>
                <p className="text-sm text-su-muted mb-1">EIN</p>
                <p className="text-su-text font-medium">{order.company.ein}</p>
              </div>
              <div>
                <p className="text-sm text-su-muted mb-1">State</p>
                <p className="text-su-text font-medium">{order.company.state}</p>
              </div>
              <div>
                <p className="text-sm text-su-muted mb-1">Contact Email</p>
                <p className="text-su-text font-medium">{order.company.email}</p>
              </div>
              <div className="col-span-2 pt-4 border-t border-white/10">
                <p className="text-sm text-su-muted mb-1">Accountant</p>
                <p className="text-su-text font-medium">{order.accountant.name}</p>
                <p className="text-xs text-su-muted">{order.accountant.firm}</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-su-text mb-4">Payment & Settlement</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-su-muted mb-1">Payment Method</p>
                  <p className="text-su-text font-medium">{order.payment.method}</p>
                </div>
                <div>
                  <p className="text-sm text-su-muted mb-1">On-chain Tx Hash</p>
                  <p className="text-su-text font-mono text-xs">{order.payment.txHash}</p>
                </div>
                <div>
                  <p className="text-sm text-su-muted mb-1">Platform Fee (1%)</p>
                  <p className="text-su-text font-medium">{formatCurrency(order.payment.platformFee)}</p>
                </div>
                <div>
                  <p className="text-sm text-su-muted mb-1">Net Amount to Broker</p>
                  <p className="text-su-emerald font-bold text-lg">{formatCurrency(order.payment.netAmount)}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-white/10">
                <p className="text-sm text-su-muted mb-1">Payout Batch</p>
                <p className="text-su-text font-medium">{order.payout.batchId}</p>
                <p className="text-xs text-su-muted">Scheduled: {order.payout.scheduledDate}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-su-text mb-4">Status & Timeline</h2>
            <div className="space-y-4">
              {order.timeline.map((item, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${item.completed ? 'bg-su-emerald' : 'bg-white/20'}`} />
                    {index < order.timeline.length - 1 && (
                      <div className="w-0.5 h-12 bg-white/10 my-1" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${item.completed ? 'text-su-text' : 'text-su-muted'}`}>
                      {item.event}
                    </p>
                    <p className="text-xs text-su-muted mt-1">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-white/10">
              <span className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-semibold inline-block">
                {order.status}
              </span>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-su-text mb-4">Documents</h2>
            <div className="space-y-3">
              {order.documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 glass rounded-xl hover:bg-white/10 transition">
                  <div>
                    <p className="text-sm text-su-text font-medium">{doc.name}</p>
                    <p className="text-xs text-su-muted mt-1">{doc.uploadedAt}</p>
                  </div>
                  <button className="p-2 hover:text-su-emerald transition">
                    <Download size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
