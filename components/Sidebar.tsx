"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { Menu, X } from "lucide-react"

interface SidebarProps {
  role: string
}

export default function Sidebar({ role }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
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
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/accountants", label: "Accountants" },
    { href: "/admin/companies", label: "Companies" },
    { href: "/admin/inventory", label: "Inventory" },
    { href: "/admin/purchases", label: "Purchase Orders" },
    { href: "/admin/audit", label: "Audit Log" },
  ]

  const links =
    role === "ADMIN"
      ? adminLinks
      : role === "ACCOUNTANT"
      ? accountantLinks
      : companyLinks

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#0E1526] border border-white/10 text-su-text hover:text-su-emerald transition"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          fixed md:static top-0 left-0 h-screen w-64 
          bg-[#0E1526] border-r border-white/10 
          flex flex-col z-40
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-300 to-sky-300 bg-clip-text text-transparent">
            SuVerse
          </h1>
          <p className="text-sm text-su-muted">Tax Credit Dashboard</p>
        </div>

        <nav className="flex-1 px-4 py-4 overflow-y-auto">
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
      </aside>
    </>
  )
}
