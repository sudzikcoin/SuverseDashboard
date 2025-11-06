"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Sidebar from "@/components/Sidebar"
import Card from "@/components/Card"

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
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!session) return null

  return (
    <div className="flex">
      <Sidebar role={session.user.role} />
      
      <main className="flex-1 p-8 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold mb-8">My Purchases</h1>

        {purchases.length === 0 ? (
          <Card>
            <p className="text-gray-600">No purchases yet.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {purchases.map((purchase) => (
              <Card key={purchase.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      {purchase.inventory.creditType} {purchase.inventory.taxYear}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Order #{purchase.id.slice(0, 8)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      ${Number(purchase.totalUSD).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Face Value</p>
                    <p className="font-semibold">
                      ${Number(purchase.amountUSD).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <p className={`font-semibold ${
                      purchase.status === "PAID" ? "text-green-600" : "text-yellow-600"
                    }`}>
                      {purchase.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Broker Status</p>
                    <p className={`font-semibold ${
                      purchase.brokerStatus === "APPROVED"
                        ? "text-green-600"
                        : purchase.brokerStatus === "REJECTED"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}>
                      {purchase.brokerStatus}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mt-4">
                  Created: {new Date(purchase.createdAt).toLocaleString()}
                </p>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
