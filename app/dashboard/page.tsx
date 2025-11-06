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
    <div className="flex">
      <Sidebar role={session.user.role} />
      
      <main className="flex-1 p-8 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold mb-8">
          Welcome, {session.user.email}
        </h1>

        {session.user.role === "COMPANY" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/marketplace">
              <Card className="hover:shadow-lg transition cursor-pointer">
                <h2 className="text-xl font-bold mb-2">Marketplace</h2>
                <p className="text-gray-600">
                  Browse and purchase tax credits
                </p>
              </Card>
            </Link>

            <Link href="/purchases">
              <Card className="hover:shadow-lg transition cursor-pointer">
                <h2 className="text-xl font-bold mb-2">My Purchases</h2>
                <p className="text-gray-600">
                  View your purchase orders and status
                </p>
              </Card>
            </Link>

            <Card>
              <h2 className="text-xl font-bold mb-2">Documents</h2>
              <p className="text-gray-600">
                Upload compliance documents
              </p>
            </Card>
          </div>
        )}

        {session.user.role === "ACCOUNTANT" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <h2 className="text-xl font-bold mb-2">Clients</h2>
              <p className="text-gray-600">
                Manage your client companies
              </p>
            </Card>

            <Card>
              <h2 className="text-xl font-bold mb-2">Client Purchases</h2>
              <p className="text-gray-600">
                View client purchase orders
              </p>
            </Card>

            <Link href="/marketplace">
              <Card className="hover:shadow-lg transition cursor-pointer">
                <h2 className="text-xl font-bold mb-2">Marketplace</h2>
                <p className="text-gray-600">
                  Browse available tax credits
                </p>
              </Card>
            </Link>
          </div>
        )}

        {session.user.role === "ADMIN" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/admin/inventory">
              <Card className="hover:shadow-lg transition cursor-pointer">
                <h2 className="text-xl font-bold mb-2">Inventory</h2>
                <p className="text-gray-600">
                  Manage tax credit inventory
                </p>
              </Card>
            </Link>

            <Link href="/admin/purchases">
              <Card className="hover:shadow-lg transition cursor-pointer">
                <h2 className="text-xl font-bold mb-2">Purchase Orders</h2>
                <p className="text-gray-600">
                  Review and approve purchases
                </p>
              </Card>
            </Link>

            <Card>
              <h2 className="text-xl font-bold mb-2">Audit Log</h2>
              <p className="text-gray-600">
                View system activity history
              </p>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
