import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import Sidebar from "@/components/Sidebar"

interface DashboardShellProps {
  children: React.ReactNode
  requireRole?: "ADMIN" | "ACCOUNTANT" | "COMPANY"
  requireRoles?: ("ADMIN" | "ACCOUNTANT" | "COMPANY")[]
}

export default async function DashboardShell({
  children,
  requireRole,
  requireRoles,
}: DashboardShellProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  if (requireRole && session.user.role !== requireRole) {
    redirect("/dashboard")
  }

  if (requireRoles && !requireRoles.includes(session.user.role as any)) {
    redirect("/dashboard")
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-su-base">
      <Sidebar role={session.user.role} />
      <main className="flex-1 pt-16 md:pt-0 md:ml-0">
        {children}
      </main>
    </div>
  )
}
