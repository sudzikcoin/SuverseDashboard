import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Sidebar from "@/components/Sidebar"
import Card from "@/components/Card"
import Link from "next/link"
import CalculatorCard from "@/components/CalculatorCard"
import FileUpload from "@/components/FileUpload"
import DocumentList from "@/components/DocumentList"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen bg-[#0B1220]">
      <Sidebar role={session.user.role} />
      
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8 text-su-text">
          Welcome, {session.user.email}
        </h1>

        {session.user.role === "COMPANY" && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/marketplace" className="block">
                <div className="glass halo rounded-xl p-6 hover:border-su-emerald/50 transition cursor-pointer">
                  <h2 className="text-xl font-bold mb-2 text-su-text">Marketplace</h2>
                  <p className="text-su-muted">
                    Browse and purchase tax credits
                  </p>
                </div>
              </Link>

              <Link href="/purchases" className="block">
                <div className="glass halo rounded-xl p-6 hover:border-su-emerald/50 transition cursor-pointer">
                  <h2 className="text-xl font-bold mb-2 text-su-text">My Purchases</h2>
                  <p className="text-su-muted">
                    View your purchase orders and status
                  </p>
                </div>
              </Link>

              <div className="glass halo rounded-xl p-6">
                <h2 className="text-xl font-bold mb-2 text-su-text">Quick Links</h2>
                <p className="text-su-muted">
                  Calculator & documents below
                </p>
              </div>
            </div>

            <CalculatorCard />

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-su-text">Your Documents</h2>
              <FileUpload title="Upload Compliance Documents" defaultType="KYC" />
              <DocumentList userId={session.user.id} />
            </div>
          </div>
        )}

        {session.user.role === "ACCOUNTANT" && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/clients" className="block">
                <div className="glass halo rounded-xl p-6 hover:border-su-emerald/50 transition cursor-pointer">
                  <h2 className="text-xl font-bold mb-2 text-su-text">Clients</h2>
                  <p className="text-su-muted">
                    Manage your client companies
                  </p>
                </div>
              </Link>

              <Link href="/clients/purchases" className="block">
                <div className="glass halo rounded-xl p-6 hover:border-su-emerald/50 transition cursor-pointer">
                  <h2 className="text-xl font-bold mb-2 text-su-text">Client Purchases</h2>
                  <p className="text-su-muted">
                    View client purchase orders
                  </p>
                </div>
              </Link>

              <Link href="/marketplace" className="block">
                <div className="glass halo rounded-xl p-6 hover:border-su-emerald/50 transition cursor-pointer">
                  <h2 className="text-xl font-bold mb-2 text-su-text">Marketplace</h2>
                  <p className="text-su-muted">
                    Browse available tax credits
                  </p>
                </div>
              </Link>
            </div>

            <CalculatorCard />
          </div>
        )}

        {session.user.role === "ADMIN" && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/admin/inventory" className="block">
                <div className="glass halo rounded-xl p-6 hover:border-su-emerald/50 transition cursor-pointer">
                  <h2 className="text-xl font-bold mb-2 text-su-text">Inventory</h2>
                  <p className="text-su-muted">
                    Manage tax credit inventory
                  </p>
                </div>
              </Link>

              <Link href="/admin/purchases" className="block">
                <div className="glass halo rounded-xl p-6 hover:border-su-emerald/50 transition cursor-pointer">
                  <h2 className="text-xl font-bold mb-2 text-su-text">Purchase Orders</h2>
                  <p className="text-su-muted">
                    Review and approve purchases
                  </p>
                </div>
              </Link>

              <Link href="/admin/audit" className="block">
                <div className="glass halo rounded-xl p-6 hover:border-su-emerald/50 transition cursor-pointer">
                  <h2 className="text-xl font-bold mb-2 text-su-text">Audit Log</h2>
                  <p className="text-su-muted">
                    View system activity history
                  </p>
                </div>
              </Link>
            </div>

            <CalculatorCard />
          </div>
        )}
      </main>
    </div>
  )
}
