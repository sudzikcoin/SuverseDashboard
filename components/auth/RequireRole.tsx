"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface RequireRoleProps {
  children: React.ReactNode
  roles: string[]
}

export default function RequireRole({ children, roles }: RequireRoleProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/login")
      return
    }

    if (!roles.includes(session.user.role)) {
      router.push("/dashboard")
    }
  }, [session, status, roles, router])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!session || !roles.includes(session.user.role)) {
    return null
  }

  return <>{children}</>
}
