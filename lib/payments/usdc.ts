import { clientEnv } from "../env";
import { safeNum, safeInt, safeFixed } from "../safeNumber";

export function usdToUnits(usdAmount: string | number): bigint {
  if (usdAmount === "" || usdAmount === null || usdAmount === undefined) {
    throw new Error("Amount is required");
  }
  const n = safeNum(usdAmount, 0);
  if (n <= 0) throw new Error("Amount must be a positive number");

  const decimals = safeInt(clientEnv.NEXT_PUBLIC_USDC_DECIMALS, 6);
  const scaled = safeFixed(n, decimals);
  const unitsStr = scaled.replace(".", "");
  const normalized = unitsStr.replace(/^0+(?!$)/, "");
  return BigInt(normalized);
}

export function calcFeeBps(units: bigint): { fee: bigint; total: bigint } {
  const bps = BigInt(clientEnv.NEXT_PUBLIC_PLATFORM_FEE_BPS);
  const fee = (units * bps) / BigInt(10_000);
  return { fee, total: units + fee };
}

export function getAddresses() {
  return {
    token: clientEnv.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`,
    escrow: clientEnv.NEXT_PUBLIC_ESCROW_ADDRESS as `0x${string}`,
  };
}

export function formatUnitsToUsd(units: bigint): string {
  const decimals = safeInt(clientEnv.NEXT_PUBLIC_USDC_DECIMALS, 6);
  const value = Number(units) / 10 ** decimals;
  return safeFixed(value, 2);
}
