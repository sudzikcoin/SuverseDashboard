"use client"

/**
 * Email Verification Content Component
 * 
 * Handles email verification from the link sent to users.
 * Shows verification status and next steps.
 * 
 * State machine:
 * - idle/loading: "Verifying your email..."
 * - success: "Email Verified!" with auto-redirect to login
 * - error: Shows specific error based on API response code:
 *   - TOKEN_USED: "This link has already been used. Please login."
 *   - TOKEN_EXPIRED: "This link has expired. Please request a new link below."
 *   - MISSING_TOKEN/other: "This verification link is invalid."
 * 
 * Uses useRef guard to prevent duplicate API calls in React Strict Mode.
 */

import { useEffect, useState, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { CheckCircle, XCircle, RefreshCw, Loader2, AlertCircle } from "lucide-react"

type VerificationState = 'idle' | 'loading' | 'success' | 'error'
type ErrorCode = 'TOKEN_USED' | 'TOKEN_EXPIRED' | 'MISSING_TOKEN' | 'SERVER_ERROR' | 'NETWORK_ERROR' | 'UNKNOWN'

export default function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")
  
  const [state, setState] = useState<VerificationState>('idle')
  const [message, setMessage] = useState("")
  const [errorCode, setErrorCode] = useState<ErrorCode | null>(null)
  const [resendEmail, setResendEmail] = useState("")
  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] = useState("")
  
  const hasRun = useRef(false)

  useEffect(() => {
    console.log('[VERIFY_PAGE] useEffect triggered, token:', token ? 'present' : 'missing', 'hasRun:', hasRun.current)
    
    if (!token) {
      console.log('[VERIFY_PAGE] No token provided')
      setState('error')
      setErrorCode('MISSING_TOKEN')
      setMessage("This verification link is invalid or incomplete.")
      return
    }

    if (hasRun.current) {
      console.log('[VERIFY_PAGE] Skipping duplicate call (hasRun guard)')
      return
    }
    hasRun.current = true

    const verifyToken = async () => {
      console.log('[VERIFY_PAGE] Starting verification API call')
      try {
        setState('loading')

        const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
        const data = await res.json()
        
        console.log('[VERIFY_PAGE] API response:', { status: res.status, ok: res.ok, data })

        if (res.ok && data.success) {
          console.log('[VERIFY_PAGE] ✓ Verification successful')
          setState('success')
          setMessage(data.message || 'Your email has been successfully verified. You can now sign in.')
          setTimeout(() => {
            console.log('[VERIFY_PAGE] Redirecting to login')
            router.push('/login')
          }, 3000)
        } else {
          const code = data?.code as ErrorCode || 'UNKNOWN'
          const msg = data?.message || 'Verification failed. Please request a new verification link.'
          
          console.log('[VERIFY_PAGE] ✗ Verification failed:', { code, message: msg })
          
          setState('error')
          setErrorCode(code)
          setMessage(msg)
        }
      } catch (err) {
        console.error('[VERIFY_PAGE] Network/parsing error:', err)
        setState('error')
        setErrorCode('NETWORK_ERROR')
        setMessage('Unable to verify your email. Please check your connection and try again.')
      }
    }

    void verifyToken()
  }, [token, router])

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
        setResendMessage(data.message || "If an account with that email exists and is not yet verified, a new verification link has been sent.")
      } else {
        setResendMessage(data.message || "Failed to send email. Please try again.")
      }
    } catch (error) {
      setResendMessage("An error occurred. Please try again.")
    } finally {
      setResending(false)
    }
  }

  if (state === 'loading' || state === 'idle') {
    return (
      <div className="min-h-screen bg-[#0B1220] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0F172A] border border-white/5 rounded-xl shadow-lg p-8">
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
        </div>
      </div>
    )
  }

  if (state === 'success') {
    return (
      <div className="min-h-screen bg-[#0B1220] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0F172A] border border-white/5 rounded-xl shadow-lg p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-4 text-center text-gray-100">
            Email Verified!
          </h1>
          <p className="text-gray-400 text-center mb-6">
            {message}
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
        </div>
      </div>
    )
  }

  const getErrorTitle = () => {
    switch (errorCode) {
      case 'TOKEN_USED':
        return 'Link Already Used'
      case 'TOKEN_EXPIRED':
        return 'Link Expired'
      default:
        return 'Verification Failed'
    }
  }
  
  const getErrorIcon = () => {
    if (errorCode === 'TOKEN_USED') {
      return <AlertCircle className="w-8 h-8 text-amber-400" />
    }
    return <XCircle className="w-8 h-8 text-red-400" />
  }
  
  const getIconBgClass = () => {
    if (errorCode === 'TOKEN_USED') {
      return 'bg-amber-500/10 border-amber-500/30'
    }
    return 'bg-red-500/10 border-red-500/30'
  }
  
  const getMessageBgClass = () => {
    if (errorCode === 'TOKEN_USED') {
      return 'bg-amber-500/10 border-amber-500/50 text-amber-400'
    }
    return 'bg-red-500/10 border-red-500/50 text-red-400'
  }

  if (errorCode === 'TOKEN_USED') {
    return (
      <div className="min-h-screen bg-[#0B1220] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0F172A] border border-white/5 rounded-xl shadow-lg p-8">
          <div className="flex justify-center mb-6">
            <div className={`w-16 h-16 ${getIconBgClass()} border rounded-full flex items-center justify-center`}>
              {getErrorIcon()}
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-4 text-center text-gray-100">
            {getErrorTitle()}
          </h1>
          <div className={`${getMessageBgClass()} px-4 py-3 rounded-xl mb-6`}>
            This verification link has already been used. If you've already verified your email, you can proceed to login.
          </div>
          
          <Link
            href="/login"
            className="block w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold py-3 rounded-xl transition text-center"
          >
            Go to Login
          </Link>
          
          <div className="border-t border-white/10 pt-6 mt-6">
            <p className="text-gray-400 text-sm text-center mb-4">
              Need a new verification link?
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
                className="w-full bg-white/10 hover:bg-white/20 text-gray-200 font-semibold py-3 rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-2"
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
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B1220] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#0F172A] border border-white/5 rounded-xl shadow-lg p-8">
        <div className="flex justify-center mb-6">
          <div className={`w-16 h-16 ${getIconBgClass()} border rounded-full flex items-center justify-center`}>
            {getErrorIcon()}
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-4 text-center text-gray-100">
          {getErrorTitle()}
        </h1>
        <div className={`${getMessageBgClass()} px-4 py-3 rounded-xl mb-6`}>
          {message}
        </div>

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
      </div>
    </div>
  )
}
