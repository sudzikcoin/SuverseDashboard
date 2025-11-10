import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function requireAdminSession() {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized")
  }
  return session
}
