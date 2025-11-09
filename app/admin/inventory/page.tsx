import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import InventoryClient from "./InventoryClient"

export default async function AdminInventoryPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== "ADMIN") {
    redirect("/login")
  }

  const inventory = await prisma.creditInventory.findMany({
    orderBy: { createdAt: "desc" },
  })

  return <InventoryClient credits={inventory} />
}
