"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface CreditPoolFormProps {
  mode: "create" | "edit"
  poolId?: string
}

export default function CreditPoolForm({ mode, poolId }: CreditPoolFormProps) {
  const router = useRouter()
  const [showToast, setShowToast] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    programName: "",
    creditYear: "2025",
    creditType: "ITC",
    state: "CA",
    programCode: "",
    registryId: "",
    totalFaceValue: "",
    faceValueAvailable: "",
    minBlock: "",
    pricePerDollar: "",
    maxOrderSize: "",
    eligibleIndustries: [] as string[],
    specialConditions: "",
    requiresPreApproval: false,
    offerStartDate: "",
    offerExpiryDate: "",
    settlementTime: "7",
    visibility: "PUBLIC",
    status: "DRAFT",
  })

  // Fetch pool data for edit mode
  useEffect(() => {
    if (mode === "edit" && poolId) {
      setLoading(true)
      fetch(`/api/broker/inventory/${poolId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch pool")
          return res.json()
        })
        .then((pool) => {
          setFormData({
            programName: pool.programName || "",
            creditYear: pool.creditYear?.toString() || "2025",
            creditType: pool.creditType || "ITC",
            state: pool.jurisdiction || "CA",
            programCode: pool.programCode || "",
            registryId: pool.registryId || "",
            totalFaceValue: pool.totalFaceValueUsd?.toString() || "",
            faceValueAvailable: pool.availableFaceValueUsd?.toString() || "",
            minBlock: pool.minBlockUsd?.toString() || "",
            pricePerDollar: pool.pricePerDollar?.toString() || "",
            maxOrderSize: "",
            eligibleIndustries: [],
            specialConditions: "",
            requiresPreApproval: false,
            offerStartDate: pool.offerStartDate
              ? new Date(pool.offerStartDate).toISOString().split("T")[0]
              : "",
            offerExpiryDate: pool.offerExpiryDate
              ? new Date(pool.offerExpiryDate).toISOString().split("T")[0]
              : "",
            settlementTime: pool.expectedSettlementDays?.toString() || "7",
            visibility: pool.visibility || "PUBLIC",
            status: pool.status || "DRAFT",
          })
          setLoading(false)
        })
        .catch((err) => {
          setError(err.message)
          setLoading(false)
        })
    }
  }, [mode, poolId])

  const calculateDiscount = () => {
    const price = parseFloat(formData.pricePerDollar)
    if (isNaN(price) || price <= 0) return "0.00"
    return ((1 - price) * 100).toFixed(2)
  }

  const handleSubmit = async (action: "draft" | "publish") => {
    setLoading(true)
    setError(null)

    try {
      // TODO: Add input validation using Zod
      const payload = {
        programName: formData.programName,
        creditYear: formData.creditYear,
        creditType: formData.creditType,
        jurisdiction: formData.state,
        programCode: formData.programCode,
        registryId: formData.registryId,
        totalFaceValueUsd: parseFloat(formData.totalFaceValue),
        availableFaceValueUsd: parseFloat(formData.faceValueAvailable),
        minBlockUsd: parseFloat(formData.minBlock),
        pricePerDollar: parseFloat(formData.pricePerDollar),
        offerStartDate: formData.offerStartDate || null,
        offerExpiryDate: formData.offerExpiryDate || null,
        expectedSettlementDays: parseInt(formData.settlementTime),
        visibility: formData.visibility,
        status: action === "draft" ? "DRAFT" : "ACTIVE",
      }

      const url =
        mode === "create"
          ? "/api/broker/inventory"
          : `/api/broker/inventory/${poolId}`
      const method = mode === "create" ? "POST" : "PATCH"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Failed to save pool")
      }

      setShowToast(true)
      setTimeout(() => {
        router.push("/broker/inventory")
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setLoading(false)
    }
  }

  const industries = [
    "Solar Energy",
    "Wind Energy",
    "Manufacturing",
    "Real Estate",
    "Carbon Capture",
    "EV Infrastructure",
  ]

  const toggleIndustry = (industry: string) => {
    setFormData(prev => ({
      ...prev,
      eligibleIndustries: prev.eligibleIndustries.includes(industry)
        ? prev.eligibleIndustries.filter(i => i !== industry)
        : [...prev.eligibleIndustries, industry]
    }))
  }

  if (loading && mode === "edit" && !formData.programName) {
    return (
      <div className="p-8 text-center">
        <p className="text-su-muted">Loading pool data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {showToast && (
        <div className="fixed top-4 right-4 z-50 glass border-emerald-500/30 rounded-xl p-4 animate-in slide-in-from-top">
          <p className="text-emerald-400 font-medium">
            ✓ Pool {mode === "create" ? "created" : "updated"} successfully
          </p>
        </div>
      )}

      {error && (
        <div className="glass border-red-500/30 rounded-xl p-4">
          <p className="text-red-400 font-medium">Error: {error}</p>
        </div>
      )}

      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-su-text mb-4">Program Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-su-muted mb-2">
              Program Name
            </label>
            <input
              type="text"
              value={formData.programName}
              onChange={(e) => setFormData({ ...formData, programName: e.target.value })}
              className="w-full px-4 py-2 bg-su-base border border-white/10 rounded-xl text-su-text focus:border-su-emerald focus:outline-none"
              placeholder="e.g., C48E 2025"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-su-muted mb-2">
              Credit Year
            </label>
            <select
              value={formData.creditYear}
              onChange={(e) => setFormData({ ...formData, creditYear: e.target.value })}
              className="w-full px-4 py-2 bg-su-base border border-white/10 rounded-xl text-su-text focus:border-su-emerald focus:outline-none"
            >
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-su-muted mb-2">
              Credit Type
            </label>
            <select
              value={formData.creditType}
              onChange={(e) => setFormData({ ...formData, creditType: e.target.value })}
              className="w-full px-4 py-2 bg-su-base border border-white/10 rounded-xl text-su-text focus:border-su-emerald focus:outline-none"
            >
              <option value="ITC">ITC - Investment Tax Credit</option>
              <option value="PTC">PTC - Production Tax Credit</option>
              <option value="45Q">45Q - Carbon Capture</option>
              <option value="48E">48E - Clean Electricity</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-su-muted mb-2">
              Jurisdiction / State
            </label>
            <select
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full px-4 py-2 bg-su-base border border-white/10 rounded-xl text-su-text focus:border-su-emerald focus:outline-none"
            >
              <option value="CA">California</option>
              <option value="TX">Texas</option>
              <option value="NY">New York</option>
              <option value="IL">Illinois</option>
              <option value="FL">Florida</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-su-muted mb-2">
              Program Code / Reference
            </label>
            <input
              type="text"
              value={formData.programCode}
              onChange={(e) => setFormData({ ...formData, programCode: e.target.value })}
              className="w-full px-4 py-2 bg-su-base border border-white/10 rounded-xl text-su-text focus:border-su-emerald focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-su-muted mb-2">
              Registry / Tracking ID (optional)
            </label>
            <input
              type="text"
              value={formData.registryId}
              onChange={(e) => setFormData({ ...formData, registryId: e.target.value })}
              className="w-full px-4 py-2 bg-su-base border border-white/10 rounded-xl text-su-text focus:border-su-emerald focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-su-text mb-4">Financial Terms</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-su-muted mb-2">
              Total Face Value (USD)
            </label>
            <input
              type="number"
              value={formData.totalFaceValue}
              onChange={(e) => setFormData({ ...formData, totalFaceValue: e.target.value })}
              className="w-full px-4 py-2 bg-su-base border border-white/10 rounded-xl text-su-text focus:border-su-emerald focus:outline-none"
              placeholder="5000000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-su-muted mb-2">
              Face Value Available (USD)
            </label>
            <input
              type="number"
              value={formData.faceValueAvailable}
              onChange={(e) => setFormData({ ...formData, faceValueAvailable: e.target.value })}
              className="w-full px-4 py-2 bg-su-base border border-white/10 rounded-xl text-su-text focus:border-su-emerald focus:outline-none"
              placeholder="5000000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-su-muted mb-2">
              Minimum Block (USD)
            </label>
            <input
              type="number"
              value={formData.minBlock}
              onChange={(e) => setFormData({ ...formData, minBlock: e.target.value })}
              className="w-full px-4 py-2 bg-su-base border border-white/10 rounded-xl text-su-text focus:border-su-emerald focus:outline-none"
              placeholder="100000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-su-muted mb-2">
              Price per $1
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.pricePerDollar}
              onChange={(e) => setFormData({ ...formData, pricePerDollar: e.target.value })}
              className="w-full px-4 py-2 bg-su-base border border-white/10 rounded-xl text-su-text focus:border-su-emerald focus:outline-none"
              placeholder="0.92"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-su-muted mb-2">
              Effective Discount %
            </label>
            <input
              type="text"
              value={calculateDiscount()}
              readOnly
              className="w-full px-4 py-2 bg-su-base/50 border border-white/10 rounded-xl text-su-emerald font-medium cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-su-muted mb-2">
              Maximum Order Size (optional)
            </label>
            <input
              type="number"
              value={formData.maxOrderSize}
              onChange={(e) => setFormData({ ...formData, maxOrderSize: e.target.value })}
              className="w-full px-4 py-2 bg-su-base border border-white/10 rounded-xl text-su-text focus:border-su-emerald focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-su-text mb-4">Eligibility & Restrictions</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-su-muted mb-2">
              Eligible Industries
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {industries.map((industry) => (
                <label key={industry} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.eligibleIndustries.includes(industry)}
                    onChange={() => toggleIndustry(industry)}
                    className="w-4 h-4 rounded border-white/10 bg-su-base text-su-emerald focus:ring-su-emerald"
                  />
                  <span className="text-sm text-su-text">{industry}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-su-muted mb-2">
              Special Conditions
            </label>
            <textarea
              value={formData.specialConditions}
              onChange={(e) => setFormData({ ...formData, specialConditions: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 bg-su-base border border-white/10 rounded-xl text-su-text focus:border-su-emerald focus:outline-none resize-none"
              placeholder="Enter any special requirements or conditions..."
            />
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.requiresPreApproval}
                onChange={(e) => setFormData({ ...formData, requiresPreApproval: e.target.checked })}
                className="w-4 h-4 rounded border-white/10 bg-su-base text-su-emerald focus:ring-su-emerald"
              />
              <span className="text-sm text-su-text">Requires Pre-Approval</span>
            </label>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-su-text mb-4">Timing</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-su-muted mb-2">
              Offer Start Date
            </label>
            <input
              type="date"
              value={formData.offerStartDate}
              onChange={(e) => setFormData({ ...formData, offerStartDate: e.target.value })}
              className="w-full px-4 py-2 bg-su-base border border-white/10 rounded-xl text-su-text focus:border-su-emerald focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-su-muted mb-2">
              Offer Expiry Date
            </label>
            <input
              type="date"
              value={formData.offerExpiryDate}
              onChange={(e) => setFormData({ ...formData, offerExpiryDate: e.target.value })}
              className="w-full px-4 py-2 bg-su-base border border-white/10 rounded-xl text-su-text focus:border-su-emerald focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-su-muted mb-2">
              Expected Settlement Time
            </label>
            <select
              value={formData.settlementTime}
              onChange={(e) => setFormData({ ...formData, settlementTime: e.target.value })}
              className="w-full px-4 py-2 bg-su-base border border-white/10 rounded-xl text-su-text focus:border-su-emerald focus:outline-none"
            >
              <option value="3">3 days</option>
              <option value="7">7 days</option>
              <option value="14">14 days</option>
            </select>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-su-text mb-4">Visibility & Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-su-muted mb-2">
              Visibility
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  value="PUBLIC"
                  checked={formData.visibility === "PUBLIC"}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                  className="w-4 h-4 border-white/10 bg-su-base text-su-emerald focus:ring-su-emerald"
                />
                <span className="text-sm text-su-text">Public - Visible to all companies</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  value="PRIVATE"
                  checked={formData.visibility === "PRIVATE"}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                  className="w-4 h-4 border-white/10 bg-su-base text-su-emerald focus:ring-su-emerald"
                />
                <span className="text-sm text-su-text">Private - By invitation only</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-su-muted mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 bg-su-base border border-white/10 rounded-xl text-su-text focus:border-su-emerald focus:outline-none"
            >
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-end">
        <button
          onClick={() => router.push("/broker/inventory")}
          disabled={loading}
          className="px-6 py-3 glass hover:bg-white/10 text-su-text rounded-xl transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          onClick={() => handleSubmit("draft")}
          disabled={loading}
          className="px-6 py-3 glass hover:bg-white/10 text-su-text rounded-xl transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : "Save as Draft"}
        </button>
        <button
          onClick={() => handleSubmit("publish")}
          disabled={loading}
          className="px-6 py-3 bg-su-emerald hover:bg-su-emerald/90 text-white rounded-xl transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Publishing..." : "Publish"}
        </button>
      </div>
    </div>
  )
}
