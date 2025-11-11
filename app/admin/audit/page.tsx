"use client"

import { useState, useEffect } from "react"

interface AuditLog {
  id: string
  timestamp: string
  actorId: string | null
  actorEmail: string | null
  action: string
  entity: string
  entityId: string | null
  details: any
  companyId: string | null
  ip: string | null
  userAgent: string | null
  txHash: string | null
  amountUSD: string | null
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filterEntity, setFilterEntity] = useState("")
  const [filterAction, setFilterAction] = useState("")

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/audit")
      const data = await res.json()
      setLogs(data.logs || [])
    } catch (error) {
      console.error("Error fetching audit logs:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter((log) => {
    if (filterEntity && !log.entity.toLowerCase().includes(filterEntity.toLowerCase())) {
      return false
    }
    if (filterAction && !log.action.toLowerCase().includes(filterAction.toLowerCase())) {
      return false
    }
    return true
  })

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-100">Audit Log</h1>
            <p className="text-gray-400 mt-1">System activity tracking and monitoring</p>
          </div>

          <div className="bg-[#0F172A] border border-white/5 rounded-xl p-4 mb-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Filter by Entity
                </label>
                <input
                  type="text"
                  value={filterEntity}
                  onChange={(e) => setFilterEntity(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 focus:bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand focus:outline-none text-gray-100 placeholder-gray-400"
                  placeholder="Company, User, PurchaseOrder..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Filter by Action
                </label>
                <input
                  type="text"
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 focus:bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand focus:outline-none text-gray-100 placeholder-gray-400"
                  placeholder="CREATE, UPDATE, DELETE..."
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center text-gray-400 py-12">Loading...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="bg-[#0F172A] border border-white/5 rounded-xl p-12 text-center">
              <p className="text-gray-400 text-lg">No audit logs found</p>
            </div>
          ) : (
            <div className="bg-[#0F172A] border border-white/5 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white/5 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-200">Timestamp</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-200">Actor</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-200">Action</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-200">Entity</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-200">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-200">IP</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-200">TX Hash</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-200">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log, idx) => (
                      <tr key={log.id} className={idx % 2 === 0 ? "bg-white/5" : ""}>
                        <td className="px-4 py-3 text-gray-100 text-xs">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-gray-100 text-xs">{log.actorEmail || "System"}</div>
                          {log.actorEmail && (
                            <div className="text-gray-500 text-xs font-mono mt-0.5">{log.actorId?.slice(0, 8)}...</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            log.action === "CREATE" || log.action === "REGISTER" ? "bg-green-500/20 text-green-400" :
                            log.action === "UPDATE" ? "bg-blue-500/20 text-blue-400" :
                            log.action === "DELETE" || log.action === "ARCHIVE_COMPANY" ? "bg-red-500/20 text-red-400" :
                            log.action.includes("PAYMENT") || log.action === "TRANSACTION_CRYPTO" ? "bg-emerald-500/20 text-emerald-400" :
                            log.action === "LOGIN" ? "bg-purple-500/20 text-purple-400" :
                            log.action === "LOGOUT" ? "bg-gray-500/20 text-gray-400" :
                            "bg-orange-500/20 text-orange-400"
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-gray-100 text-xs">{log.entity}</div>
                          {log.entityId && (
                            <div className="text-gray-500 text-xs font-mono mt-0.5">{log.entityId.slice(0, 8)}...</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-100 text-xs">
                          {log.amountUSD ? `$${Number(log.amountUSD).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "-"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-gray-100 text-xs font-mono">{log.ip || "-"}</div>
                          {log.userAgent && log.userAgent !== "unknown" && (
                            <div className="text-gray-500 text-xs mt-0.5 max-w-[200px] truncate" title={log.userAgent}>
                              {log.userAgent}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {log.txHash ? (
                            <a
                              href={`https://basescan.org/tx/${log.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-400 hover:text-emerald-300 text-xs font-mono underline"
                            >
                              {log.txHash.slice(0, 6)}...{log.txHash.slice(-4)}
                            </a>
                          ) : "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs max-w-xs">
                          {log.details ? (
                            <div className="truncate" title={JSON.stringify(log.details)}>
                              {JSON.stringify(log.details).slice(0, 80)}...
                            </div>
                          ) : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-4 text-sm text-gray-400">
            Showing {filteredLogs.length} of {logs.length} log entries
          </div>
        </div>
      </div>
  )
}
