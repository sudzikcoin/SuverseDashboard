function addCommas(num: string): string {
  const parts = num.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

export const formatNumber = (n: number): string => {
  if (isNaN(n) || !isFinite(n)) return '0';
  const rounded = Math.round(n * 100) / 100;
  return addCommas(rounded.toFixed(rounded % 1 === 0 ? 0 : 2));
};

export const formatUSD = (n: number): string => {
  if (isNaN(n) || !isFinite(n)) return '$0';
  const rounded = Math.round(n);
  return '$' + addCommas(rounded.toString());
};

export const formatUSDWithCents = (n: number): string => {
  if (isNaN(n) || !isFinite(n)) return '$0.00';
  const rounded = Math.round(n * 100) / 100;
  return '$' + addCommas(rounded.toFixed(2));
};

export const formatPercent = (n: number): string => {
  if (isNaN(n) || !isFinite(n)) return '0%';
  return (Math.round(n * 100) / 100).toFixed(2) + '%';
};

export const toRaw = (amountFloat: number, decimals = 6): bigint => {
  return BigInt(Math.round(amountFloat * Math.pow(10, decimals)))
}

export const fromRaw = (raw: bigint, decimals = 6): number => {
  return Number(raw) / Math.pow(10, decimals)
}

export const calcWithFee = (
  raw: bigint,
  feeBps: number
): { fee: bigint; total: bigint } => {
  const fee = (raw * BigInt(feeBps)) / BigInt(10_000)
  return { fee, total: raw + fee }
}
