import { parseUnits } from "viem";
import { env, asNumber } from "@/lib/env";

export const getUsdcConfig = () => {
  const chainId = asNumber(env.NEXT_PUBLIC_BASE_CHAIN_ID);
  const decimals = asNumber(env.NEXT_PUBLIC_USDC_DECIMALS);
  const feeBps = asNumber(env.NEXT_PUBLIC_PLATFORM_FEE_BPS);

  return {
    chainId,
    usdcAddress: env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`,
    usdcDecimals: decimals,
    escrow: env.NEXT_PUBLIC_ESCROW_ADDRESS as `0x${string}`,
    feeBps,
  };
};

export function calcAmounts(inputUsd: string) {
  const { usdcDecimals, feeBps } = getUsdcConfig();
  const amount = parseUnits(inputUsd, usdcDecimals);
  const fee = (amount * BigInt(feeBps)) / BigInt(10_000);
  const total = amount + fee;
  return { amount, fee, total };
}
