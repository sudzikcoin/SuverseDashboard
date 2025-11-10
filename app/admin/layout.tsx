import DashboardShell from "@/components/DashboardShell"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardShell requireRole="ADMIN">{children}</DashboardShell>
}
