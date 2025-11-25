"use client"

import { Bell, CheckCircle2, Clock, XCircle } from "lucide-react"

interface BrokerHeaderProps {
  brokerName?: string
  brokerStatus?: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED"
  initials?: string
}

function getStatusBadge(status: BrokerHeaderProps["brokerStatus"]) {
  switch (status) {
    case "APPROVED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="h-3 w-3" />
          Verified
        </span>
      )
    case "PENDING":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
          <Clock className="h-3 w-3" />
          Pending
        </span>
      )
    case "REJECTED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
          <XCircle className="h-3 w-3" />
          Rejected
        </span>
      )
    case "SUSPENDED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">
          <XCircle className="h-3 w-3" />
          Suspended
        </span>
      )
    default:
      return null
  }
}

export default function BrokerHeader({ 
  brokerName = "SuVerse Capital",
  brokerStatus,
  initials = "SC"
}: BrokerHeaderProps) {
  return (
    <div className="border-b border-white/10 bg-su-card/50 backdrop-blur-sm sticky top-0 z-20">
      <div className="flex items-center justify-between p-4 md:p-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg md:text-xl font-semibold text-su-text">
              {brokerName}
            </h2>
            {brokerStatus && getStatusBadge(brokerStatus)}
          </div>
          <p className="text-xs md:text-sm text-su-muted">Broker Dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:glass rounded-xl transition relative">
            <Bell size={20} className="text-su-text" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-400 rounded-full"></span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-sky-400 flex items-center justify-center">
              <span className="text-sm font-bold text-white">{initials}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
