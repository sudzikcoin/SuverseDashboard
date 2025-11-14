"use client"

import { Bell } from "lucide-react"

export default function BrokerHeader() {
  return (
    <div className="border-b border-white/10 bg-su-card/50 backdrop-blur-sm sticky top-0 z-20">
      <div className="flex items-center justify-between p-4 md:p-6">
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-su-text">
            SuVerse Capital
          </h2>
          <p className="text-xs md:text-sm text-su-muted">Broker Dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:glass rounded-xl transition relative">
            <Bell size={20} className="text-su-text" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-400 rounded-full"></span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-sky-400 flex items-center justify-center">
              <span className="text-sm font-bold text-white">SC</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
