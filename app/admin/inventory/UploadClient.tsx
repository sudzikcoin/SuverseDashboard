"use client"

import { useState } from "react"

export default function UploadClient() {
  const [file, setFile] = useState<File | null>(null)
  const [source, setSource] = useState("")
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    
    setBusy(true)
    setMsg(null)
    
    const fd = new FormData()
    fd.append("file", file)
    if (source) fd.append("source", source)
    
    try {
      const res = await fetch("/api/admin/credits/upload", {
        method: "POST",
        body: fd,
      })
      const data = await res.json()
      setBusy(false)
      
      if (!res.ok) {
        setMsg(data.error || "Import failed")
        return
      }
      
      setMsg(
        `✓ Imported: ${data.counts?.created || 0} new, ${
          data.counts?.updated || 0
        } updated`
      )
      setFile(null)
      setSource("")
      
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      setBusy(false)
      setMsg("Import failed: " + (error as Error).message)
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl bg-su-card border border-white/10 p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl font-semibold text-su-text">
            Import Broker File
          </div>
          <div className="text-sm text-su-muted mt-1">
            Upload .xlsx or .csv file with tax credit inventory
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-su-text mb-2">
            File (.xlsx / .csv)
          </label>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            required
            className="block w-full text-sm text-su-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-su-emerald file:text-black hover:file:bg-su-emerald/90 cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-su-text mb-2">
            Source Tag (optional)
          </label>
          <input
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="e.g., ACME_JAN2026"
            className="w-full rounded-lg bg-black/30 border border-white/10 px-4 py-2 text-su-text placeholder:text-su-muted/50 focus:outline-none focus:ring-2 focus:ring-su-emerald/50"
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={busy || !file}
            className="w-full rounded-lg bg-su-emerald text-black px-6 py-2.5 font-semibold hover:bg-su-emerald/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {busy ? "Importing..." : "Import Credits"}
          </button>
        </div>
      </div>

      {msg && (
        <div
          className={`text-sm p-3 rounded-lg ${
            msg.startsWith("✓")
              ? "bg-su-emerald/10 text-su-emerald border border-su-emerald/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {msg}
        </div>
      )}

      <div className="text-xs text-su-muted space-y-1 pt-2 border-t border-white/5">
        <p className="font-semibold">Expected columns (case-insensitive):</p>
        <p>
          <span className="font-mono bg-black/30 px-1.5 py-0.5 rounded">
            brokerRef, source, creditType, taxYear, state, jurisdiction,
            faceValueUSD, availableUSD, minBlockUSD, pricePerDollar, status,
            brokerName, notes
          </span>
        </p>
        <p className="text-su-muted/70 mt-2">
          💡 Tip: Use <strong>brokerRef</strong> for idempotent updates (prevents
          duplicates on re-import)
        </p>
      </div>
    </form>
  )
}
