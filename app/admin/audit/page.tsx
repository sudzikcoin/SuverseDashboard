"use client"

import { useState, useEffect } from "react"
import RequireRole from "@/components/auth/RequireRole"

interface AuditLog {
  id: string
  actorId: string | null
  action: string
  entity: string
  entityId: string | null
  createdAt: string
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
    <RequireRole roles={["ADMIN"]}>
      <div className="min-h-screen bg-[#0B1220] p-6">
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
                <table className="w-full">
                  <thead className="bg-white/5 sticky top-0">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Timestamp</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Action</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Entity</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Entity ID</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Actor ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log, idx) => (
                      <tr key={log.id} className={idx % 2 === 0 ? "bg-white/5" : ""}>
                        <td className="px-6 py-4 text-gray-100 text-sm">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            log.action === "CREATE" ? "bg-green-500/20 text-green-400" :
                            log.action === "UPDATE" ? "bg-blue-500/20 text-blue-400" :
                            log.action === "DELETE" ? "bg-red-500/20 text-red-400" :
                            "bg-gray-500/20 text-gray-400"
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-100">{log.entity}</td>
                        <td className="px-6 py-4 text-gray-100 font-mono text-sm">{log.entityId || "-"}</td>
                        <td className="px-6 py-4 text-gray-100 font-mono text-sm">{log.actorId || "System"}</td>
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
    </RequireRole>
  )
}
