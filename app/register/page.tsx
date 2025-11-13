"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Card from "@/components/Card"
import Button from "@/components/Button"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "COMPANY",
    companyLegalName: "",
    state: "",
    ein: "",
    taxLiability: "",
    targetCloseYear: "",
  })
  const [error, setError] = useState("")
  const [einError, setEinError] = useState("")
  const [loading, setLoading] = useState(false)

  const validateEIN = (ein: string): boolean => {
    if (!ein) return true // EIN is optional
    const einRegex = /^\d{2}-\d{7}$/
    return einRegex.test(ein)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setEinError("")
    setLoading(true)

    // Validate EIN format before submission
    if (formData.role === "COMPANY" && formData.ein && !validateEIN(formData.ein)) {
      setEinError("EIN must be in format XX-XXXXXXX (e.g., 12-3456789)")
      setLoading(false)
      return
    }

    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      }

      if (formData.role === "COMPANY") {
        payload.companyLegalName = formData.companyLegalName
        payload.state = formData.state
        payload.ein = formData.ein || undefined
        payload.taxLiability = formData.taxLiability
          ? parseFloat(formData.taxLiability)
          : undefined
        payload.targetCloseYear = formData.targetCloseYear
          ? parseInt(formData.targetCloseYear)
          : undefined
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Registration failed")
      }

      router.push("/login")
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B1220] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-[#0F172A] border border-white/5 rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-100">Sign Up</h1>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Role</label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="w-full px-4 py-2 bg-white/5 focus:bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand focus:outline-none text-gray-100 placeholder-gray-400"
            >
              <option value="COMPANY">Company (Buyer)</option>
              <option value="ACCOUNTANT">Accountant</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 bg-white/5 focus:bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand focus:outline-none text-gray-100 placeholder-gray-400"
              placeholder="Your full name"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 bg-white/5 focus:bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand focus:outline-none text-gray-100 placeholder-gray-400"
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-2 bg-white/5 focus:bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand focus:outline-none text-gray-100 placeholder-gray-400"
                placeholder="Min. 8 characters"
                required
                minLength={8}
              />
            </div>
          </div>

          {formData.role === "COMPANY" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Company Legal Name
                </label>
                <input
                  type="text"
                  value={formData.companyLegalName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyLegalName: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-white/5 focus:bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand focus:outline-none text-gray-100 placeholder-gray-400"
                  placeholder="Acme Corporation Inc."
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/5 focus:bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand focus:outline-none text-gray-100 placeholder-gray-400"
                    placeholder="CA, NY, TX..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    EIN (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.ein}
                    onChange={(e) => {
                      const value = e.target.value
                      setFormData({ ...formData, ein: value })
                      if (value && !validateEIN(value)) {
                        setEinError("Format: XX-XXXXXXX")
                      } else {
                        setEinError("")
                      }
                    }}
                    className={`w-full px-4 py-2 bg-white/5 focus:bg-white/10 border ${
                      einError ? "border-red-500/50" : "border-white/10"
                    } rounded-xl focus:ring-2 focus:ring-brand focus:outline-none text-gray-100 placeholder-gray-400`}
                    placeholder="12-3456789"
                    pattern="\d{2}-\d{7}"
                    title="EIN must be in format XX-XXXXXXX (e.g., 12-3456789)"
                  />
                  {einError && (
                    <p className="mt-1 text-sm text-red-400">{einError}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Est. Tax Liability (Optional)
                  </label>
                  <input
                    type="number"
                    value={formData.taxLiability}
                    onChange={(e) =>
                      setFormData({ ...formData, taxLiability: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/5 focus:bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand focus:outline-none text-gray-100 placeholder-gray-400"
                    placeholder="100000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Target Close Year (Optional)
                  </label>
                  <input
                    type="number"
                    value={formData.targetCloseYear}
                    onChange={(e) =>
                      setFormData({ ...formData, targetCloseYear: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/5 focus:bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand focus:outline-none text-gray-100 placeholder-gray-400"
                    placeholder="2025"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand hover:bg-brand-dark text-black font-semibold py-3 rounded-xl transition disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-brand hover:text-brand-dark font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
