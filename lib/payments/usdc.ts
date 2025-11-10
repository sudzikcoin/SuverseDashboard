import env from "../env";
import { safeNum, safeInt, safeFixed } from "../safeNumber";

export function usdToUnits(usdAmount: string | number): bigint {
  if (usdAmount === "" || usdAmount === null || usdAmount === undefined) {
    throw new Error("Amount is required");
  }
  const n = safeNum(usdAmount, 0);
  if (n <= 0) throw new Error("Amount must be a positive number");

  const decimals = safeInt(env.NEXT_PUBLIC_USDC_DECIMALS ?? 6, 6);
  const scaled = safeFixed(n, decimals);
  const unitsStr = scaled.replace(".", "");
  const normalized = unitsStr.replace(/^0+(?!$)/, "");
  return BigInt(normalized);
}

export function calcFeeBps(units: bigint): { fee: bigint; total: bigint } {
  const bps = BigInt(env.NEXT_PUBLIC_PLATFORM_FEE_BPS ?? 100);
  const fee = (units * bps) / BigInt(10_000);
  return { fee, total: units + fee };
}

export function getAddresses() {
  return {
    token: (env.NEXT_PUBLIC_USDC_ADDRESS || "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913") as `0x${string}`,
    escrow: (env.NEXT_PUBLIC_ESCROW_ADDRESS || "") as `0x${string}`,
  };
}

export function formatUnitsToUsd(units: bigint): string {
  const decimals = safeInt(env.NEXT_PUBLIC_USDC_DECIMALS ?? 6, 6);
  const value = Number(units) / 10 ** decimals;
  return safeFixed(value, 2);
}
