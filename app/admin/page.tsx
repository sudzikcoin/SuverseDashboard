import { formatNumber } from "@/lib/format"
import { formatDate } from "@/lib/date"

async function getStats() {
  const { headers } = await import("next/headers")
  const headersList = await headers()
  const host = headersList.get("host") || "localhost:5000"
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http"
  const baseUrl = `${protocol}://${host}`
  
  const res = await fetch(`${baseUrl}/api/admin/stats`, {
    cache: "no-store",
  })
  if (!res.ok) throw new Error("Failed to fetch stats")
  return res.json()
}

export default async function AdminDashboard() {
  const stats = await getStats()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-su-muted mt-2">System overview and statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon="👥"
        />
        <StatCard
          title="Companies"
          value={stats.totalCompanies}
          icon="🏢"
        />
        <StatCard
          title="Active Credits"
          value={stats.totalCredits}
          icon="💳"
        />
        <StatCard
          title="Purchases"
          value={stats.totalPurchases}
          icon="🛒"
        />
        <StatCard
          title="Accountants"
          value={stats.totalAccountants}
          icon="📊"
        />
        <StatCard
          title="Active Holds"
          value={stats.activeHolds}
          icon="⏳"
        />
        <StatCard
          title="Available USD"
          value={`$${formatNumber(stats.totalAvailableUSD)}`}
          icon="💵"
          valueClass="text-2xl"
        />
      </div>

      <div className="bg-su-card border border-white/10 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {stats.recentActivity.map((log: any) => (
            <div
              key={log.id}
              className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition"
            >
              <div>
                <p className="text-white font-medium">{log.action}</p>
                <p className="text-sm text-su-muted">
                  {log.entity} {log.entityId ? `• ${log.entityId.slice(0, 8)}...` : ""}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white">
                  {log.actor?.name || log.actor?.email || "System"}
                </p>
                <p className="text-xs text-su-muted">
                  {formatDate(log.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  valueClass = "text-3xl",
}: {
  title: string
  value: string | number
  icon: string
  valueClass?: string
}) {
  return (
    <div className="bg-su-card border border-white/10 rounded-2xl p-6 hover:border-emerald-500/30 transition">
      <div className="flex items-start justify-between mb-4">
        <span className="text-3xl">{icon}</span>
      </div>
      <h3 className="text-su-muted text-sm mb-1">{title}</h3>
      <p className={`font-bold text-white ${valueClass}`}>{value}</p>
    </div>
  )
}
