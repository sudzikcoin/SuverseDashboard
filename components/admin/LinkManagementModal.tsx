"use client"

import { useState, useEffect } from "react"
import { createAuditLog } from "@/lib/audit"

interface Company {
  id: string
  legalName: string
  ein?: string | null
  state?: string | null
}

interface LinkManagementModalProps {
  accountantId: string
  accountantName: string
  linkedCompanies: Company[]
  onClose: () => void
  onUpdate: () => void
}

export default function LinkManagementModal({
  accountantId,
  accountantName,
  linkedCompanies,
  onClose,
  onUpdate,
}: LinkManagementModalProps) {
  const [allCompanies, setAllCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [linking, setLinking] = useState<string | null>(null)

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const res = await fetch("/api/admin/companies")
      if (res.ok) {
        const data = await res.json()
        setAllCompanies(data.companies)
      }
    } catch (error) {
      console.error("Failed to fetch companies:", error)
    } finally {
      setLoading(false)
    }
  }

  const isLinked = (companyId: string) => {
    return linkedCompanies.some((c) => c.id === companyId)
  }

  const handleLink = async (companyId: string) => {
    setLinking(companyId)
    try {
      const res = await fetch("/api/accountant/company/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountantId, companyId }),
      })

      if (res.ok) {
        onUpdate()
      } else {
        const error = await res.json()
        alert(error.error || "Failed to link")
      }
    } catch (error) {
      console.error("Link error:", error)
      alert("Failed to link accountant to company")
    } finally {
      setLinking(null)
    }
  }

  const handleUnlink = async (companyId: string) => {
    setLinking(companyId)
    try {
      const res = await fetch("/api/accountant/company/link", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountantId, companyId }),
      })

      if (res.ok) {
        onUpdate()
      } else {
        const error = await res.json()
        alert(error.error || "Failed to unlink")
      }
    } catch (error) {
      console.error("Unlink error:", error)
      alert("Failed to unlink accountant from company")
    } finally {
      setLinking(null)
    }
  }

  const filteredCompanies = allCompanies.filter(
    (c) =>
      c.legalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ein?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.state?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-su-card border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Manage Company Links
            </h2>
            <p className="text-su-muted mt-1">
              Accountant: {accountantName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-su-muted hover:text-white transition"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-su-muted focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {loading ? (
          <div className="text-center py-8 text-su-muted">Loading companies...</div>
        ) : (
          <div className="space-y-2">
            {filteredCompanies.map((company) => {
              const linked = isLinked(company.id)
              const isProcessing = linking === company.id

              return (
                <div
                  key={company.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition"
                >
                  <div>
                    <p className="text-white font-medium">{company.legalName}</p>
                    <p className="text-sm text-su-muted">
                      {company.state && `${company.state} • `}
                      {company.ein || "No EIN"}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      linked ? handleUnlink(company.id) : handleLink(company.id)
                    }
                    disabled={isProcessing}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      linked
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-emerald-500 hover:bg-emerald-600 text-black"
                    } disabled:opacity-50`}
                  >
                    {isProcessing ? "..." : linked ? "Unlink" : "Link"}
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {!loading && filteredCompanies.length === 0 && (
          <div className="text-center py-8 text-su-muted">
            No companies found
          </div>
        )}
      </div>
    </div>
  )
}
