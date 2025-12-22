"use client"

/**
 * Check Your Email Content Component
 * 
 * Shown after registration - instructs user to check their inbox
 * for verification email. Provides resend option.
 */

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Mail, RefreshCw } from "lucide-react"

export default function CheckEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  
  const [resendEmail, setResendEmail] = useState(email)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [isError, setIsError] = useState(false)

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    setIsError(false)

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail }),
      })

      const data = await res.json()

      if (data.ok) {
        setMessage(data.message || "Verification email sent! Please check your inbox.")
        setIsError(false)
      } else {
        setMessage(data.message || data.error || "Failed to send email. Please try again.")
        setIsError(true)
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.")
      setIsError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B1220] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#0F172A] border border-white/5 rounded-xl shadow-lg p-8">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-emerald-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-4 text-center text-gray-100">
          Check Your Email
        </h1>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
          <p className="text-gray-200 text-center mb-2">
            We've sent a verification link to:
          </p>
          <p className="text-emerald-400 font-medium text-center break-all">
            {email}
          </p>
        </div>

        <p className="text-gray-400 text-center text-sm mb-6">
          Click the link in the email to confirm your account and complete your registration.
          The link will expire in 24 hours.
        </p>

        <div className="border-t border-white/10 pt-6">
          <p className="text-gray-400 text-sm text-center mb-4">
            Didn't receive the email?
          </p>

          <form onSubmit={handleResend} className="space-y-4">
            <div>
              <input
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 focus:bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-gray-100 placeholder-gray-400"
                placeholder="your.email@example.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold py-3 rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
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
          </form>

          {message && (
            <div
              className={`mt-4 px-4 py-3 rounded-xl ${
                isError
                  ? "bg-red-500/10 border border-red-500/50 text-red-400"
                  : "bg-emerald-500/10 border border-emerald-500/50 text-emerald-400"
              }`}
            >
              {message}
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-gray-400 text-sm">
          Already verified?{" "}
          <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
