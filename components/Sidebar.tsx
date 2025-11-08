"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"

interface SidebarProps {
  role: string
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()

  const companyLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/marketplace", label: "Marketplace" },
    { href: "/purchases", label: "My Purchases" },
    { href: "/payments/usdc", label: "Pay with USDC" },
  ]

  const accountantLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/clients", label: "Clients" },
    { href: "/marketplace", label: "Marketplace" },
    { href: "/payments/usdc", label: "Pay with USDC" },
  ]

  const adminLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/admin/inventory", label: "Inventory" },
    { href: "/admin/purchases", label: "Purchase Orders" },
    { href: "/admin/audit", label: "Audit Log" },
    { href: "/payments/usdc", label: "Pay with USDC" },
  ]

  const links =
    role === "ADMIN"
      ? adminLinks
      : role === "ACCOUNTANT"
      ? accountantLinks
      : companyLinks

  return (
    <div className="w-64 bg-[#0E1526] border-r border-white/10 min-h-screen flex flex-col">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-300 to-sky-300 bg-clip-text text-transparent">SuVerse</h1>
        <p className="text-sm text-su-muted">Tax Credit Dashboard</p>
      </div>

      <nav className="flex-1 px-4 py-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block px-4 py-3 rounded-xl mb-1 transition ${
              pathname === link.href
                ? "glass text-su-emerald font-medium"
                : "text-su-text/80 hover:glass hover:text-white"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full px-4 py-2 glass hover:bg-red-500/20 text-red-400 rounded-xl transition"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
