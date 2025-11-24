import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function PostLoginPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Server-side role-based redirect
  if (session.user.role === "BROKER") {
    redirect("/broker/dashboard")
  } else if (session.user.role === "ADMIN") {
    redirect("/admin")
  } else if (session.user.role === "ACCOUNTANT") {
    redirect("/clients")
  } else {
    redirect("/dashboard")
  }
}
