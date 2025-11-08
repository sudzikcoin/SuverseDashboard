"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import CompanyOverview from "./CompanyOverview"
import DocumentsPanel from "./DocumentsPanel"
import PurchasesPanel from "./PurchasesPanel"
import SettingsPanel from "./SettingsPanel"

type Tab = "overview" | "documents" | "purchases" | "settings"

interface CompanyDetailsClientProps {
  company: any
  userRole: string
}

export default function CompanyDetailsClient({ company, userRole }: CompanyDetailsClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview")
  const router = useRouter()

  const tabs = [
    { id: "overview" as Tab, label: "Overview" },
    { id: "documents" as Tab, label: "Documents" },
    { id: "purchases" as Tab, label: "Purchases" },
    { id: "settings" as Tab, label: "Settings" },
  ]

  return (
    <div className="min-h-screen bg-[#0B1220] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.push("/clients")}
            className="text-gray-400 hover:text-gray-100 transition mb-4 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Clients
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-100">{company.legalName}</h1>
              {company.deletedAt && (
                <span className="inline-block mt-2 px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm font-semibold">
                  Archived
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-[#0F172A] border border-white/5 rounded-xl overflow-hidden">
          <div className="border-b border-white/5">
            <nav className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 font-semibold transition relative ${
                    activeTab === tab.id
                      ? "text-emerald-400 bg-white/5"
                      : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "overview" && <CompanyOverview company={company} />}
            {activeTab === "documents" && <DocumentsPanel company={company} />}
            {activeTab === "purchases" && <PurchasesPanel company={company} />}
            {activeTab === "settings" && <SettingsPanel company={company} />}
          </div>
        </div>
      </div>
    </div>
  )
}
