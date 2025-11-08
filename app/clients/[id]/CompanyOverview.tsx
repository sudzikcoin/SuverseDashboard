"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface CompanyOverviewProps {
  company: any
}

export default function CompanyOverview({ company }: CompanyOverviewProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    legalName: company.legalName || "",
    state: company.state || "",
    ein: company.ein || "",
    contactEmail: company.contactEmail || "",
  })

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/companies/${company.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setIsEditing(false)
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || "Failed to save changes")
      }
    } catch (error) {
      console.error("Error saving company:", error)
      alert("Failed to save changes")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      legalName: company.legalName || "",
      state: company.state || "",
      ein: company.ein || "",
      contactEmail: company.contactEmail || "",
    })
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-100">Company Information</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold px-4 py-2 rounded-lg transition"
          >
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="bg-white/5 hover:bg-white/10 text-gray-100 px-4 py-2 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Company Legal Name
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.legalName}
              onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 focus:bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:outline-none text-gray-100"
            />
          ) : (
            <p className="text-gray-100 px-4 py-2 bg-white/5 rounded-xl">{company.legalName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            State (2 letters)
          </label>
          {isEditing ? (
            <input
              type="text"
              maxLength={2}
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
              className="w-full px-4 py-2 bg-white/5 focus:bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:outline-none text-gray-100"
              placeholder="CA, NY, TX..."
            />
          ) : (
            <p className="text-gray-100 px-4 py-2 bg-white/5 rounded-xl">{company.state || "-"}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            EIN
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.ein}
              onChange={(e) => setFormData({ ...formData, ein: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 focus:bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:outline-none text-gray-100 font-mono"
              placeholder="12-3456789"
            />
          ) : (
            <p className="text-gray-100 px-4 py-2 bg-white/5 rounded-xl font-mono">{company.ein || "-"}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Contact Email
          </label>
          {isEditing ? (
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 focus:bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:outline-none text-gray-100"
            />
          ) : (
            <p className="text-gray-100 px-4 py-2 bg-white/5 rounded-xl">{company.contactEmail}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Created At
          </label>
          <p className="text-gray-100 px-4 py-2 bg-white/5 rounded-xl">
            {new Date(company.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Last Updated
          </label>
          <p className="text-gray-100 px-4 py-2 bg-white/5 rounded-xl">
            {new Date(company.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
}
