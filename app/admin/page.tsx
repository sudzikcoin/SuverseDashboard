import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { formatNumber } from "@/lib/format"
import { formatDate } from "@/lib/date"

async function getStats() {
  const safeCount = async (fn: () => Promise<number>) => {
    try {
      return await fn()
    } catch {
      return 0
    }
  }

  const [
    totalUsers,
    totalAccountants,
    totalCompanies,
    totalCredits,
    totalPurchases,
    activeHolds,
    recentActivity,
  ] = await Promise.all([
    safeCount(() => prisma.user.count()),
    safeCount(() => prisma.user.count({ where: { role: "ACCOUNTANT" } })),
    safeCount(() => prisma.company.count()),
    safeCount(() => prisma.creditInventory.count({ where: { status: "ACTIVE" } })),
    safeCount(() => prisma.purchaseOrder.count()),
    safeCount(() => prisma.hold.count({ where: { status: "ACTIVE" } })),
    prisma.auditLog
      .findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { actor: true },
      })
      .catch(() => []),
  ])

  const inventoryData = await prisma.creditInventory
    .findMany({
      where: { status: "ACTIVE" },
      select: { availableUSD: true },
    })
    .catch(() => [])

  const totalAvailableUSD = inventoryData.reduce(
    (sum, item) => sum + Number(item.availableUSD || 0),
    0
  )

  return {
    totalUsers,
    totalAccountants,
    totalCompanies,
    totalCredits,
    totalPurchases,
    activeHolds,
    totalAvailableUSD,
    recentActivity,
  }
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== "ADMIN") {
    redirect("/login")
  }

  const stats = await getStats()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-su-muted mt-2">System overview and statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Users" value={stats.totalUsers} icon="👥" />
        <StatCard title="Companies" value={stats.totalCompanies} icon="🏢" />
        <StatCard title="Active Credits" value={stats.totalCredits} icon="💳" />
        <StatCard title="Purchases" value={stats.totalPurchases} icon="🛒" />
        <StatCard title="Accountants" value={stats.totalAccountants} icon="📊" />
        <StatCard title="Active Holds" value={stats.activeHolds} icon="⏳" />
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
          {stats.recentActivity.length === 0 ? (
            <p className="text-su-muted text-center py-8">No recent activity</p>
          ) : (
            stats.recentActivity.map((log: any) => (
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
                  <p className="text-xs text-su-muted">{formatDate(log.createdAt)}</p>
                </div>
              </div>
            ))
          )}
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
