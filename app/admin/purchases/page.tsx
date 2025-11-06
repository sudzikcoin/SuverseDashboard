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
    return <div className="flex items-center justify-center h-screen bg-[#0B1220] text-gray-100">Loading...</div>
  }

  if (!session || session.user.role !== "ADMIN") return null

  return (
    <div className="flex min-h-screen bg-[#0B1220]">
      <Sidebar role={session.user.role} />
      
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Purchase Order Management</h1>
          <a
            href="/api/admin/export/purchases"
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow transition"
          >
            Export CSV
          </a>
        </div>

        {purchases.length === 0 ? (
          <div className="bg-[#0F172A] border border-white/5 rounded-xl p-8 text-center">
            <p className="text-gray-300">No purchase orders yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {purchases.map((po: any) => (
              <div key={po.id} className="bg-[#0F172A] border border-white/5 rounded-xl shadow-md hover:shadow-lg transition p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {po.inventory.creditType} {po.inventory.taxYear}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Order #{po.id.slice(0, 8)} - {po.company.legalName}
                    </p>
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      po.brokerStatus === "APPROVED"
                        ? "bg-green-600 text-white"
                        : po.brokerStatus === "REJECTED"
                        ? "bg-red-600 text-white"
                        : "bg-yellow-600 text-white"
                    }`}>
                      {po.brokerStatus}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-200">Face Value</p>
                    <p className="text-white font-semibold">
                      ${Number(po.amountUSD).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-200">Total Paid</p>
                    <p className="text-white font-semibold">
                      ${Number(po.totalUSD).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-200">Payment Status</p>
                    <p className={`font-semibold ${
                      po.status === "PAID" ? "text-green-400" : "text-yellow-400"
                    }`}>
                      {po.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-200">Created</p>
                    <p className="text-sm text-gray-100">
                      {new Date(po.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {po.status === "PAID" && po.brokerStatus === "PENDING" && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => updateBrokerStatus(po.id, "APPROVED")}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-xl transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateBrokerStatus(po.id, "NEEDS_INFO")}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-100 font-semibold rounded-xl transition"
                    >
                      Needs Info
                    </button>
                    <button
                      onClick={() => updateBrokerStatus(po.id, "REJECTED")}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
