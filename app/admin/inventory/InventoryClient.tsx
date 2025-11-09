"use client"

import * as React from "react"
import CreditFormModal from "@/components/admin/CreditFormModal"
import { useRouter } from "next/navigation"
import { formatNumber } from "@/lib/format"

export default function InventoryClient({ credits }: { credits: any[] }) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<any | null>(null)

  async function handleDelete(id: string, creditType: string) {
    if (!confirm(`Delete ${creditType}? This action cannot be undone.`)) return

    const res = await fetch(`/api/admin/inventory/${id}`, { method: "DELETE" })
    if (!res.ok) {
      alert("Delete failed")
      return
    }

    router.refresh()
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white">Inventory Management</h1>
          <p className="text-su-muted mt-2">Manage tax credit inventory</p>
        </div>
        <div className="flex gap-3">
          <a
            href="/api/admin/export/inventory"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition border border-white/10"
          >
            Export CSV
          </a>
          <button
            onClick={() => {
              setEditing(null)
              setOpen(true)
            }}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-semibold transition shadow-lg"
          >
            + New Credit
          </button>
        </div>
      </div>

      {credits.length === 0 ? (
        <div className="bg-su-card border border-white/10 rounded-2xl p-12 text-center">
          <p className="text-su-muted text-lg">No tax credits in inventory yet.</p>
          <p className="text-white/60 text-sm mt-2">Click "New Credit" to create one.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {credits.map((c) => (
            <div
              key={c.id}
              className="glass halo rounded-2xl border-white/10 transition hover:bg-white/5 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {c.creditType} {c.taxYear}
                  </h3>
                  <p className="text-sm text-su-muted mt-1">ID: {c.id.slice(0, 12)}...</p>
                </div>
                <span
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                    c.status === "ACTIVE"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-white/10 text-white/60"
                  }`}
                >
                  {c.status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-white/60 text-sm mb-1">Face Value</div>
                  <div className="text-white font-semibold font-mono tabular-nums">
                    ${formatNumber(Number(c.faceValueUSD))}
                  </div>
                </div>
                <div>
                  <div className="text-white/60 text-sm mb-1">Available</div>
                  <div className="text-white font-semibold font-mono tabular-nums">
                    ${formatNumber(Number(c.availableUSD))}
                  </div>
                </div>
                <div>
                  <div className="text-white/60 text-sm mb-1">Min Block</div>
                  <div className="text-white font-semibold font-mono tabular-nums">
                    ${formatNumber(Number(c.minBlockUSD))}
                  </div>
                </div>
                <div>
                  <div className="text-white/60 text-sm mb-1">Price</div>
                  <div className="text-emerald-400 font-semibold font-mono">
                    ${Number(c.pricePerDollar).toFixed(2)} per $1
                  </div>
                </div>
              </div>

              {(c.jurisdiction || c.stateRestriction || c.brokerName) && (
                <div className="flex gap-4 mb-4 text-sm">
                  {c.jurisdiction && (
                    <div>
                      <span className="text-white/60">Jurisdiction:</span>{" "}
                      <span className="text-white">{c.jurisdiction}</span>
                    </div>
                  )}
                  {c.stateRestriction && (
                    <div>
                      <span className="text-white/60">State:</span>{" "}
                      <span className="text-white">{c.stateRestriction}</span>
                    </div>
                  )}
                  {c.brokerName && (
                    <div>
                      <span className="text-white/60">Broker:</span>{" "}
                      <span className="text-white">{c.brokerName}</span>
                    </div>
                  )}
                </div>
              )}

              {c.notes && (
                <div className="mb-4 p-3 bg-white/5 rounded-lg">
                  <div className="text-white/60 text-xs mb-1">Notes</div>
                  <div className="text-white/90 text-sm">{c.notes}</div>
                </div>
              )}

              <div className="flex gap-3 pt-2 border-t border-white/10">
                <button
                  onClick={() => {
                    setEditing(c)
                    setOpen(true)
                  }}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(c.id, `${c.creditType} ${c.taxYear}`)}
                  className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreditFormModal
        open={open}
        initial={editing ?? undefined}
        onClose={() => setOpen(false)}
        onSaved={() => router.refresh()}
      />
    </div>
  )
}
