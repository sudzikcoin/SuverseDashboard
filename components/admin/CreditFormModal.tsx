"use client"

import * as React from "react"

type Credit = {
  id?: string
  creditType: string
  taxYear: number | string
  faceValueUSD: number | string
  availableUSD: number | string
  minBlockUSD: number | string
  pricePerDollar: number | string
  status: "ACTIVE" | "INACTIVE"
  jurisdiction?: string
  stateRestriction?: string
  closeBy?: string
  brokerName?: string
  notes?: string
}

export default function CreditFormModal({
  open,
  onClose,
  initial,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  initial?: Partial<Credit>
  onSaved?: () => void
}) {
  const [loading, setLoading] = React.useState(false)
  const [form, setForm] = React.useState<Credit>({
    id: initial?.id,
    creditType: initial?.creditType || "",
    taxYear: initial?.taxYear ?? "",
    faceValueUSD: initial?.faceValueUSD ?? "",
    availableUSD: initial?.availableUSD ?? "",
    minBlockUSD: initial?.minBlockUSD ?? "",
    pricePerDollar: initial?.pricePerDollar ?? "",
    status: (initial?.status as any) || "ACTIVE",
    jurisdiction: initial?.jurisdiction || "",
    stateRestriction: initial?.stateRestriction || "",
    closeBy: initial?.closeBy || "",
    brokerName: initial?.brokerName || "",
    notes: initial?.notes || "",
  })

  React.useEffect(() => {
    setForm({
      id: initial?.id,
      creditType: initial?.creditType || "",
      taxYear: initial?.taxYear ?? "",
      faceValueUSD: initial?.faceValueUSD ?? "",
      availableUSD: initial?.availableUSD ?? "",
      minBlockUSD: initial?.minBlockUSD ?? "",
      pricePerDollar: initial?.pricePerDollar ?? "",
      status: (initial?.status as any) || "ACTIVE",
      jurisdiction: initial?.jurisdiction || "",
      stateRestriction: initial?.stateRestriction || "",
      closeBy: initial?.closeBy || "",
      brokerName: initial?.brokerName || "",
      notes: initial?.notes || "",
    })
  }, [initial, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const payload = {
      creditType: form.creditType,
      taxYear: Number(form.taxYear),
      faceValueUSD: Number(form.faceValueUSD),
      availableUSD: Number(form.availableUSD),
      minBlockUSD: Number(form.minBlockUSD),
      pricePerDollar: Number(form.pricePerDollar),
      status: form.status,
      jurisdiction: form.jurisdiction || null,
      stateRestriction: form.stateRestriction || null,
      closeBy: form.closeBy || null,
      brokerName: form.brokerName || null,
      notes: form.notes || null,
    }

    const res = await fetch(
      form.id ? `/api/admin/inventory/${form.id}` : "/api/admin/inventory",
      {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    )

    setLoading(false)

    if (!res.ok) {
      alert("Save failed")
      return
    }

    onSaved?.()
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-black/60 overflow-y-auto p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl rounded-xl bg-[#0f1a2b] p-6 border border-white/10 my-8"
      >
        <h3 className="text-2xl font-bold text-white mb-6">
          {form.id ? "Edit Tax Credit" : "Create Tax Credit"}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col text-sm text-white/90">
            Credit Type *
            <input
              className="mt-1 rounded-md bg-black/30 text-white p-2.5 border border-white/10 focus:border-emerald-500 outline-none"
              value={form.creditType}
              onChange={(e) => setForm((f) => ({ ...f, creditType: e.target.value }))}
              placeholder="e.g., ITC, PTC, 45Q"
              required
            />
          </label>

          <label className="flex flex-col text-sm text-white/90">
            Tax Year *
            <input
              type="number"
              className="mt-1 rounded-md bg-black/30 text-white p-2.5 border border-white/10 focus:border-emerald-500 outline-none"
              value={form.taxYear}
              onChange={(e) => setForm((f) => ({ ...f, taxYear: e.target.value }))}
              placeholder="2025"
              required
            />
          </label>

          <label className="flex flex-col text-sm text-white/90">
            Face Value (USD) *
            <input
              type="number"
              step="0.01"
              className="mt-1 rounded-md bg-black/30 text-white p-2.5 border border-white/10 focus:border-emerald-500 outline-none"
              value={form.faceValueUSD}
              onChange={(e) => setForm((f) => ({ ...f, faceValueUSD: e.target.value }))}
              placeholder="1000000"
              required
            />
          </label>

          <label className="flex flex-col text-sm text-white/90">
            Available (USD) *
            <input
              type="number"
              step="0.01"
              className="mt-1 rounded-md bg-black/30 text-white p-2.5 border border-white/10 focus:border-emerald-500 outline-none"
              value={form.availableUSD}
              onChange={(e) => setForm((f) => ({ ...f, availableUSD: e.target.value }))}
              placeholder="500000"
              required
            />
          </label>

          <label className="flex flex-col text-sm text-white/90">
            Min Block (USD) *
            <input
              type="number"
              step="0.01"
              className="mt-1 rounded-md bg-black/30 text-white p-2.5 border border-white/10 focus:border-emerald-500 outline-none"
              value={form.minBlockUSD}
              onChange={(e) => setForm((f) => ({ ...f, minBlockUSD: e.target.value }))}
              placeholder="50000"
              required
            />
          </label>

          <label className="flex flex-col text-sm text-white/90">
            Price per $1 *
            <input
              type="number"
              step="0.01"
              className="mt-1 rounded-md bg-black/30 text-white p-2.5 border border-white/10 focus:border-emerald-500 outline-none"
              value={form.pricePerDollar}
              onChange={(e) => setForm((f) => ({ ...f, pricePerDollar: e.target.value }))}
              placeholder="0.89"
              required
            />
          </label>

          <label className="flex flex-col text-sm text-white/90">
            Jurisdiction
            <input
              className="mt-1 rounded-md bg-black/30 text-white p-2.5 border border-white/10 focus:border-emerald-500 outline-none"
              value={form.jurisdiction}
              onChange={(e) => setForm((f) => ({ ...f, jurisdiction: e.target.value }))}
              placeholder="Federal"
            />
          </label>

          <label className="flex flex-col text-sm text-white/90">
            State Restriction
            <input
              className="mt-1 rounded-md bg-black/30 text-white p-2.5 border border-white/10 focus:border-emerald-500 outline-none"
              value={form.stateRestriction}
              onChange={(e) => setForm((f) => ({ ...f, stateRestriction: e.target.value }))}
              placeholder="CA, NY"
            />
          </label>

          <label className="flex flex-col text-sm text-white/90">
            Broker Name
            <input
              className="mt-1 rounded-md bg-black/30 text-white p-2.5 border border-white/10 focus:border-emerald-500 outline-none"
              value={form.brokerName}
              onChange={(e) => setForm((f) => ({ ...f, brokerName: e.target.value }))}
              placeholder="Broker LLC"
            />
          </label>

          <label className="flex flex-col text-sm text-white/90">
            Close By Date
            <input
              type="date"
              className="mt-1 rounded-md bg-black/30 text-white p-2.5 border border-white/10 focus:border-emerald-500 outline-none"
              value={form.closeBy}
              onChange={(e) => setForm((f) => ({ ...f, closeBy: e.target.value }))}
            />
          </label>

          <label className="flex flex-col text-sm text-white/90">
            Status *
            <select
              className="mt-1 rounded-md bg-black/30 text-white p-2.5 border border-white/10 focus:border-emerald-500 outline-none"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </label>

          <label className="flex flex-col text-sm text-white/90 sm:col-span-2">
            Notes
            <textarea
              className="mt-1 rounded-md bg-black/30 text-white p-2.5 border border-white/10 focus:border-emerald-500 outline-none"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Additional notes..."
              rows={3}
            />
          </label>
        </div>

        <div className="mt-6 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-md bg-white/10 text-white hover:bg-white/20 transition font-medium"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            className="px-5 py-2.5 rounded-md bg-emerald-500 hover:bg-emerald-600 text-black font-semibold transition disabled:opacity-50"
          >
            {loading ? "Saving..." : form.id ? "Save Changes" : "Create Credit"}
          </button>
        </div>
      </form>
    </div>
  )
}
