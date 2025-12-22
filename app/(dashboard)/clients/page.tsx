"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import RequireRole from "@/components/auth/RequireRole"
import DocumentManager from "@/components/docs/DocumentManager"

interface Client {
  id: string
  legalName: string
  state: string | null
  ein: string | null
  contactEmail: string
  totalPurchases: number
  totalValue: number
  createdAt: string
}

export default function ClientsPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [formData, setFormData] = useState({
    legalName: "",
    state: "",
    ein: "",
    contactEmail: "",
  })

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients")
      const data = await res.json()
      setClients(data.clients || [])
    } catch (error) {
      console.error("Error fetching clients:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setShowModal(false)
        setFormData({ legalName: "", state: "", ein: "", contactEmail: "" })
        fetchClients()
      }
    } catch (error) {
      console.error("Error creating client:", error)
    }
  }

  return (
    <RequireRole roles={["ACCOUNTANT", "ADMIN"]}>
      <div className="min-h-screen bg-su-base p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-100">Clients</h1>
              <p className="text-gray-400 mt-1">Manage your client companies</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-brand hover:bg-brand-dark text-black font-semibold px-6 py-3 rounded-xl transition w-full sm:w-auto"
            >
              + Add Client
            </button>
          </div>

          {loading ? (
            <div className="text-center text-gray-400 py-12">Loading...</div>
          ) : clients.length === 0 ? (
            <div className="bg-[#0F172A] border border-white/5 rounded-xl p-12 text-center">
              <p className="text-gray-400 text-lg mb-4">No clients yet</p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-brand hover:bg-brand-dark text-black font-semibold px-6 py-3 rounded-xl transition"
              >
                Add Your First Client
              </button>
            </div>
          ) : (
            <div className="bg-[#0F172A] border border-white/5 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5 sticky top-0">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Company Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">State</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">EIN</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Contact Email</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Purchases</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Total Value</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Docs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client, idx) => (
                      <tr 
                        key={client.id} 
                        onClick={() => router.push(`/clients/${client.id}`)}
                        className={`cursor-pointer transition hover:bg-white/10 ${idx % 2 === 0 ? "bg-white/5" : ""}`}
                      >
                        <td className="px-6 py-4 text-gray-100">{client.legalName}</td>
                        <td className="px-6 py-4 text-gray-100">{client.state || "-"}</td>
                        <td className="px-6 py-4 text-gray-100 font-mono text-sm">{client.ein || "-"}</td>
                        <td className="px-6 py-4 text-gray-100">{client.contactEmail}</td>
                        <td className="px-6 py-4 text-gray-100">{client.totalPurchases}</td>
                        <td className="px-6 py-4 text-gray-100">${client.totalValue.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedClient(client)
                            }}
                            className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold px-4 py-2 rounded-lg transition text-sm"
                          >
                            Documents
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {selectedClient && (
          <DocumentManager
            companyId={selectedClient.id}
            companyName={selectedClient.legalName}
            onClose={() => setSelectedClient(null)}
          />
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-[#0F172A] border border-white/5 rounded-xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-100 mb-4">Add New Client</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Company Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.legalName}
                    onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 focus:bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand focus:outline-none text-gray-100 placeholder-gray-400"
                    placeholder="Acme Corporation Inc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 focus:bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand focus:outline-none text-gray-100 placeholder-gray-400"
                    placeholder="contact@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 focus:bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand focus:outline-none text-gray-100 placeholder-gray-400"
                    placeholder="CA, NY, TX..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    EIN
                  </label>
                  <input
                    type="text"
                    value={formData.ein}
                    onChange={(e) => setFormData({ ...formData, ein: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 focus:bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand focus:outline-none text-gray-100 placeholder-gray-400"
                    placeholder="12-3456789"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-gray-100 px-4 py-2 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-brand hover:bg-brand-dark text-black font-semibold px-4 py-2 rounded-xl transition"
                  >
                    Add Client
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </RequireRole>
  )
}
