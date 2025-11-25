"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import SignOutButton from "@/components/auth/SignOutButton"

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
    { href: "/admin/brokers", label: "Brokers" },
    { href: "/admin/companies", label: "Companies" },
    { href: "/admin/inventory", label: "Inventory" },
    { href: "/admin/purchases", label: "Purchase Orders" },
    { href: "/admin/audit", label: "Audit Log" },
  ]

  const brokerLinks = [
    { href: "/broker/dashboard", label: "Dashboard" },
    { href: "/broker/inventory", label: "Inventory" },
    { href: "/broker/orders", label: "Orders" },
    { href: "/broker/payouts", label: "Payouts" },
    { href: "/broker/compliance", label: "Compliance" },
    { href: "/broker/integrations", label: "Integrations" },
    { href: "/broker/settings", label: "Settings" },
    { href: "/broker/support", label: "Support" },
  ]

  const links =
    role === "ADMIN"
      ? adminLinks
      : role === "ACCOUNTANT"
      ? accountantLinks
      : role === "BROKER"
      ? brokerLinks
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
      <div className="flex items-center justify-between md:hidden p-4 border-b border-white/10 bg-[#0E1526] fixed top-0 left-0 right-0 z-30">
        <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-300 to-sky-300 bg-clip-text text-transparent">
          SuVerse
        </h1>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 focus:outline-none text-su-text hover:text-su-emerald transition"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          fixed md:static top-0 left-0 h-screen w-64 
          bg-[#0E1526] border-r border-white/10 
          flex flex-col z-50
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
          <SignOutButton className="w-full px-4 py-2 glass hover:bg-red-500/20 text-red-400 rounded-xl transition">
            Sign Out
          </SignOutButton>
        </div>
      </aside>
    </>
  )
}
