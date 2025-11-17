import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import CalculatorCard from "@/components/CalculatorCard"
import FileUpload from "@/components/FileUpload"
import DocumentList from "@/components/DocumentList"
import WalletConnectButton from "@/components/wallet/WalletConnectButton"
import CompanyWalletButton from "@/components/wallet/CompanyWalletButton"
import VerificationBadge from "@/components/VerificationBadge"
import { prisma } from "@/lib/db"
import { AlertCircle } from "lucide-react"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const userCompanyId = session.user.companyId

  let companyData = null
  if (session.user.role === "COMPANY" && userCompanyId) {
    companyData = await prisma.company.findUnique({
      where: { id: userCompanyId },
      select: {
        verificationStatus: true,
        verificationNote: true,
        legalName: true,
        walletAddress: true,
      },
    })
  }

  return (
    <div className="p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-100">
              Welcome, {session.user.companyName || session.user.name || "Guest"}
            </h1>
            {companyData && (
              <VerificationBadge 
                status={companyData.verificationStatus as any}
                note={companyData.verificationNote}
              />
            )}
          </div>
          {session.user.role === "COMPANY" && companyData ? (
            <CompanyWalletButton 
              companyName={companyData.legalName}
              companyWalletAddress={companyData.walletAddress}
              className="w-fit"
            />
          ) : (
            <WalletConnectButton className="rounded-full px-4 py-2 border border-emerald-400/40 hover:border-emerald-400/70 bg-transparent backdrop-blur-sm transition w-fit" />
          )}
        </div>

        {companyData && companyData.verificationStatus !== "VERIFIED" && (
          <div className="mb-6 glass border-yellow-500/30 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-yellow-400 mb-1">
                  {companyData.verificationStatus === "UNVERIFIED" 
                    ? "Company Verification Pending" 
                    : "Company Verification Required"}
                </h3>
                <p className="text-sm text-gray-300">
                  {companyData.verificationStatus === "UNVERIFIED"
                    ? "Your company is currently under review. You can browse the marketplace, but payment functions are restricted until verification is complete."
                    : "Your company verification was not approved. Please contact support for assistance."}
                </p>
              </div>
            </div>
          </div>
        )}

        {session.user.role === "COMPANY" && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/marketplace" className="block">
                <div className="glass halo rounded-2xl p-6 hover:border-su-emerald/50 transition cursor-pointer">
                  <h2 className="text-xl font-bold mb-2 text-gray-100">Marketplace</h2>
                  <p className="text-gray-200">
                    Browse and purchase tax credits
                  </p>
                </div>
              </Link>

              <Link href="/purchases" className="block">
                <div className="glass halo rounded-2xl p-6 hover:border-su-emerald/50 transition cursor-pointer">
                  <h2 className="text-xl font-bold mb-2 text-gray-100">My Purchases</h2>
                  <p className="text-gray-200">
                    View your purchase orders and status
                  </p>
                </div>
              </Link>

              <Link href="/payments/usdc" className="block">
                <div className="glass halo rounded-2xl p-6 hover:border-su-emerald/50 transition cursor-pointer hover:shadow-[0_0_40px_-12px_rgba(16,185,129,0.25)]">
                  <h2 className="text-xl font-bold mb-2 text-gray-100">Pay with USDC</h2>
                  <p className="text-gray-200">
                    Make payments using USDC on Base
                  </p>
                </div>
              </Link>
            </div>

            <CalculatorCard />

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-100">Your Documents</h2>
              <FileUpload title="Upload Compliance Documents" />
            </div>
          </div>
        )}

        {session.user.role === "ACCOUNTANT" && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/clients" className="block">
                <div className="glass halo rounded-2xl p-6 hover:border-su-emerald/50 transition cursor-pointer">
                  <h2 className="text-xl font-bold mb-2 text-gray-100">Clients</h2>
                  <p className="text-gray-200">
                    Manage your client companies
                  </p>
                </div>
              </Link>

              <Link href="/clients/purchases" className="block">
                <div className="glass halo rounded-2xl p-6 hover:border-su-emerald/50 transition cursor-pointer">
                  <h2 className="text-xl font-bold mb-2 text-gray-100">Client Purchases</h2>
                  <p className="text-gray-200">
                    View client purchase orders
                  </p>
                </div>
              </Link>

              <Link href="/marketplace" className="block">
                <div className="glass halo rounded-2xl p-6 hover:border-su-emerald/50 transition cursor-pointer">
                  <h2 className="text-xl font-bold mb-2 text-gray-100">Marketplace</h2>
                  <p className="text-gray-200">
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
                <div className="glass halo rounded-2xl p-6 hover:border-su-emerald/50 transition cursor-pointer">
                  <h2 className="text-xl font-bold mb-2 text-gray-100">Inventory</h2>
                  <p className="text-gray-200">
                    Manage tax credit inventory
                  </p>
                </div>
              </Link>

              <Link href="/admin/purchases" className="block">
                <div className="glass halo rounded-2xl p-6 hover:border-su-emerald/50 transition cursor-pointer">
                  <h2 className="text-xl font-bold mb-2 text-gray-100">Purchase Orders</h2>
                  <p className="text-gray-200">
                    Review and approve purchases
                  </p>
                </div>
              </Link>

              <Link href="/admin/audit" className="block">
                <div className="glass halo rounded-2xl p-6 hover:border-su-emerald/50 transition cursor-pointer">
                  <h2 className="text-xl font-bold mb-2 text-gray-100">Audit Log</h2>
                  <p className="text-gray-200">
                    View system activity history
                  </p>
                </div>
              </Link>
            </div>

            <CalculatorCard />
          </div>
        )}
    </div>
  )
}
