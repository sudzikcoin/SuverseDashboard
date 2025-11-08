'use client';

import { useState, useMemo } from 'react';

const USDC = process.env.NEXT_PUBLIC_USDC_BASE!;
const TO = process.env.NEXT_PUBLIC_ESCROW_ADDRESS!;
const CHAIN_ID = 8453; // Base

function toWei6(n: number) {
  return BigInt(Math.round(n * 1_000_000));
}

function buildLink(amount: number) {
  const wei = toWei6(amount);
  return `ethereum:${USDC}/transfer?address=${TO}&uint256=${wei}&chain_id=${CHAIN_ID}`;
}

export default function USDCPay({ defaultAmount = 1000 }: { defaultAmount?: number }) {
  const [amt, setAmt] = useState(defaultAmount);
  const link = useMemo(() => buildLink(amt || 0), [amt]);

  return (
    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 glass glow-emerald shadow-lg">
      <h3 className="mb-4 text-xl font-semibold text-gray-100">Pay with USDC (Base)</h3>
      
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="text-gray-200">Amount:</label>
        <input
          type="number"
          min={1}
          step="1"
          value={amt}
          onChange={(e) => setAmt(Number(e.target.value))}
          className="w-32 rounded-lg bg-black/40 px-3 py-2 text-gray-100 outline-none border border-white/10 focus:border-emerald-400/40 transition"
        />
        <span className="text-gray-200 font-medium">USDC</span>
      </div>
      
      <div className="flex flex-wrap gap-3">
        <a
          href={link}
          className="rounded-lg bg-su-emerald px-6 py-3 font-semibold text-black hover:opacity-90 transition inline-flex items-center gap-2 hover:shadow-[0_0_40px_-12px_rgba(16,185,129,0.25)]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Open in wallet
        </a>
        <button
          onClick={() => navigator.clipboard.writeText(link)}
          className="rounded-lg border border-white/20 px-6 py-3 text-gray-100 hover:bg-white/10 transition inline-flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy payment link
        </button>
      </div>
      
      <p className="mt-4 text-xs text-gray-200 leading-relaxed">
        This creates an ERC-20 transfer request to the escrow address on Base chain.
        After payment, the back-office can verify the on-chain transaction hash and mark the order as paid.
      </p>
    </div>
  );
}
