"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  FileText, 
  Plug, 
  Settings, 
  HelpCircle 
} from "lucide-react"
import SignOutButton from "@/components/auth/SignOutButton"

const brokerLinks = [
  { href: "/broker/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/broker/inventory", label: "Inventory", icon: Package },
  { href: "/broker/orders", label: "Orders", icon: ShoppingCart },
  { href: "/broker/payouts", label: "Payouts", icon: DollarSign },
  { href: "/broker/compliance", label: "Documents & Compliance", icon: FileText },
  { href: "/broker/integrations", label: "API & Integrations", icon: Plug },
  { href: "/broker/settings", label: "Settings", icon: Settings },
  { href: "/broker/support", label: "Support", icon: HelpCircle },
]

export default function BrokerSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

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
          <p className="text-sm text-su-muted">Broker Portal</p>
        </div>

        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          {brokerLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition ${
                  isActive
                    ? "glass text-su-emerald font-medium"
                    : "text-su-text/80 hover:glass hover:text-white"
                }`}
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </Link>
            )
          })}
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
