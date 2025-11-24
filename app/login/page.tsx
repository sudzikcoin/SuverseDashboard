"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, RefreshCw } from "lucide-react"
import Card from "@/components/Card"
import Button from "@/components/Button"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showResend, setShowResend] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setShowResend(false)
    setResendMessage("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        if (result.error.toLowerCase().includes("archived")) {
          setError("Company is archived. Please contact info@suverse.io")
          setShowResend(false)
        } else if (result.error.includes("UNVERIFIED_EMAIL")) {
          setError("Your email address is not verified yet. Please check your inbox for the verification link or request a new one below.")
          setShowResend(true)
        } else {
          setError("Invalid email or password")
          setShowResend(false)
        }
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
      setShowResend(false)
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    setResendLoading(true)
    setResendMessage("")

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (data.ok) {
        setResendMessage(data.message || "Verification email sent! Please check your inbox.")
      } else {
        setResendMessage(data.message || "Failed to send email. Please try again.")
      }
    } catch (error) {
      setResendMessage("An error occurred. Please try again.")
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B1220] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#0F172A] border border-white/5 rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-100">Login</h1>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {showResend && (
          <div className="bg-emerald-500/10 border border-emerald-500/50 rounded-xl p-4 mb-4">
            <button
              onClick={handleResendVerification}
              disabled={resendLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold py-2 px-4 rounded-lg transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {resendLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Resend Verification Email
                </>
              )}
            </button>
            {resendMessage && (
              <p className="mt-3 text-sm text-emerald-300 text-center">
                {resendMessage}
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 focus:bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand focus:outline-none text-gray-100 placeholder-gray-400"
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 pr-12 bg-white/5 focus:bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand focus:outline-none text-gray-100 placeholder-gray-400"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors focus:outline-none focus:text-gray-200"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand hover:bg-brand-dark text-black font-semibold py-3 rounded-xl transition disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400">
          Don't have an account?{" "}
          <Link href="/register" className="text-brand hover:text-brand-dark font-medium">
            Sign up
          </Link>
        </p>

        {process.env.NEXT_PUBLIC_SHOW_DEMO_HINT === "true" && (
          <div className="mt-6 rounded-lg border border-dashed border-slate-700 bg-slate-900/60 p-4 text-xs text-slate-400">
            <p className="font-medium text-slate-200 mb-2">Demo Broker Account</p>
            <p>
              Email: <span className="font-mono text-emerald-400">broker.demo@suverse.io</span>
            </p>
            <p>
              Password: <span className="font-mono text-emerald-400">demoBroker123</span>
            </p>
            <p className="mt-2 text-slate-500">
              Use this account to explore the Broker Portal at{" "}
              <span className="font-mono text-slate-400">/broker/dashboard</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
