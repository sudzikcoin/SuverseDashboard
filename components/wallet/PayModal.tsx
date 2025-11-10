"use client"

import { useState, useMemo } from "react"
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
} from "wagmi"
import { erc20Abi } from "@/lib/erc20"
import { toRaw, calcWithFee, fromRaw, formatUSDWithCents } from "@/lib/format"
import { X } from "lucide-react"
import { getUsdcConfig } from "@/lib/payments/usdc"

const config = getUsdcConfig()
const DECIMALS = config.usdcDecimals
const CHAIN_ID = config.chainId

interface PayModalProps {
  open: boolean
  onClose: () => void
  amount: number
  feeBps: number
  escrow: string
  token: string
  chainId: number
  purchaseOrderId?: string
}

export default function PayModal({
  open,
  onClose,
  amount,
  feeBps,
  escrow,
  token,
  chainId,
  purchaseOrderId,
}: PayModalProps) {
  const { address, chain } = useAccount()
  const { switchChainAsync } = useSwitchChain()
  const { writeContractAsync, isPending: isWriting } = useWriteContract()
  const [status, setStatus] = useState<
    "idle" | "switching" | "pending" | "submitted" | "confirmed" | "error"
  >("idle")
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [paymentLogId, setPaymentLogId] = useState<string | null>(null)

  const amountRaw = useMemo(() => toRaw(amount, DECIMALS), [amount])
  const { fee: feeRaw, total: totalRaw } = useMemo(
    () => calcWithFee(amountRaw, feeBps),
    [amountRaw, feeBps]
  )

  const feeAmount = useMemo(() => fromRaw(feeRaw, DECIMALS), [feeRaw])
  const totalAmount = useMemo(() => fromRaw(totalRaw, DECIMALS), [totalRaw])

  async function handlePay() {
    if (!address) {
      setError("Please connect your wallet first")
      return
    }

    let logId: string | null = null

    try {
      setError(null)

      if (chain?.id !== chainId) {
        setStatus("switching")
        await switchChainAsync({ chainId })
      }

      setStatus("pending")

      const logResponse = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountRaw: amountRaw.toString(),
          feeBps,
          feeRaw: feeRaw.toString(),
          totalRaw: totalRaw.toString(),
          chainId,
          tokenAddress: token,
          toAddress: escrow,
          purchaseOrderId,
          meta: { fromAddress: address },
        }),
      })

      if (!logResponse.ok) {
        throw new Error("Failed to create payment log")
      }

      const { id } = await logResponse.json()
      logId = id
      setPaymentLogId(id)

      const hash = await writeContractAsync({
        address: token as `0x${string}`,
        abi: erc20Abi,
        functionName: "transfer",
        args: [escrow as `0x${string}`, totalRaw],
      })

      setTxHash(hash)
      setStatus("submitted")

      await fetch("/api/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: logId, txHash: hash, status: "SUBMITTED" }),
      })

      setStatus("confirmed")
    } catch (err: any) {
      console.error("Payment error:", err)
      const msg = (err?.shortMessage || err?.message || "").toString()
      const friendly =
        msg.includes("Invalid 0x address") || msg.includes('Address "6" is invalid')
          ? "Payment configuration error: invalid contract or escrow address. Please contact support."
          : msg || "Payment failed"
      setError(friendly)
      setStatus("error")

      if (logId) {
        try {
          await fetch("/api/payments", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: logId,
              status: "FAILED",
              meta: { error: err.message },
            }),
          })
        } catch (updateErr) {
          console.error("Failed to update payment log:", updateErr)
        }
      }
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0E1526] border border-white/10 rounded-2xl p-6 w-full max-w-md text-white space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-300 to-sky-300 bg-clip-text text-transparent">
          Confirm Payment
        </h2>

        <div className="space-y-3 py-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Amount</span>
            <span className="text-xl font-semibold text-white">
              {formatUSDWithCents(amount)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400">
              Platform Fee ({(feeBps / 100).toFixed(2)}%)
            </span>
            <span className="text-lg text-gray-300">
              {formatUSDWithCents(feeAmount)}
            </span>
          </div>

          <div className="border-t border-white/10 pt-3 flex justify-between items-center">
            <span className="text-gray-200 font-medium">Total</span>
            <span className="text-2xl font-bold text-su-emerald">
              {formatUSDWithCents(totalAmount)}
            </span>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {status === "confirmed" && txHash && (
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-emerald-400 text-sm">
            <p className="font-semibold mb-1">Payment Submitted!</p>
            <p className="text-xs text-gray-400 break-all">TX: {txHash}</p>
          </div>
        )}

        <div className="flex gap-3">
          {status !== "confirmed" && (
            <>
              <button
                onClick={handlePay}
                disabled={
                  isWriting || status === "switching" || status === "pending"
                }
                className="flex-1 rounded-lg bg-su-emerald px-6 py-3 font-semibold text-black hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "switching" && "Switching Network..."}
                {status === "pending" && "Confirm in Wallet..."}
                {status === "submitted" && "Processing..."}
                {status === "idle" && "Confirm & Pay"}
                {status === "error" && "Try Again"}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 border border-white/20 rounded-lg text-gray-300 hover:bg-white/10 transition"
              >
                Cancel
              </button>
            </>
          )}
          {status === "confirmed" && (
            <button
              onClick={onClose}
              className="flex-1 rounded-lg bg-su-emerald px-6 py-3 font-semibold text-black hover:opacity-90 transition"
            >
              Done
            </button>
          )}
        </div>

        {!address && (
          <p className="text-xs text-gray-400 text-center">
            Please connect your wallet to continue
          </p>
        )}
      </div>
    </div>
  )
}
