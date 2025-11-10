'use client';

import { useState } from 'react';
import PayModal from '@/components/wallet/PayModal';
import { NEXT_PUBLIC_PLATFORM_FEE_BPS } from '@/lib/env';
import { getUsdcConfig } from '@/lib/payments/usdc';

const config = getUsdcConfig();
const USDC = config.usdcAddress;
const ESCROW = config.escrow;
const CHAIN_ID = config.chainId;
const FEE_BPS = NEXT_PUBLIC_PLATFORM_FEE_BPS;

export default function USDCPay({ defaultAmount = 1000 }: { defaultAmount?: number }) {
  const [amt, setAmt] = useState(defaultAmount);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
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
        
        <button
          onClick={() => setModalOpen(true)}
          className="w-full rounded-lg bg-su-emerald px-6 py-3 font-semibold text-black hover:opacity-90 transition inline-flex items-center justify-center gap-2 hover:shadow-[0_0_40px_-12px_rgba(16,185,129,0.25)]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Pay
        </button>
        
        <p className="mt-4 text-xs text-gray-200 leading-relaxed">
          Click Pay to confirm the amount and complete your USDC payment on Base network.
          The transaction will be sent directly to our secure escrow address.
        </p>
      </div>

      <PayModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        amount={amt}
        feeBps={FEE_BPS}
        escrow={ESCROW}
        token={USDC}
        chainId={CHAIN_ID}
      />
    </>
  );
}
