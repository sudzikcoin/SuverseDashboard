import AuditDashboard from "@/components/admin/AuditDashboard"

export default function AuditLogPage() {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100">Audit Dashboard</h1>
          <p className="text-gray-400 mt-1">System activity tracking, monitoring, and analytics</p>
        </div>

        <AuditDashboard />
      </div>
    </div>
  )
}
