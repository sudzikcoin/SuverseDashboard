import { redirect } from "next/navigation"
import { safeGetServerSession } from "@/lib/session-safe"
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
  // Use safe session helper to prevent "aes/gcm: invalid ghash tag" crashes
  // If decryption fails (old cookie), treat as logged out
  const session = await safeGetServerSession()

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
