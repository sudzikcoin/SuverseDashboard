"use client"

import { useState } from "react"
import { Upload } from "lucide-react"

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState<"profile" | "verification" | "documents">("profile")

  const brokerProfile = {
    legalName: "SuVerse Capital LLC",
    ein: "98-7654321",
    entityType: "LLC",
    address: {
      street: "123 Finance Street",
      city: "New York",
      state: "NY",
      zip: "10001",
    },
    contact: {
      name: "John Broker",
      title: "Managing Partner",
      email: "john@suversecapital.com",
      phone: "(555) 123-4567",
    },
  }

  const verificationStatus = {
    status: "APPROVED",
    approvedDate: "Dec 15, 2024",
    reviewedBy: "SuVerse Compliance Team",
    notes: "All documents verified. Broker approved for trading.",
  }

  const creditPools = [
    { id: "POOL-001", program: "C48E 2025", documentsCount: 3 },
    { id: "POOL-002", program: "ITC Solar", documentsCount: 2 },
    { id: "POOL-003", program: "PTC Wind", documentsCount: 4 },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-emerald-500/20 text-emerald-400"
      case "UNDER_REVIEW":
        return "bg-yellow-500/20 text-yellow-400"
      case "PENDING":
        return "bg-gray-500/20 text-gray-400"
      case "REJECTED":
        return "bg-red-500/20 text-red-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-su-text mb-2">
          Documents & Compliance
        </h1>
        <p className="text-su-muted">Manage broker profile and program documentation</p>
      </div>

      <div className="glass rounded-2xl overflow-hidden mb-6">
        <div className="border-b border-white/10">
          <nav className="flex">
            {[
              { id: "profile" as const, label: "Broker Profile & KYB" },
              { id: "verification" as const, label: "Verification Status" },
              { id: "documents" as const, label: "Program Documents" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-semibold transition relative ${
                  activeTab === tab.id
                    ? "text-su-emerald bg-white/5"
                    : "text-su-muted hover:text-su-text hover:bg-white/5"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-su-emerald" />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-su-text mb-4">Legal Entity Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-su-muted mb-2">Legal Entity Name</label>
                    <input
                      type="text"
                      value={brokerProfile.legalName}
                      readOnly
                      className="w-full px-4 py-2 bg-su-base/50 border border-white/10 rounded-xl text-su-text cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-su-muted mb-2">EIN / Tax ID</label>
                    <input
                      type="text"
                      value={brokerProfile.ein}
                      readOnly
                      className="w-full px-4 py-2 bg-su-base/50 border border-white/10 rounded-xl text-su-text cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-su-muted mb-2">Entity Type</label>
                    <input
                      type="text"
                      value={brokerProfile.entityType}
                      readOnly
                      className="w-full px-4 py-2 bg-su-base/50 border border-white/10 rounded-xl text-su-text cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-su-text mb-4">Registered Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-su-muted mb-2">Street Address</label>
                    <input
                      type="text"
                      value={brokerProfile.address.street}
                      readOnly
                      className="w-full px-4 py-2 bg-su-base/50 border border-white/10 rounded-xl text-su-text cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-su-muted mb-2">City</label>
                    <input
                      type="text"
                      value={brokerProfile.address.city}
                      readOnly
                      className="w-full px-4 py-2 bg-su-base/50 border border-white/10 rounded-xl text-su-text cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-su-muted mb-2">State</label>
                    <input
                      type="text"
                      value={brokerProfile.address.state}
                      readOnly
                      className="w-full px-4 py-2 bg-su-base/50 border border-white/10 rounded-xl text-su-text cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-su-muted mb-2">ZIP Code</label>
                    <input
                      type="text"
                      value={brokerProfile.address.zip}
                      readOnly
                      className="w-full px-4 py-2 bg-su-base/50 border border-white/10 rounded-xl text-su-text cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-su-text mb-4">Contact Person</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-su-muted mb-2">Name</label>
                    <input
                      type="text"
                      value={brokerProfile.contact.name}
                      readOnly
                      className="w-full px-4 py-2 bg-su-base/50 border border-white/10 rounded-xl text-su-text cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-su-muted mb-2">Title</label>
                    <input
                      type="text"
                      value={brokerProfile.contact.title}
                      readOnly
                      className="w-full px-4 py-2 bg-su-base/50 border border-white/10 rounded-xl text-su-text cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-su-muted mb-2">Email</label>
                    <input
                      type="email"
                      value={brokerProfile.contact.email}
                      readOnly
                      className="w-full px-4 py-2 bg-su-base/50 border border-white/10 rounded-xl text-su-text cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-su-muted mb-2">Phone</label>
                    <input
                      type="tel"
                      value={brokerProfile.contact.phone}
                      readOnly
                      className="w-full px-4 py-2 bg-su-base/50 border border-white/10 rounded-xl text-su-text cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "verification" && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-su-text mb-2">Verification Status</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${getStatusColor(verificationStatus.status)}`}>
                      {verificationStatus.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-su-muted">Approved Date</p>
                      <p className="text-su-text font-medium">{verificationStatus.approvedDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-su-muted">Reviewed By</p>
                      <p className="text-su-text font-medium">{verificationStatus.reviewedBy}</p>
                    </div>
                    <div>
                      <p className="text-sm text-su-muted">Notes</p>
                      <p className="text-su-text">{verificationStatus.notes}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div>
              <h3 className="text-lg font-semibold text-su-text mb-4">Credit Pool Documentation</h3>
              <div className="space-y-4">
                {creditPools.map((pool) => (
                  <div key={pool.id} className="glass rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-su-text font-medium">{pool.program}</p>
                        <p className="text-xs text-su-muted">Pool ID: {pool.id}</p>
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 glass hover:bg-white/10 rounded-lg transition text-sm">
                        <Upload size={16} />
                        Upload
                      </button>
                    </div>
                    <p className="text-sm text-su-muted">{pool.documentsCount} documents on file</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
