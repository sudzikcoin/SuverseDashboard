"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Sidebar from "@/components/Sidebar"
import Card from "@/components/Card"
import Button from "@/components/Button"

export default function AdminInventoryPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [inventory, setInventory] = useState([])
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
      fetchInventory()
    }
  }, [session])

  const fetchInventory = async () => {
    try {
      const res = await fetch("/api/admin/inventory")
      if (res.ok) {
        const data = await res.json()
        setInventory(data)
      }
    } catch (error) {
      console.error("Failed to fetch inventory:", error)
    } finally {
      setLoading(false)
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
          <h1 className="text-3xl font-bold text-white">Inventory Management</h1>
          <a
            href="/api/admin/export/inventory"
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow transition"
          >
            Export CSV
          </a>
        </div>

        <div className="space-y-4">
          {inventory.map((item: any) => (
            <div key={item.id} className="bg-[#0F172A] border border-white/5 rounded-xl shadow-md hover:shadow-lg transition p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {item.creditType} {item.taxYear}
                  </h3>
                  <p className="text-sm text-gray-400">ID: {item.id}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  item.status === "ACTIVE"
                    ? "bg-green-600 text-white"
                    : "bg-gray-600 text-gray-200"
                }`}>
                  {item.status}
                </span>
              </div>

              <div className="mt-4 grid md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-200">Face Value</p>
                  <p className="text-white font-semibold">
                    ${Number(item.faceValueUSD).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-200">Available</p>
                  <p className="text-white font-semibold">
                    ${Number(item.availableUSD).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-200">Min Block</p>
                  <p className="text-white font-semibold">
                    ${Number(item.minBlockUSD).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-200">Price</p>
                  <p className="text-green-400 font-semibold">${item.pricePerDollar}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
