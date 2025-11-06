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
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!session || session.user.role !== "ADMIN") return null

  return (
    <div className="flex">
      <Sidebar role={session.user.role} />
      
      <main className="flex-1 p-8 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <div className="space-x-4">
            <a
              href="/api/admin/export/inventory"
              className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Export CSV
            </a>
          </div>
        </div>

        <div className="space-y-4">
          {inventory.map((item: any) => (
            <Card key={item.id}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">
                    {item.creditType} {item.taxYear}
                  </h3>
                  <p className="text-sm text-gray-600">ID: {item.id}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  item.status === "ACTIVE"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {item.status}
                </span>
              </div>

              <div className="mt-4 grid md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Face Value</p>
                  <p className="font-semibold">
                    ${Number(item.faceValueUSD).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Available</p>
                  <p className="font-semibold">
                    ${Number(item.availableUSD).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Min Block</p>
                  <p className="font-semibold">
                    ${Number(item.minBlockUSD).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="font-semibold">${item.pricePerDollar}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
