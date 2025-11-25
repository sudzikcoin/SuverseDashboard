"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, XCircle, Clock, AlertCircle, Building2, Mail, MapPin, Calendar } from "lucide-react"

interface BrokerUser {
  id: string
  email: string
  name: string | null
  status: string
  emailVerifiedAt: string | null
}

interface Broker {
  id: string
  name: string
  companyName: string
  contactName: string
  email: string | null
  phone: string | null
  state: string | null
  status: "PENDING" | "APPROVED" | "SUSPENDED"
  createdAt: string
  users: BrokerUser[]
  _count: {
    creditPools: number
  }
}

function getStatusBadge(status: Broker["status"]) {
  switch (status) {
    case "APPROVED":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Verified
        </span>
      )
    case "PENDING":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
          <Clock className="h-3.5 w-3.5" />
          Pending
        </span>
      )
    case "SUSPENDED":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
          <XCircle className="h-3.5 w-3.5" />
          Rejected
        </span>
      )
    default:
      return null
  }
}

export default function AdminBrokersPage() {
  const [brokers, setBrokers] = useState<Broker[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [verifyingBrokerId, setVerifyingBrokerId] = useState<string | null>(null)

  useEffect(() => {
    fetchBrokers()
  }, [])

  const fetchBrokers = async () => {
    try {
      const res = await fetch("/api/admin/brokers")
      if (res.ok) {
        const data = await res.json()
        setBrokers(data.brokers)
      }
    } catch (error) {
      console.error("Failed to fetch brokers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (brokerId: string, action: "VERIFY" | "REJECT", e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const note = action === "REJECT" ? prompt("Please provide a reason for rejection (optional):") : null
    if (action === "REJECT" && note === null) return

    setVerifyingBrokerId(brokerId)
    try {
      const res = await fetch(`/api/admin/brokers/${brokerId}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note }),
      })

      if (res.ok) {
        await fetchBrokers()
      } else {
        const data = await res.json()
        alert(data.error || "Failed to update verification status")
      }
    } catch (error) {
      console.error("Failed to verify broker:", error)
      alert("Failed to update verification status")
    } finally {
      setVerifyingBrokerId(null)
    }
  }

  const filteredBrokers = brokers.filter(
    (broker) =>
      broker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      broker.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      broker.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      broker.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      broker.state?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const pendingBrokers = filteredBrokers.filter(b => b.status === "PENDING")
  const approvedBrokers = filteredBrokers.filter(b => b.status === "APPROVED")
  const suspendedBrokers = filteredBrokers.filter(b => b.status === "SUSPENDED")

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white">Brokers</h1>
        <p className="text-su-muted mt-2">
          Manage broker verification and view broker details
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-su-card border border-white/10 rounded-xl p-4">
          <p className="text-2xl font-bold text-white">{brokers.length}</p>
          <p className="text-xs text-su-muted">Total Brokers</p>
        </div>
        <div className="bg-su-card border border-yellow-500/20 rounded-xl p-4">
          <p className="text-2xl font-bold text-yellow-400">{pendingBrokers.length}</p>
          <p className="text-xs text-su-muted">Pending Verification</p>
        </div>
        <div className="bg-su-card border border-emerald-500/20 rounded-xl p-4">
          <p className="text-2xl font-bold text-emerald-400">{approvedBrokers.length}</p>
          <p className="text-xs text-su-muted">Verified</p>
        </div>
        <div className="bg-su-card border border-red-500/20 rounded-xl p-4">
          <p className="text-2xl font-bold text-red-400">{suspendedBrokers.length}</p>
          <p className="text-xs text-su-muted">Rejected</p>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search brokers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 bg-su-card border border-white/10 rounded-xl text-white placeholder-su-muted focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-su-muted">Loading...</div>
      ) : filteredBrokers.length === 0 ? (
        <div className="bg-su-card border border-white/10 rounded-2xl p-12 text-center">
          <AlertCircle className="h-12 w-12 text-su-muted mx-auto mb-4" />
          <p className="text-su-muted text-lg">No brokers found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBrokers.map((broker) => (
            <div
              key={broker.id}
              className="bg-su-card border border-white/10 rounded-2xl p-6 hover:border-emerald-500/30 transition"
            >
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-white">
                    {broker.companyName}
                  </h3>
                  {getStatusBadge(broker.status)}
                </div>

                <div className="flex items-center gap-3 mb-3">
                  {broker.status !== "APPROVED" && (
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => handleVerify(broker.id, "VERIFY", e)}
                        disabled={verifyingBrokerId === broker.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 rounded-lg text-xs font-medium transition disabled:opacity-50"
                        title="Verify broker"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Approve
                      </button>
                      {broker.status !== "SUSPENDED" && (
                        <button
                          onClick={(e) => handleVerify(broker.id, "REJECT", e)}
                          disabled={verifyingBrokerId === broker.id}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 rounded-lg text-xs font-medium transition disabled:opacity-50"
                          title="Reject broker"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Reject
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-su-muted">
                    <Building2 className="h-4 w-4" />
                    <span>{broker.name}</span>
                    <span className="text-white/30">•</span>
                    <span>{broker.contactName}</span>
                  </div>
                  {broker.email && (
                    <div className="flex items-center gap-2 text-sm text-su-muted">
                      <Mail className="h-4 w-4" />
                      <span>{broker.email}</span>
                    </div>
                  )}
                  {broker.state && (
                    <div className="flex items-center gap-2 text-sm text-su-muted">
                      <MapPin className="h-4 w-4" />
                      <span>{broker.state}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-su-muted">
                    <Calendar className="h-4 w-4" />
                    <span>Registered {new Date(broker.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-white/10">
                <div>
                  <p className="text-2xl font-bold text-emerald-400">
                    {broker._count.creditPools}
                  </p>
                  <p className="text-xs text-su-muted">Credit Pools</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-sky-400">
                    {broker.users.length}
                  </p>
                  <p className="text-xs text-su-muted">Users</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-su-muted mb-2">Broker Admin</p>
                {broker.users.length === 0 ? (
                  <p className="text-sm text-su-muted italic">No users linked</p>
                ) : (
                  <div className="space-y-2">
                    {broker.users.map((user) => (
                      <div
                        key={user.id}
                        className="bg-white/5 rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium text-sm">
                              {user.name || user.email}
                            </p>
                            {user.name && (
                              <p className="text-xs text-su-muted">
                                {user.email}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {user.emailVerifiedAt ? (
                              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 rounded-full">
                                Email Verified
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 text-[10px] font-semibold bg-yellow-500/20 text-yellow-400 rounded-full">
                                Email Pending
                              </span>
                            )}
                          </div>
                        </div>
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
