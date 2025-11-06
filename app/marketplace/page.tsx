"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Sidebar from "@/components/Sidebar"
import Card from "@/components/Card"
import Button from "@/components/Button"

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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    fetchInventory()
  }, [])

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
    try {
      const amount = parseFloat(purchaseAmount) || Number(item.minBlockUSD)
      
      const res = await fetch("/api/holds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inventoryId: item.id,
          amountUSD: amount,
        }),
      })

      if (res.ok) {
        alert("Hold created successfully! Expires in 72 hours.")
        setSelectedCredit(null)
        fetchInventory()
      } else {
        const data = await res.json()
        alert(data.error || "Failed to create hold")
      }
    } catch (error) {
      alert("An error occurred")
    }
  }

  const handlePurchase = async (item: CreditInventory) => {
    try {
      const amount = parseFloat(purchaseAmount) || Number(item.minBlockUSD)
      
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inventoryId: item.id,
          amountUSD: amount,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        window.location.href = data.url
      } else {
        const data = await res.json()
        alert(data.error || "Failed to create checkout")
      }
    } catch (error) {
      alert("An error occurred")
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
        <h1 className="text-3xl font-bold mb-8">Tax Credit Marketplace</h1>

        {inventory.length === 0 ? (
          <Card>
            <p className="text-gray-600">No credits available at this time.</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inventory.map((item) => {
              const discount = 1 - Number(item.pricePerDollar)
              
              return (
                <Card key={item.id}>
                  <h3 className="text-xl font-bold mb-2">
                    {item.creditType} {item.taxYear}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-sm">
                      <span className="font-semibold">Available:</span>{" "}
                      ${Number(item.availableUSD).toLocaleString()}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Min Block:</span>{" "}
                      ${Number(item.minBlockUSD).toLocaleString()}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Price:</span>{" "}
                      ${item.pricePerDollar} per $1
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold text-green-600">
                        Discount: {(discount * 100).toFixed(1)}%
                      </span>
                    </p>
                    {item.stateRestriction && (
                      <p className="text-sm">
                        <span className="font-semibold">State:</span>{" "}
                        {item.stateRestriction}
                      </p>
                    )}
                  </div>

                  <Button
                    onClick={() => setSelectedCredit(item)}
                    className="w-full"
                  >
                    View Details
                  </Button>
                </Card>
              )
            })}
          </div>
        )}

        {selectedCredit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">
                {selectedCredit.creditType} {selectedCredit.taxYear}
              </h2>

              <div className="space-y-3 mb-6">
                <p>
                  <span className="font-semibold">Face Value Available:</span>{" "}
                  ${Number(selectedCredit.availableUSD).toLocaleString()}
                </p>
                <p>
                  <span className="font-semibold">Minimum Block:</span>{" "}
                  ${Number(selectedCredit.minBlockUSD).toLocaleString()}
                </p>
                <p>
                  <span className="font-semibold">Price per Dollar:</span>{" "}
                  ${selectedCredit.pricePerDollar}
                </p>
                <p className="text-green-600 font-semibold">
                  Effective Discount:{" "}
                  {((1 - Number(selectedCredit.pricePerDollar)) * 100).toFixed(1)}%
                </p>
                {selectedCredit.brokerName && (
                  <p>
                    <span className="font-semibold">Broker:</span>{" "}
                    {selectedCredit.brokerName}
                  </p>
                )}
                {selectedCredit.closeBy && (
                  <p>
                    <span className="font-semibold">Transfer Window:</span>{" "}
                    {new Date(selectedCredit.closeBy).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Purchase Amount (Face Value USD)
                </label>
                <input
                  type="number"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value)}
                  placeholder={`Min: ${Number(selectedCredit.minBlockUSD)}`}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                {purchaseAmount && (
                  <p className="text-sm text-gray-600 mt-2">
                    Subtotal: $
                    {(
                      parseFloat(purchaseAmount) *
                      Number(selectedCredit.pricePerDollar)
                    ).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => handleReserve(selectedCredit)}
                  variant="secondary"
                  className="flex-1"
                >
                  Reserve (72h Hold)
                </Button>
                <Button
                  onClick={() => handlePurchase(selectedCredit)}
                  className="flex-1"
                >
                  Purchase Now
                </Button>
              </div>

              <Button
                onClick={() => {
                  setSelectedCredit(null)
                  setPurchaseAmount("")
                }}
                variant="secondary"
                className="w-full mt-4"
              >
                Close
              </Button>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
