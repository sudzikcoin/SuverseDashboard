'use client';

import { useState } from 'react';
import PayModal from '@/components/wallet/PayModal';
import env from '@/lib/env';
import { getAddresses } from '@/lib/payments/usdc';
import { parseAmountInput, isPositiveMoney, fmtMoney, meetsMinimum, MIN_USDC_AMOUNT } from '@/lib/number';

const { token: USDC, escrow: ESCROW } = getAddresses();
const CHAIN_ID = env.NEXT_PUBLIC_BASE_CHAIN_ID;
const FEE_BPS = env.NEXT_PUBLIC_PLATFORM_FEE_BPS;

export default function USDCPay({ defaultAmount = 0 }: { defaultAmount?: number }) {
  const [raw, setRaw] = useState<string>(defaultAmount > 0 ? defaultAmount.toFixed(2) : "");
  const [modalOpen, setModalOpen] = useState(false);

  const parsed = parseAmountInput(raw);
  const amount = parsed.value;

  const fee = isPositiveMoney(amount) ? (amount * FEE_BPS) / 10000 : null;
  const total = isPositiveMoney(amount) && fee !== null ? amount + fee : null;

  const canPay = meetsMinimum(amount);
  const showMinWarning = isPositiveMoney(amount) && amount < MIN_USDC_AMOUNT;

  const handleBlur = () => {
    if (isPositiveMoney(amount)) {
      setRaw(amount.toFixed(2));
    }
  };

  const handlePay = () => {
    if (canPay && amount) {
      setModalOpen(true);
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 glass glow-emerald shadow-lg">
        <h3 className="mb-4 text-xl font-semibold text-gray-100">Pay with USDC (Base)</h3>
        
        <div className="mb-4 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-gray-200">Amount:</label>
            <input
              type="text"
              inputMode="decimal"
              pattern="\d*"
              placeholder="0.00"
              value={parsed.display}
              onChange={(e) => setRaw(e.target.value)}
              onBlur={handleBlur}
              className="w-32 rounded-lg bg-black/40 px-3 py-2 text-gray-100 outline-none border border-white/10 focus:border-emerald-400/40 transition"
            />
            <span className="text-gray-200 font-medium">USDC</span>
          </div>

          {!isPositiveMoney(amount) && raw !== "" && (
            <p className="text-xs text-amber-400">
              Enter amount greater than 0.00
            </p>
          )}

          {showMinWarning && (
            <p className="text-xs text-amber-400">
              Minimum amount is ${MIN_USDC_AMOUNT.toFixed(2)}
            </p>
          )}

          <div className="rounded-lg bg-black/20 p-3 space-y-2 text-sm">
            <div className="flex justify-between text-gray-300">
              <span>Platform Fee ({(FEE_BPS / 100).toFixed(2)}%):</span>
              <span>${fmtMoney(fee)}</span>
            </div>
            <div className="flex justify-between text-gray-100 font-semibold border-t border-white/10 pt-2">
              <span>Total:</span>
              <span className="text-su-emerald">${fmtMoney(total)}</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={handlePay}
          disabled={!canPay}
          className="w-full rounded-lg bg-su-emerald px-6 py-3 font-semibold text-black hover:opacity-90 transition inline-flex items-center justify-center gap-2 hover:shadow-[0_0_40px_-12px_rgba(16,185,129,0.25)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
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

      {modalOpen && canPay && amount && (
        <PayModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          amount={amount}
          feeBps={FEE_BPS}
          escrow={ESCROW}
          token={USDC}
          chainId={CHAIN_ID}
        />
      )}
    </>
  );
}
