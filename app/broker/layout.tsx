import { redirect } from "next/navigation"
import { safeGetServerSession } from "@/lib/session-safe"
import { prisma } from "@/lib/db"
import BrokerSidebar from "./components/BrokerSidebar"
import BrokerHeader from "./components/BrokerHeader"

export const dynamic = "force-dynamic"

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

  if (!session.user.brokerId) {
    redirect("/dashboard?error=broker_not_configured")
  }

  const broker = await prisma.broker.findUnique({
    where: { id: session.user.brokerId },
    select: {
      companyName: true,
      status: true,
    },
  })

  const initials = broker?.companyName
    ? broker.companyName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "BR"

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-su-base">
      <BrokerSidebar />
      <main className="flex-1 pt-16 md:pt-0">
        <BrokerHeader 
          brokerName={broker?.companyName || "Broker"} 
          brokerStatus={broker?.status}
          initials={initials}
        />
        {children}
      </main>
    </div>
  )
}
