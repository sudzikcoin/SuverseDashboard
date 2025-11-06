"use client"

import RequireRole from "@/components/auth/RequireRole"

export default function ClientPurchasesPage() {
  return (
    <RequireRole roles={["ACCOUNTANT", "ADMIN"]}>
      <div className="min-h-screen bg-[#0B1220] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-100">Client Purchases</h1>
            <p className="text-gray-400 mt-1">View all purchases made by your clients</p>
          </div>

          <div className="bg-[#0F172A] border border-white/5 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">🚧</div>
            <p className="text-gray-400 text-lg mb-2">Coming Soon</p>
            <p className="text-gray-500">This feature is under development</p>
          </div>
        </div>
      </div>
    </RequireRole>
  )
}
