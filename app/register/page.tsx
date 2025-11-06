"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Card from "@/components/Card"
import Button from "@/components/Button"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
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
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const payload: any = {
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">Sign Up</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="COMPANY">Company (Buyer)</option>
              <option value="ACCOUNTANT">Accountant</option>
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
                minLength={8}
              />
            </div>
          </div>

          {formData.role === "COMPANY" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Company Legal Name
                </label>
                <input
                  type="text"
                  value={formData.companyLegalName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyLegalName: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="CA, NY, TX..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    EIN (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.ein}
                    onChange={(e) =>
                      setFormData({ ...formData, ein: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Est. Tax Liability (Optional)
                  </label>
                  <input
                    type="number"
                    value={formData.taxLiability}
                    onChange={(e) =>
                      setFormData({ ...formData, taxLiability: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="100000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Target Close Year (Optional)
                  </label>
                  <input
                    type="number"
                    value={formData.targetCloseYear}
                    onChange={(e) =>
                      setFormData({ ...formData, targetCloseYear: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="2025"
                  />
                </div>
              </div>
            </>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </Card>
    </div>
  )
}
