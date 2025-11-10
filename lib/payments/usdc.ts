"use client";
import { parseUnits } from "viem";
import {
  NEXT_PUBLIC_USDC_ADDRESS,
  NEXT_PUBLIC_ESCROW_ADDRESS,
  NEXT_PUBLIC_USDC_DECIMALS,
  NEXT_PUBLIC_BASE_CHAIN_ID,
  NEXT_PUBLIC_PLATFORM_FEE_BPS,
} from "@/lib/env";

export const getUsdcConfig = () => {
  return {
    chainId: NEXT_PUBLIC_BASE_CHAIN_ID,
    usdcAddress: NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`,
    usdcDecimals: NEXT_PUBLIC_USDC_DECIMALS,
    escrow: NEXT_PUBLIC_ESCROW_ADDRESS as `0x${string}`,
    feeBps: NEXT_PUBLIC_PLATFORM_FEE_BPS,
  };
};

export function calcAmounts(inputUsd: number) {
  const { usdcDecimals, feeBps } = getUsdcConfig();
  const amount = parseUnits(inputUsd.toString(), usdcDecimals);
  const fee = (amount * BigInt(feeBps)) / BigInt(10_000);
  const total = amount + fee;
  return { amount, fee, total };
}

export function calcFeeUsd(baseAmount: number) {
  const fee = Math.round((baseAmount * NEXT_PUBLIC_PLATFORM_FEE_BPS) / 100) / 100;
  const total = +(baseAmount + fee).toFixed(2);
  return { fee, total };
}
