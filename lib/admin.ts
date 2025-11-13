import { safeGetServerSession } from "@/lib/session-safe"

export async function requireAdminSession() {
  // Use safe session helper to prevent "aes/gcm: invalid ghash tag" crashes
  // If decryption fails (old cookie), treat as logged out
  const session = await safeGetServerSession()
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized")
  }
  return session
}
