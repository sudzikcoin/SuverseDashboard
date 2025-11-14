import { redirect } from "next/navigation"
import { safeGetServerSession } from "@/lib/session-safe"
import BrokerSidebar from "./components/BrokerSidebar"
import BrokerHeader from "./components/BrokerHeader"

export default async function BrokerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await safeGetServerSession()

  if (!session) {
    redirect("/login")
  }

  if (session.user.role !== "BROKER") {
    redirect("/dashboard")
  }

  // Additional check: Ensure broker has brokerId linked
  if (!session.user.brokerId) {
    // Broker user exists but not linked to broker record
    // Redirect to setup or support page
    redirect("/dashboard?error=broker_not_configured")
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-su-base">
      <BrokerSidebar />
      <main className="flex-1 pt-16 md:pt-0">
        <BrokerHeader />
        {children}
      </main>
    </div>
  )
}
