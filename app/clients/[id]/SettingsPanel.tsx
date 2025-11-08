"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatDate } from "@/lib/date"

interface SettingsPanelProps {
  company: any
}

export default function SettingsPanel({ company }: SettingsPanelProps) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleArchive = async () => {
    setIsProcessing(true)
    try {
      const res = await fetch(`/api/companies/${company.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        router.push("/clients")
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || "Failed to archive company")
      }
    } catch (error) {
      console.error("Error archiving company:", error)
      alert("Failed to archive company")
    } finally {
      setIsProcessing(false)
      setShowConfirm(false)
    }
  }

  const handleUnarchive = async () => {
    setIsProcessing(true)
    try {
      const res = await fetch(`/api/companies/${company.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unarchive" }),
      })

      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || "Failed to unarchive company")
      }
    } catch (error) {
      console.error("Error unarchiving company:", error)
      alert("Failed to unarchive company")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-100 mb-4">Settings</h2>
      </div>

      {company.deletedAt ? (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">Company Archived</h3>
              <p className="text-gray-300 mb-4">
                This company was archived on {formatDate(company.deletedAt)}. 
                You can restore it at any time.
              </p>
              <button
                onClick={handleUnarchive}
                disabled={isProcessing}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-2 rounded-lg transition disabled:opacity-50"
              >
                {isProcessing ? "Restoring..." : "Restore Company"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h3>
              <p className="text-gray-300 mb-4">
                Archiving this company will hide it from the clients list. All data will be preserved 
                and you can restore it later.
              </p>
              <button
                onClick={() => setShowConfirm(true)}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold px-6 py-2 rounded-lg transition"
              >
                Archive Company
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0F172A] border border-white/5 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-100 mb-4">Confirm Archive</h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to archive <strong>{company.legalName}</strong>? 
              This will hide the company from the clients list, but all data will be preserved.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isProcessing}
                className="flex-1 bg-white/5 hover:bg-white/10 text-gray-100 px-4 py-2 rounded-xl transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleArchive}
                disabled={isProcessing}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-xl transition disabled:opacity-50"
              >
                {isProcessing ? "Archiving..." : "Archive"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
