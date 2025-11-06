"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Sidebar from "@/components/Sidebar"
import Card from "@/components/Card"
import Button from "@/components/Button"

export default function AdminPurchasesPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (session?.user.role !== "ADMIN") {
      router.push("/dashboard")
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user.role === "ADMIN") {
      fetchPurchases()
    }
  }, [session])

  const fetchPurchases = async () => {
    try {
      const res = await fetch("/api/admin/purchases")
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

  const updateBrokerStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/purchases/${id}/broker-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        alert("Status updated successfully")
        window.location.reload()
      } else {
        const data = await res.json()
        alert(data.error || "Failed to update status")
      }
    } catch (error) {
      alert("An error occurred")
    }
  }

  if (status === "loading" || loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!session || session.user.role !== "ADMIN") return null

  return (
    <div className="flex">
      <Sidebar role={session.user.role} />
      
      <main className="flex-1 p-8 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Purchase Order Management</h1>
          <a
            href="/api/admin/export/purchases"
            className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Export CSV
          </a>
        </div>

        {purchases.length === 0 ? (
          <Card>
            <p className="text-gray-600">No purchase orders yet.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {purchases.map((po: any) => (
              <Card key={po.id}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">
                      {po.inventory.creditType} {po.inventory.taxYear}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Order #{po.id.slice(0, 8)} - {po.company.legalName}
                    </p>
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      po.brokerStatus === "APPROVED"
                        ? "bg-green-100 text-green-800"
                        : po.brokerStatus === "REJECTED"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {po.brokerStatus}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Face Value</p>
                    <p className="font-semibold">
                      ${Number(po.amountUSD).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Paid</p>
                    <p className="font-semibold">
                      ${Number(po.totalUSD).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <p className={`font-semibold ${
                      po.status === "PAID" ? "text-green-600" : "text-yellow-600"
                    }`}>
                      {po.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="text-sm">
                      {new Date(po.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {po.status === "PAID" && po.brokerStatus === "PENDING" && (
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => updateBrokerStatus(po.id, "APPROVED")}
                      variant="primary"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => updateBrokerStatus(po.id, "NEEDS_INFO")}
                      variant="secondary"
                    >
                      Needs Info
                    </Button>
                    <Button
                      onClick={() => updateBrokerStatus(po.id, "REJECTED")}
                      variant="danger"
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
