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
