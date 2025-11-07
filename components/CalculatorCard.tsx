"use client";
import { useState, useMemo } from "react";
import { compute } from "@/lib/calc";
import { formatNumber, formatUSDWithCents } from "@/lib/format";

export default function CalculatorCard({ compact = false }: { compact?: boolean }) {
  const [taxLiability, setTaxLiability] = useState(25000);
  const [creditPrice, setCreditPrice] = useState(0.89);
  const [platformFeePct, setPlatformFeePct] = useState(1.5);
  const [brokerFeePct, setBrokerFeePct] = useState(1.0);
  const [feeBase, setFeeBase] = useState<"face" | "subtotal">("face");

  const r = useMemo(
    () =>
      compute({ taxLiability, creditPrice, platformFeePct, brokerFeePct, feeBase }),
    [taxLiability, creditPrice, platformFeePct, brokerFeePct, feeBase]
  );

  return (
    <div className="glass halo rounded-2xl border border-white/10 p-6 backdrop-blur">
      <h3 className="text-2xl font-bold mb-6 text-su-text">Tax Credit Calculator</h3>
      <div className={`grid ${compact ? "grid-cols-1" : "lg:grid-cols-2"} gap-6`}>
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Estimated Tax Liability ($)</label>
            <input 
              className="w-full rounded-xl bg-black/20 px-4 py-3 text-su-text outline-none border border-white/10 focus:border-su-emerald/50 transition"
              type="number" 
              value={taxLiability} 
              onChange={(e)=>setTaxLiability(+e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Credit Price (per $1)</label>
            <input 
              className="w-full rounded-xl bg-black/20 px-4 py-3 text-su-text outline-none border border-white/10 focus:border-su-emerald/50 transition"
              type="number" 
              step="0.01" 
              value={creditPrice} 
              onChange={(e)=>setCreditPrice(+e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Platform Fee %</label>
            <input 
              className="w-full rounded-xl bg-black/20 px-4 py-3 text-su-text outline-none border border-white/10 focus:border-su-emerald/50 transition"
              type="number" 
              step="0.1" 
              value={platformFeePct} 
              onChange={(e)=>setPlatformFeePct(+e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Broker Fee %</label>
            <input 
              className="w-full rounded-xl bg-black/20 px-4 py-3 text-su-text outline-none border border-white/10 focus:border-su-emerald/50 transition"
              type="number" 
              step="0.1" 
              value={brokerFeePct} 
              onChange={(e)=>setBrokerFeePct(+e.target.value)} 
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-white/90">Fees base:</span>
            <select 
              value={feeBase} 
              onChange={(e)=>setFeeBase(e.target.value as any)}
              className="rounded-xl bg-black/20 px-4 py-2 text-su-text outline-none border border-white/10 focus:border-su-emerald/50 transition"
            >
              <option value="face">Face</option>
              <option value="subtotal">Subtotal</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 content-start">
          <div className="rounded-xl bg-black/30 border border-white/10 p-4 space-y-2">
            <div className="flex justify-between text-su-text">
              <span>Face Value</span>
              <span className="font-mono" suppressHydrationWarning>${formatNumber(r.face)}</span>
            </div>
            <div className="flex justify-between text-su-muted">
              <span>Cost Before Fees</span>
              <span className="font-mono" suppressHydrationWarning>${formatNumber(r.costBeforeFees)}</span>
            </div>
            <div className="flex justify-between text-su-muted">
              <span>Platform Fee</span>
              <span className="font-mono" suppressHydrationWarning>{formatUSDWithCents(r.platformFee)}</span>
            </div>
            <div className="flex justify-between text-su-muted">
              <span>Broker Fee</span>
              <span className="font-mono" suppressHydrationWarning>{formatUSDWithCents(r.brokerFee)}</span>
            </div>
            <div className="border-t border-white/10 pt-2 mt-2 flex justify-between font-semibold text-su-text">
              <span>Total Cost</span>
              <span className="font-mono" suppressHydrationWarning>${formatNumber(r.totalCost)}</span>
            </div>
          </div>
          <div className="rounded-xl bg-su-emerald/10 border border-su-emerald/40 p-4 space-y-2 glow-emerald">
            <div className="flex justify-between text-su-text">
              <span>Savings</span>
              <span className="font-mono font-semibold text-su-emerald" suppressHydrationWarning>${formatNumber(r.savings)}</span>
            </div>
            <div className="flex justify-between text-su-text">
              <span>Effective Discount</span>
              <span className="font-mono font-semibold text-su-emerald" suppressHydrationWarning>{formatNumber(r.effectiveDiscountPct)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
