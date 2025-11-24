"use client"

/**
 * Email Verification Page
 * 
 * Handles email verification from the link sent to users.
 * Shows verification status and next steps.
 */

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { CheckCircle, XCircle, RefreshCw, Loader2 } from "lucide-react"

type VerificationState = 'verifying' | 'success' | 'error'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")
  
  const [state, setState] = useState<VerificationState>('verifying')
  const [error, setError] = useState("")
  const [resendEmail, setResendEmail] = useState("")
  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] = useState("")

  useEffect(() => {
    if (!token) {
      setState('error')
      setError("No verification token provided. Please check your email link.")
      return
    }

    verifyToken(token)
  }, [token])

  const verifyToken = async (token: string) => {
    try {
      const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      const data = await res.json()

      if (data.ok) {
        setState('success')
        // Auto-redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        setState('error')
        if (data.error === 'expired') {
          setError("This verification link has expired. Please request a new one below.")
        } else if (data.error === 'invalid_or_used') {
          setError("This verification link is invalid or has already been used.")
        } else {
          setError("Verification failed. Please try again or request a new link.")
        }
      }
    } catch (err) {
      setState('error')
      setError("An error occurred during verification. Please try again.")
    }
  }

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault()
    setResending(true)
    setResendMessage("")

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail }),
      })

      const data = await res.json()

      if (data.ok || res.ok) {
        setResendMessage(data.message || "A new verification link has been sent to your email!")
      } else {
        setResendMessage(data.message || "Failed to send email. Please try again.")
      }
    } catch (error) {
      setResendMessage("An error occurred. Please try again.")
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B1220] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#0F172A] border border-white/5 rounded-xl shadow-lg p-8">
        
        {/* Verifying State */}
        {state === 'verifying' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-4 text-center text-gray-100">
              Verifying Your Email...
            </h1>
            <p className="text-gray-400 text-center">
              Please wait while we confirm your email address.
            </p>
          </>
        )}

        {/* Success State */}
        {state === 'success' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-4 text-center text-gray-100">
              Email Verified!
            </h1>
            <p className="text-gray-400 text-center mb-6">
              Your email has been successfully verified. You can now sign in to your account.
            </p>
            <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 px-4 py-3 rounded-xl mb-6 text-center text-sm">
              Redirecting to login in 3 seconds...
            </div>
            <Link
              href="/login"
              className="block w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold py-3 rounded-xl transition text-center"
            >
              Go to Login
            </Link>
          </>
        )}

        {/* Error State */}
        {state === 'error' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-4 text-center text-gray-100">
              Verification Failed
            </h1>
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6">
              {error}
            </div>

            {/* Resend Form */}
            <div className="border-t border-white/10 pt-6">
              <p className="text-gray-400 text-sm text-center mb-4">
                Request a new verification link:
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
                  disabled={resending}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold py-3 rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {resending ? (
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

              {resendMessage && (
                <div className="mt-4 bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 px-4 py-3 rounded-xl">
                  {resendMessage}
                </div>
              )}
            </div>

            <p className="mt-6 text-center text-gray-400 text-sm">
              <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
                Back to Login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
