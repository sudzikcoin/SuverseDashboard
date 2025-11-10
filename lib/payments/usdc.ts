import { clientEnv } from "../env";

export function usdToUnits(usdAmount: string | number): bigint {
  if (usdAmount === "" || usdAmount === null || usdAmount === undefined) {
    throw new Error("Amount is required");
  }
  const n = typeof usdAmount === "string" ? Number(usdAmount) : usdAmount;
  if (!Number.isFinite(n) || n < 0) throw new Error("Amount must be a positive number");

  const decimals = clientEnv.NEXT_PUBLIC_USDC_DECIMALS;
  const scaled = n.toFixed(decimals);
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
  const decimals = clientEnv.NEXT_PUBLIC_USDC_DECIMALS;
  return (Number(units) / 10 ** decimals).toFixed(2);
}
