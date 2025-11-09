"use client"

import { useEffect, useState } from "react"
import { formatNumber } from "@/lib/format"

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInventory()
  }, [])

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

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-su-text">Loading...</div>
  }

  return (
    <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Inventory Management</h1>
          <a
            href="/api/admin/export/inventory"
            className="px-4 py-2 bg-su-emerald hover:bg-su-emerald-700 text-black font-semibold rounded-xl shadow glow-emerald transition"
          >
            Export CSV
          </a>
        </div>

        <div className="space-y-4">
          {inventory.map((item: any) => (
            <div key={item.id} className="glass halo rounded-2xl border-white/10 transition hover:bg-white/10 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {item.creditType} {item.taxYear}
                  </h3>
                  <p className="text-sm text-su-muted">ID: {item.id}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  item.status === "ACTIVE"
                    ? "bg-su-emerald text-black glow-emerald"
                    : "glass text-su-muted"
                }`}>
                  {item.status}
                </span>
              </div>

              <div className="mt-4 grid md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-semibold text-white/90">Face Value</p>
                  <p className="text-white font-mono tabular-nums font-semibold" suppressHydrationWarning>
                    ${formatNumber(Number(item.faceValueUSD))}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/90">Available</p>
                  <p className="text-white font-mono tabular-nums font-semibold" suppressHydrationWarning>
                    ${formatNumber(Number(item.availableUSD))}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/90">Min Block</p>
                  <p className="text-white font-mono tabular-nums font-semibold" suppressHydrationWarning>
                    ${formatNumber(Number(item.minBlockUSD))}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/90">Price</p>
                  <p className="text-su-emerald font-mono tabular-nums font-semibold">${item.pricePerDollar}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
    </div>
  )
}
