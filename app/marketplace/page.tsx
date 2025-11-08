"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Sidebar from "@/components/Sidebar"
import Card from "@/components/Card"
import Button from "@/components/Button"
import CompanySelect from "@/components/CompanySelect"
import { formatNumber } from "@/lib/format"
import { formatDate } from "@/lib/date"

interface CreditInventory {
  id: string
  creditType: string
  taxYear: number
  faceValueUSD: number
  minBlockUSD: number
  pricePerDollar: number
  availableUSD: number
  closeBy?: string
  brokerName?: string
  stateRestriction?: string
}

export default function MarketplacePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [inventory, setInventory] = useState<CreditInventory[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCredit, setSelectedCredit] = useState<CreditInventory | null>(null)
  const [purchaseAmount, setPurchaseAmount] = useState("")
  const [companyId, setCompanyId] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    fetchInventory()
  }, [])

  useEffect(() => {
    if (session?.user.role === "COMPANY" && session.user.companyId) {
      setCompanyId(session.user.companyId as string)
    }
  }, [session])

  const fetchInventory = async () => {
    try {
      const res = await fetch("/api/inventory")
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

  const handleReserve = async (item: CreditInventory) => {
    if (!companyId) {
      alert("❌ Please select a company first.")
      return
    }
    
    try {
      const amount = parseFloat(purchaseAmount) || Number(item.minBlockUSD)
      
      const res = await fetch("/api/holds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inventoryId: item.id,
          amountUSD: amount,
          companyId,
        }),
      })

      if (res.ok) {
        alert("✅ Hold created successfully! Expires in 72 hours.")
        setSelectedCredit(null)
        setPurchaseAmount("")
        fetchInventory()
      } else {
        const data = await res.json()
        const errorMsg = data.error || "Failed to create hold"
        console.error("Hold error:", errorMsg)
        alert(`❌ Error: ${errorMsg}`)
      }
    } catch (error: any) {
      const errorMsg = error.message || "An error occurred while creating hold"
      console.error("Reserve error:", error)
      alert(`❌ Error: ${errorMsg}`)
    }
  }

  const handlePurchase = async (item: CreditInventory) => {
    if (!companyId) {
      alert("❌ Please select a company first.")
      return
    }
    
    try {
      const amount = parseFloat(purchaseAmount) || Number(item.minBlockUSD)
      
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inventoryId: item.id,
          amountUSD: amount,
          companyId,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        if (data.url) {
          window.location.href = data.url
        } else if (data.ok) {
          alert(`✅ ${data.message || "Order created successfully (demo mode)"}`)
          setSelectedCredit(null)
          setPurchaseAmount("")
          
          if (session?.user.role === "ADMIN") {
            router.push("/admin/purchases")
          } else {
            router.push("/dashboard")
          }
        }
      } else {
        const errorMsg = data.error || "Failed to create checkout"
        console.error("Checkout error:", errorMsg)
        alert(`❌ Error: ${errorMsg}`)
      }
    } catch (error: any) {
      const errorMsg = error.message || "An error occurred while processing your request"
      console.error("Purchase error:", error)
      alert(`❌ Error: ${errorMsg}`)
    }
  }

  if (status === "loading" || loading) {
    return <div className="flex items-center justify-center h-screen bg-[#0B1220] text-gray-100">Loading...</div>
  }

  if (!session) return null

  return (
    <div className="flex min-h-screen bg-[#0B1220]">
      <Sidebar role={session.user.role} />
      
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8 text-white">Tax Credit Marketplace</h1>

        {inventory.length === 0 ? (
          <div className="bg-[#0F172A] border border-white/5 rounded-xl p-8 text-center">
            <p className="text-gray-300">No credits available at this time.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inventory.map((item) => {
              const discount = 1 - Number(item.pricePerDollar)
              
              return (
                <div key={item.id} className="bg-[#0F172A] border border-white/5 rounded-xl shadow-md hover:shadow-lg transition p-6">
                  <h3 className="text-xl font-bold mb-4 text-white">
                    {item.creditType} {item.taxYear}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-100">
                      <span className="font-semibold text-gray-200">Available:</span>{" "}
                      <span suppressHydrationWarning>${formatNumber(Number(item.availableUSD))}</span>
                    </p>
                    <p className="text-sm text-gray-100">
                      <span className="font-semibold text-gray-200">Min Block:</span>{" "}
                      <span suppressHydrationWarning>${formatNumber(Number(item.minBlockUSD))}</span>
                    </p>
                    <p className="text-sm text-gray-100">
                      <span className="font-semibold text-gray-200">Price:</span>{" "}
                      ${item.pricePerDollar} per $1
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold text-green-400">
                        Discount: {(discount * 100).toFixed(1)}%
                      </span>
                    </p>
                    {item.stateRestriction && (
                      <p className="text-sm text-gray-100">
                        <span className="font-semibold text-gray-200">State:</span>{" "}
                        {item.stateRestriction}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedCredit(item)}
                    className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-xl transition"
                  >
                    View Details
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {selectedCredit && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#0F172A] border border-white/5 rounded-xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4 text-white">
                {selectedCredit.creditType} {selectedCredit.taxYear}
              </h2>

              {process.env.NEXT_PUBLIC_STRIPE_ON !== 'true' && (
                <div className="mb-4 px-4 py-3 bg-yellow-600/20 border border-yellow-600/30 rounded-lg">
                  <p className="text-sm text-yellow-200">
                    💡 <strong>Demo Mode:</strong> Payments are simulated — no real charges will be made.
                  </p>
                </div>
              )}

              <div className="space-y-3 mb-6">
                <p className="text-gray-100">
                  <span className="font-semibold text-gray-200">Face Value Available:</span>{" "}
                  <span suppressHydrationWarning>${formatNumber(Number(selectedCredit.availableUSD))}</span>
                </p>
                <p className="text-gray-100">
                  <span className="font-semibold text-gray-200">Minimum Block:</span>{" "}
                  <span suppressHydrationWarning>${formatNumber(Number(selectedCredit.minBlockUSD))}</span>
                </p>
                <p className="text-gray-100">
                  <span className="font-semibold text-gray-200">Price per Dollar:</span>{" "}
                  ${selectedCredit.pricePerDollar}
                </p>
                <p className="text-green-400 font-semibold">
                  Effective Discount:{" "}
                  {((1 - Number(selectedCredit.pricePerDollar)) * 100).toFixed(1)}%
                </p>
                {selectedCredit.brokerName && (
                  <p className="text-gray-100">
                    <span className="font-semibold text-gray-200">Broker:</span>{" "}
                    {selectedCredit.brokerName}
                  </p>
                )}
                {selectedCredit.closeBy && (
                  <p className="text-gray-100">
                    <span className="font-semibold text-gray-200">Transfer Window:</span>{" "}
                    {formatDate(selectedCredit.closeBy)}
                  </p>
                )}
              </div>

              {(session.user.role === "ACCOUNTANT" || session.user.role === "ADMIN") && (
                <div className="mb-4">
                  <CompanySelect value={companyId} onChange={setCompanyId} />
                  {!companyId && (
                    <p className="text-sm text-red-400 mt-1">
                      Select company to continue.
                    </p>
                  )}
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2 text-gray-200">
                  Purchase Amount (Face Value USD)
                </label>
                <input
                  type="number"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value)}
                  placeholder={`Min: ${Number(selectedCredit.minBlockUSD)}`}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand focus:outline-none text-gray-100 placeholder-gray-500"
                />
                {purchaseAmount && (
                  <p className="text-sm text-gray-400 mt-2">
                    Subtotal: <span suppressHydrationWarning>${formatNumber(
                      parseFloat(purchaseAmount) *
                      Number(selectedCredit.pricePerDollar)
                    )}</span>
                  </p>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => handleReserve(selectedCredit)}
                  disabled={!companyId}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-100 font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reserve (72h Hold)
                </button>
                <button
                  onClick={() => handlePurchase(selectedCredit)}
                  disabled={!companyId}
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Purchase Now
                </button>
              </div>

              <button
                onClick={() => {
                  setSelectedCredit(null)
                  setPurchaseAmount("")
                }}
                className="w-full mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-100 font-semibold rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
