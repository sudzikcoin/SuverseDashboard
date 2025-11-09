"use client"

import { useState, useEffect } from "react"

interface Company {
  id: string
  legalName: string
  ein: string | null
  state: string | null
  contactEmail: string
  createdAt: string
  accountantLinks: Array<{
    accountant: {
      id: string
      email: string
      name: string | null
    }
  }>
  _count: {
    purchases: number
    documents: number
  }
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const res = await fetch("/api/admin/companies")
      if (res.ok) {
        const data = await res.json()
        setCompanies(data.companies)
      }
    } catch (error) {
      console.error("Failed to fetch companies:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCompanies = companies.filter(
    (company) =>
      company.legalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.ein?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white">Companies</h1>
        <p className="text-su-muted mt-2">
          View companies and their linked accountants
        </p>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search companies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 bg-su-card border border-white/10 rounded-xl text-white placeholder-su-muted focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-su-muted">Loading...</div>
      ) : filteredCompanies.length === 0 ? (
        <div className="bg-su-card border border-white/10 rounded-2xl p-12 text-center">
          <p className="text-su-muted text-lg">No companies found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCompanies.map((company) => (
            <div
              key={company.id}
              className="bg-su-card border border-white/10 rounded-2xl p-6 hover:border-emerald-500/30 transition"
            >
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white">
                  {company.legalName}
                </h3>
                <p className="text-sm text-su-muted">{company.contactEmail}</p>
                <div className="flex gap-4 mt-2 text-xs text-su-muted">
                  <span>{company.state || "No state"}</span>
                  <span>•</span>
                  <span>{company.ein || "No EIN"}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-white/10">
                <div>
                  <p className="text-2xl font-bold text-emerald-400">
                    {company._count.purchases}
                  </p>
                  <p className="text-xs text-su-muted">Purchases</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-sky-400">
                    {company._count.documents}
                  </p>
                  <p className="text-xs text-su-muted">Documents</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-400">
                    {company.accountantLinks.length}
                  </p>
                  <p className="text-xs text-su-muted">Accountants</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-su-muted mb-2">Linked Accountants</p>
                {company.accountantLinks.length === 0 ? (
                  <p className="text-sm text-su-muted italic">No accountants linked</p>
                ) : (
                  <div className="space-y-2">
                    {company.accountantLinks.map((link) => (
                      <div
                        key={link.accountant.id}
                        className="bg-white/5 rounded-lg p-3"
                      >
                        <p className="text-white font-medium text-sm">
                          {link.accountant.name || link.accountant.email}
                        </p>
                        {link.accountant.name && (
                          <p className="text-xs text-su-muted">
                            {link.accountant.email}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
