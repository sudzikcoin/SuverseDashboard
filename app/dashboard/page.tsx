import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Sidebar from "@/components/Sidebar"
import Card from "@/components/Card"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen bg-[#0B1220]">
      <Sidebar role={session.user.role} />
      
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-100">
          Welcome, {session.user.email}
        </h1>

        {session.user.role === "COMPANY" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/marketplace" className="block">
              <div className="bg-[#0F172A] border border-white/5 rounded-xl p-6 hover:border-brand/50 transition cursor-pointer">
                <h2 className="text-xl font-bold mb-2 text-gray-100">Marketplace</h2>
                <p className="text-gray-400">
                  Browse and purchase tax credits
                </p>
              </div>
            </Link>

            <Link href="/purchases" className="block">
              <div className="bg-[#0F172A] border border-white/5 rounded-xl p-6 hover:border-brand/50 transition cursor-pointer">
                <h2 className="text-xl font-bold mb-2 text-gray-100">My Purchases</h2>
                <p className="text-gray-400">
                  View your purchase orders and status
                </p>
              </div>
            </Link>

            <div className="bg-[#0F172A] border border-white/5 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-2 text-gray-100">Documents</h2>
              <p className="text-gray-400">
                Upload compliance documents
              </p>
            </div>
          </div>
        )}

        {session.user.role === "ACCOUNTANT" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/clients" className="block">
              <div className="bg-[#0F172A] border border-white/5 rounded-xl p-6 hover:border-brand/50 transition cursor-pointer">
                <h2 className="text-xl font-bold mb-2 text-gray-100">Clients</h2>
                <p className="text-gray-400">
                  Manage your client companies
                </p>
              </div>
            </Link>

            <Link href="/clients/purchases" className="block">
              <div className="bg-[#0F172A] border border-white/5 rounded-xl p-6 hover:border-brand/50 transition cursor-pointer">
                <h2 className="text-xl font-bold mb-2 text-gray-100">Client Purchases</h2>
                <p className="text-gray-400">
                  View client purchase orders
                </p>
              </div>
            </Link>

            <Link href="/marketplace" className="block">
              <div className="bg-[#0F172A] border border-white/5 rounded-xl p-6 hover:border-brand/50 transition cursor-pointer">
                <h2 className="text-xl font-bold mb-2 text-gray-100">Marketplace</h2>
                <p className="text-gray-400">
                  Browse available tax credits
                </p>
              </div>
            </Link>
          </div>
        )}

        {session.user.role === "ADMIN" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/admin/inventory" className="block">
              <div className="bg-[#0F172A] border border-white/5 rounded-xl p-6 hover:border-brand/50 transition cursor-pointer">
                <h2 className="text-xl font-bold mb-2 text-gray-100">Inventory</h2>
                <p className="text-gray-400">
                  Manage tax credit inventory
                </p>
              </div>
            </Link>

            <Link href="/admin/purchases" className="block">
              <div className="bg-[#0F172A] border border-white/5 rounded-xl p-6 hover:border-brand/50 transition cursor-pointer">
                <h2 className="text-xl font-bold mb-2 text-gray-100">Purchase Orders</h2>
                <p className="text-gray-400">
                  Review and approve purchases
                </p>
              </div>
            </Link>

            <Link href="/admin/audit" className="block">
              <div className="bg-[#0F172A] border border-white/5 rounded-xl p-6 hover:border-brand/50 transition cursor-pointer">
                <h2 className="text-xl font-bold mb-2 text-gray-100">Audit Log</h2>
                <p className="text-gray-400">
                  View system activity history
                </p>
              </div>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
