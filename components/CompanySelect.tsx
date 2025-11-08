"use client"

import { useEffect, useState } from "react"

type Company = { id: string; name: string; ein?: string | null }

export default function CompanySelect({
  value, 
  onChange, 
  disabled
}: { 
  value?: string
  onChange: (id: string) => void
  disabled?: boolean
}) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/accountant/companies")
        const data = await res.json()
        setCompanies(data.companies ?? [])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <label className="block w-full">
      <span className="text-sm opacity-80">Company</span>
      <select
        className="mt-1 w-full rounded-md bg-[#0E1526] border border-white/10 px-3 py-2 text-white/90"
        value={value ?? ""}
        onChange={e => onChange(e.target.value)}
        disabled={disabled || loading}
      >
        <option value="" disabled>
          {loading ? "Loading..." : "Select company"}
        </option>
        {companies.map(c => (
          <option key={c.id} value={c.id}>
            {c.name}{c.ein ? ` — EIN ${c.ein}` : ""}
          </option>
        ))}
      </select>
    </label>
  )
}
