"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"

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

interface Summary {
  timeWindow: { from: string; to: string }
  totals: {
    events: number
    companies: number
    users: number
    paymentsUSD: number
  }
  topActions: Array<{ action: string; count: number }>
  anomalies: string[]
  notes?: string
}

const COLORS = ['#34D399', '#38BDF8', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export default function AuditDashboard() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [aggregates, setAggregates] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('7d')
  const [selectedActions, setSelectedActions] = useState<string[]>([])
  const [selectedEntities, setSelectedEntities] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchData()
  }, [dateRange, selectedActions, selectedEntities, searchQuery])

  const getDateRange = () => {
    const to = new Date()
    const from = new Date()
    
    switch (dateRange) {
      case '24h':
        from.setDate(from.getDate() - 1)
        break
      case '7d':
        from.setDate(from.getDate() - 7)
        break
      case '30d':
        from.setDate(from.getDate() - 30)
        break
    }
    
    return { from: from.toISOString(), to: to.toISOString() }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const range = getDateRange()
      
      const [queryRes, summaryRes] = await Promise.all([
        fetch('/api/admin/audit/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: range.from,
            to: range.to,
            actions: selectedActions.length > 0 ? selectedActions : undefined,
            entities: selectedEntities.length > 0 ? selectedEntities : undefined,
            q: searchQuery || undefined,
            limit: 500,
          }),
        }),
        fetch(`/api/admin/audit/summary?from=${range.from}&to=${range.to}`),
      ])

      const queryData = await queryRes.json()
      const summaryData = await summaryRes.json()

      setLogs(queryData.items || [])
      setAggregates(queryData.aggregates || {})
      setSummary(summaryData)
    } catch (error) {
      console.error('[AuditDashboard] Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportCSV = () => {
    const headers = ['Timestamp', 'Action', 'Entity', 'Actor Email', 'Amount USD', 'TX Hash', 'IP', 'Entity ID']
    const rows = logs.map(log => [
      log.timestamp,
      log.action,
      log.entity,
      log.actorEmail || '',
      log.amountUSD || '',
      log.txHash || '',
      log.ip || '',
      log.entityId || '',
    ])

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${dateRange}-${Date.now()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const allActions = Array.from(new Set(logs.map(l => l.action)))
  const allEntities = Array.from(new Set(logs.map(l => l.entity)))

  return (
    <div className="space-y-6">
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#0F172A] border border-white/5 rounded-xl p-6">
            <div className="text-gray-400 text-sm">Total Events</div>
            <div className="text-3xl font-bold text-emerald-400 mt-2">{summary.totals.events}</div>
          </div>
          <div className="bg-[#0F172A] border border-white/5 rounded-xl p-6">
            <div className="text-gray-400 text-sm">Payments</div>
            <div className="text-3xl font-bold text-emerald-400 mt-2">${summary.totals.paymentsUSD.toFixed(2)}</div>
          </div>
          <div className="bg-[#0F172A] border border-white/5 rounded-xl p-6">
            <div className="text-gray-400 text-sm">Active Users</div>
            <div className="text-3xl font-bold text-sky-400 mt-2">{summary.totals.users}</div>
          </div>
          <div className="bg-[#0F172A] border border-white/5 rounded-xl p-6">
            <div className="text-gray-400 text-sm">Companies</div>
            <div className="text-3xl font-bold text-sky-400 mt-2">{summary.totals.companies}</div>
          </div>
        </div>
      )}

      {summary && summary.anomalies.length > 0 && (
        <div className="bg-[#0F172A] border border-red-500/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-red-400 mb-3">🚨 Anomalies Detected</h3>
          <ul className="space-y-2">
            {summary.anomalies.map((anomaly, idx) => (
              <li key={idx} className="text-gray-300 text-sm">{anomaly}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {aggregates && aggregates.byDay && (
          <div className="bg-[#0F172A] border border-white/5 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Events by Day</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={aggregates.byDay}>
                <XAxis dataKey="date" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Bar dataKey="count" fill="#34D399" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {aggregates && aggregates.byAction && (
          <div className="bg-[#0F172A] border border-white/5 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Top Actions</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={aggregates.byAction.slice(0, 6)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.action}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {aggregates.byAction.slice(0, 6).map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {aggregates && aggregates.paymentsByDay && (
          <div className="bg-[#0F172A] border border-white/5 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Payment Volume (USD)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={aggregates.paymentsByDay}>
                <XAxis dataKey="date" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Line type="monotone" dataKey="amount" stroke="#38BDF8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="bg-[#0F172A] border border-white/5 rounded-xl p-6">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by email, IP, or entity ID..."
            className="flex-1 min-w-[200px] px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />

          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors"
          >
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/5 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-200">Timestamp</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-200">Action</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-200">Entity</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-200">Actor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-200">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-200">TX Hash</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-200">IP</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">Loading...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">No audit logs found</td>
                </tr>
              ) : (
                logs.map((log, idx) => (
                  <tr key={log.id} className={idx % 2 === 0 ? "bg-white/5" : ""}>
                    <td className="px-4 py-3 text-gray-100 text-xs">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        log.action === "VERIFY_COMPANY" ? "bg-green-500/20 text-green-400" :
                        log.action === "REJECT_COMPANY" ? "bg-red-500/20 text-red-400" :
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
                    <td className="px-4 py-3 text-gray-100 text-xs">{log.entity}</td>
                    <td className="px-4 py-3 text-gray-100 text-xs">{log.actorEmail || "System"}</td>
                    <td className="px-4 py-3 text-gray-100 text-xs">
                      {log.amountUSD ? `$${Number(log.amountUSD).toFixed(2)}` : "-"}
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
                    <td className="px-4 py-3 text-gray-100 text-xs font-mono">{log.ip || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-gray-400">
          Showing {logs.length} log entries
        </div>
      </div>
    </div>
  )
}
