"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Card from "@/components/Card"
import { formatNumber } from "@/lib/format"

interface Purchase {
  id: string
  amountUSD: number
  pricePerDollar: number
  totalUSD: number
  status: string
  brokerStatus: string
  createdAt: string
  inventory: {
    creditType: string
    taxYear: number
  }
}

export default function PurchasesPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchPurchases()
    }
  }, [session])

  const fetchPurchases = async () => {
    try {
      const res = await fetch("/api/purchases")
      if (res.ok) {
        const data = await res.json()
        setPurchases(data)
      }
    } catch (error) {
      console.error("Failed to fetch purchases:", error)
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return <div className="flex items-center justify-center h-screen bg-su-base text-su-text">Loading...</div>
  }

  if (!session) return null

  return (
    <div className="p-4 md:p-8 bg-su-base min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold mb-8 text-su-text">My Purchases</h1>

      {purchases.length === 0 ? (
        <Card>
          <p className="text-su-muted">No purchases yet.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {purchases.map((purchase) => (
            <Card key={purchase.id}>
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div>
                  <h3 className="text-xl font-bold mb-2 text-su-text">
                    {purchase.inventory.creditType} {purchase.inventory.taxYear}
                  </h3>
                  <p className="text-sm text-su-muted">
                    Order #{purchase.id.slice(0, 8)}
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-2xl font-bold text-su-text" suppressHydrationWarning>
                    ${formatNumber(Number(purchase.totalUSD))}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-su-muted">Face Value</p>
                  <p className="font-semibold text-su-text" suppressHydrationWarning>
                    ${formatNumber(Number(purchase.amountUSD))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-su-muted">Payment Status</p>
                  <p className={`font-semibold ${
                    purchase.status === "PAID" ? "text-su-emerald" : "text-yellow-400"
                  }`}>
                    {purchase.status}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-su-muted">Broker Status</p>
                  <p className={`font-semibold ${
                    purchase.brokerStatus === "APPROVED"
                      ? "text-su-emerald"
                      : purchase.brokerStatus === "REJECTED"
                      ? "text-red-400"
                      : "text-yellow-400"
                  }`}>
                    {purchase.brokerStatus}
                  </p>
                </div>
              </div>

              <p className="text-sm text-su-muted mt-4" suppressHydrationWarning>
                Created: {new Date(purchase.createdAt).toLocaleString('en-US')}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
