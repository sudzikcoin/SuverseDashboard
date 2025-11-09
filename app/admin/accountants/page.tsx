"use client"

import { useState, useEffect } from "react"
import LinkManagementModal from "@/components/admin/LinkManagementModal"

interface Accountant {
  id: string
  email: string
  name: string | null
  createdAt: string
  accountantClients: Array<{
    company: {
      id: string
      legalName: string
      ein: string | null
      state: string | null
      contactEmail: string
    }
  }>
}

export default function AccountantsPage() {
  const [accountants, setAccountants] = useState<Accountant[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAccountant, setSelectedAccountant] = useState<Accountant | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchAccountants()
  }, [])

  const fetchAccountants = async () => {
    try {
      const res = await fetch("/api/admin/accountants")
      if (res.ok) {
        const data = await res.json()
        setAccountants(data.accountants)
      }
    } catch (error) {
      console.error("Failed to fetch accountants:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAccountants = accountants.filter(
    (acc) =>
      acc.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white">Accountants</h1>
        <p className="text-su-muted mt-2">
          Manage accountants and their company links
        </p>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search accountants..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 bg-su-card border border-white/10 rounded-xl text-white placeholder-su-muted focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-su-muted">Loading...</div>
      ) : filteredAccountants.length === 0 ? (
        <div className="bg-su-card border border-white/10 rounded-2xl p-12 text-center">
          <p className="text-su-muted text-lg">No accountants found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAccountants.map((accountant) => (
            <div
              key={accountant.id}
              className="bg-su-card border border-white/10 rounded-2xl p-6 hover:border-emerald-500/30 transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {accountant.name || accountant.email}
                  </h3>
                  {accountant.name && (
                    <p className="text-sm text-su-muted">{accountant.email}</p>
                  )}
                  <p className="text-xs text-su-muted mt-1">
                    ID: {accountant.id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedAccountant(accountant)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-lg transition"
                >
                  Manage Links
                </button>
              </div>

              <div className="border-t border-white/10 pt-4">
                <p className="text-sm text-su-muted mb-2">
                  Linked Companies ({accountant.accountantClients.length})
                </p>
                {accountant.accountantClients.length === 0 ? (
                  <p className="text-sm text-su-muted italic">No companies linked</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {accountant.accountantClients.map((link) => (
                      <div
                        key={link.company.id}
                        className="bg-white/5 rounded-lg p-3"
                      >
                        <p className="text-white font-medium text-sm">
                          {link.company.legalName}
                        </p>
                        <p className="text-xs text-su-muted">
                          {link.company.state && `${link.company.state} • `}
                          {link.company.ein || "No EIN"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedAccountant && (
        <LinkManagementModal
          accountantId={selectedAccountant.id}
          accountantName={selectedAccountant.name || selectedAccountant.email}
          linkedCompanies={selectedAccountant.accountantClients.map((ac) => ac.company)}
          onClose={() => setSelectedAccountant(null)}
          onUpdate={() => {
            fetchAccountants()
            setSelectedAccountant(null)
          }}
        />
      )}
    </div>
  )
}
