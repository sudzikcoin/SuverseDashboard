import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Sidebar from "@/components/Sidebar"
import { WalletConnectBar } from "@/components/wallet/WalletConnectBar"
import dynamic from "next/dynamic"
import WalletConnectButton from "@/components/wallet/WalletConnectButton"

const USDCPay = dynamic(() => import("@/components/wallet/USDCPay"), { ssr: false })

export default async function USDCPaymentPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen bg-[#0B1220]">
      <Sidebar role={session.user.role} />
      
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-100">
            Pay with USDC
          </h1>
          <WalletConnectButton className="rounded-full px-4 py-2 border border-emerald-400/40 hover:border-emerald-400/70 bg-transparent backdrop-blur-sm transition" />
        </div>

        <div className="space-y-6 max-w-4xl">
          <WalletConnectBar />
          <USDCPay defaultAmount={1000} />
          
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-100 mb-3">How it works</h2>
            <div className="space-y-2 text-gray-200">
              <p>1. Connect your Web3 wallet using the button above</p>
              <p>2. Ensure you have sufficient USDC balance on Base network</p>
              <p>3. Enter the payment amount and click "Open in wallet"</p>
              <p>4. Confirm the transaction in your wallet</p>
              <p>5. Our team will verify the on-chain transaction and process your order</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
