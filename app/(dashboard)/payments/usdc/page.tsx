import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Sidebar from "@/components/Sidebar"
import { WalletConnectBar } from "@/components/wallet/WalletConnectBar"
import dynamic from "next/dynamic"
import WalletConnectButton from "@/components/wallet/WalletConnectButton"
import VerificationBadge from "@/components/VerificationBadge"
import { AlertCircle } from "lucide-react"
import { prisma } from "@/lib/db"
import Link from "next/link"

const USDCPay = dynamic(() => import("@/components/wallet/USDCPay"), { ssr: false })

export default async function USDCPaymentPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Check company verification status
  let companyData = null
  if (session.user.role === "COMPANY" && session.user.companyId) {
    companyData = await prisma.company.findUnique({
      where: { id: session.user.companyId },
      select: {
        verificationStatus: true,
        verificationNote: true,
        legalName: true,
      },
    })
  }

  const isVerified = companyData?.verificationStatus === "VERIFIED"

  return (
    <div className="flex min-h-screen bg-[#0B1220]">
      <Sidebar role={session.user.role} />
      
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl font-bold text-gray-100">
              Pay with USDC
            </h1>
            {companyData && (
              <VerificationBadge 
                status={companyData.verificationStatus as any}
                note={companyData.verificationNote}
              />
            )}
          </div>
          <WalletConnectButton className="rounded-full px-4 py-2 border border-emerald-400/40 hover:border-emerald-400/70 bg-transparent backdrop-blur-sm transition" />
        </div>

        {companyData && !isVerified && (
          <div className="mb-6 glass border-red-500/30 rounded-2xl p-6 max-w-4xl">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-400 mb-2">
                  {companyData.verificationStatus === "REJECTED" 
                    ? "Payment Not Available - Verification Required" 
                    : "Payment Restricted - Verification Pending"}
                </h3>
                <p className="text-gray-300 mb-4">
                  {companyData.verificationStatus === "REJECTED"
                    ? "Your company verification was not approved. Payment functions are not available at this time."
                    : "Your company is currently under review. USDC payment functions are restricted until verification is complete."}
                </p>
                {companyData.verificationNote && (
                  <div className="bg-white/5 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-400 italic">
                      <strong>Note:</strong> {companyData.verificationNote}
                    </p>
                  </div>
                )}
                <p className="text-sm text-gray-400">
                  Please contact support for assistance or return to your{" "}
                  <Link href="/dashboard" className="text-emerald-400 hover:text-emerald-300 underline">
                    dashboard
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6 max-w-4xl">
          {(!companyData || isVerified) && (
            <>
              <WalletConnectBar />
              <USDCPay defaultAmount={1000} />
            </>
          )}
          
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-100 mb-3">How it works</h2>
            <div className="space-y-2 text-gray-200">
              <p>1. Enter the USDC amount you want to pay and review the total.</p>
              <p>2. Click "Pay".</p>
              <p>3. Your connected wallet will open with a prepared USDC transaction on the Base network.</p>
              <p>4. Review the details and confirm the transaction in your wallet.</p>
              <p>5. After the transaction is confirmed on-chain, we automatically match the payment to your order and update its status in your dashboard.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
