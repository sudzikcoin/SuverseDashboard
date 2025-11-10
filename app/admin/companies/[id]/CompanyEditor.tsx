"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function CompanyEditor({ initial }: { initial: any }) {
  const router = useRouter()
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState({
    legalName: initial.legalName || "",
    state: initial.state || "",
    ein: initial.ein || "",
    contactEmail: initial.contactEmail || "",
    status: initial.status as "ACTIVE" | "BLOCKED" | "ARCHIVED",
  })
  const [password, setPassword] = React.useState("")
  const [pwdSaving, setPwdSaving] = React.useState(false)
  const [pwdMessage, setPwdMessage] = React.useState<string | null>(null)

  async function save() {
    setSaving(true)
    const res = await fetch(`/api/admin/companies/${initial.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (!res.ok) {
      alert("Save failed")
      return
    }
    router.refresh()
  }

  async function block() {
    const res = await fetch(`/api/admin/companies/${initial.id}/block`, {
      method: "POST",
    })
    if (!res.ok) {
      alert("Block failed")
      return
    }
    setForm((f) => ({ ...f, status: "BLOCKED" }))
    router.refresh()
  }

  async function unblock() {
    const res = await fetch(`/api/admin/companies/${initial.id}/unblock`, {
      method: "POST",
    })
    if (!res.ok) {
      alert("Unblock failed")
      return
    }
    setForm((f) => ({ ...f, status: "ACTIVE" }))
    router.refresh()
  }

  async function archive() {
    if (!confirm("Archive this company? This will block login and hide it from non-admin views. You can restore it later."))
      return
    const res = await fetch(`/api/admin/companies/${initial.id}/archive`, {
      method: "POST",
    })
    if (!res.ok) {
      alert("Archive failed")
      return
    }
    setForm((f) => ({ ...f, status: "ARCHIVED" }))
    router.refresh()
  }

  async function unarchive() {
    if (!confirm("Unarchive this company? This will restore access."))
      return
    const res = await fetch(`/api/admin/companies/${initial.id}/unarchive`, {
      method: "POST",
    })
    if (!res.ok) {
      alert("Unarchive failed")
      return
    }
    setForm((f) => ({ ...f, status: "ACTIVE" }))
    router.refresh()
  }

  async function resetPassword() {
    setPwdSaving(true)
    setPwdMessage(null)
    const res = await fetch(`/api/admin/companies/${initial.id}/password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword: password }),
    })
    const data = await res.json()
    setPwdSaving(false)
    setPwdMessage(res.ok ? "Password updated successfully" : data.error ?? "Error updating password")
    if (res.ok) setPassword("")
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/companies"
              className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-white text-sm"
            >
              ← Back
            </Link>
            <h1 className="text-3xl font-bold text-white">{initial.legalName}</h1>
          </div>
          <span
            className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
              form.status === "ACTIVE"
                ? "bg-emerald-500/20 text-emerald-400"
                : form.status === "BLOCKED"
                ? "bg-red-500/20 text-red-300"
                : "bg-slate-500/30 text-slate-300"
            }`}
          >
            {form.status}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-su-card border border-white/10 rounded-xl p-4">
            <p className="text-2xl font-bold text-emerald-400">
              {initial._count.purchases}
            </p>
            <p className="text-sm text-su-muted">Purchases</p>
          </div>
          <div className="bg-su-card border border-white/10 rounded-xl p-4">
            <p className="text-2xl font-bold text-sky-400">
              {initial._count.documents}
            </p>
            <p className="text-sm text-su-muted">Documents</p>
          </div>
          <div className="bg-su-card border border-white/10 rounded-xl p-4">
            <p className="text-2xl font-bold text-purple-400">
              {initial._count.users}
            </p>
            <p className="text-sm text-su-muted">Users</p>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-su-card border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Company Details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="flex flex-col text-sm text-white/90">
              Legal Name *
              <input
                className="mt-1 rounded-md bg-black/30 text-white p-2.5 border border-white/10 focus:border-emerald-500 outline-none"
                value={form.legalName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, legalName: e.target.value }))
                }
                required
              />
            </label>
            <label className="flex flex-col text-sm text-white/90">
              State
              <input
                className="mt-1 rounded-md bg-black/30 text-white p-2.5 border border-white/10 focus:border-emerald-500 outline-none"
                value={form.state}
                onChange={(e) =>
                  setForm((f) => ({ ...f, state: e.target.value }))
                }
                placeholder="CA, NY, TX..."
              />
            </label>
            <label className="flex flex-col text-sm text-white/90">
              EIN
              <input
                className="mt-1 rounded-md bg-black/30 text-white p-2.5 border border-white/10 focus:border-emerald-500 outline-none"
                value={form.ein}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ein: e.target.value }))
                }
                placeholder="XX-XXXXXXX"
              />
            </label>
            <label className="flex flex-col text-sm text-white/90">
              Contact Email *
              <input
                type="email"
                className="mt-1 rounded-md bg-black/30 text-white p-2.5 border border-white/10 focus:border-emerald-500 outline-none"
                value={form.contactEmail}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contactEmail: e.target.value }))
                }
                required
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={save}
              disabled={saving}
              className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-semibold transition disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            {form.status !== "ARCHIVED" && (
              form.status === "ACTIVE" ? (
                <button
                  onClick={block}
                  className="px-5 py-2.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-white font-semibold transition"
                >
                  Block Company
                </button>
              ) : (
                <button
                  onClick={unblock}
                  className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition"
                >
                  Unblock Company
                </button>
              )
            )}
            {form.status !== "ARCHIVED" ? (
              <button
                onClick={archive}
                className="px-5 py-2.5 rounded-lg bg-slate-600 hover:bg-slate-700 text-white font-medium transition"
                title="Hide from access and block login. Admin can restore later."
              >
                Archive Company
              </button>
            ) : (
              <button
                onClick={unarchive}
                className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition"
                title="Restore access."
              >
                Unarchive Company
              </button>
            )}
          </div>
        </div>

        {/* Password Reset */}
        <div className="bg-su-card border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            Reset Company Password
          </h2>
          <p className="text-sm text-su-muted mb-4">
            Reset the password for the company user account. This will allow the
            company to login with a new password.
          </p>
          <div className="flex gap-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password (min 8 characters)"
              className="flex-1 rounded-md bg-black/30 text-white p-2.5 border border-white/10 focus:border-emerald-500 outline-none"
            />
            <button
              onClick={resetPassword}
              disabled={pwdSaving || password.length < 8}
              className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-semibold transition disabled:opacity-50"
            >
              {pwdSaving ? "Saving..." : "Reset Password"}
            </button>
          </div>
          {pwdMessage && (
            <p
              className={`mt-3 text-sm ${
                pwdMessage.includes("successfully")
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {pwdMessage}
            </p>
          )}
        </div>

        {/* Linked Accountants */}
        <div className="bg-su-card border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            Linked Accountants ({initial.accountantLinks.length})
          </h2>
          {initial.accountantLinks.length === 0 ? (
            <p className="text-su-muted italic">No accountants linked</p>
          ) : (
            <div className="space-y-2">
              {initial.accountantLinks.map((link: any) => (
                <div
                  key={link.accountant.id}
                  className="bg-white/5 rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-white font-medium">
                      {link.accountant.name || link.accountant.email}
                    </p>
                    {link.accountant.name && (
                      <p className="text-xs text-su-muted">
                        {link.accountant.email}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/admin/accountants?search=${link.accountant.email}`}
                    className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-sm transition"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
