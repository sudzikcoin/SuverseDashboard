/**
 * Safe parsing and formatting for monetary amounts in USDC payment flow.
 */

export interface ParsedAmount {
  value: number | null;
  display: string;
}

/**
 * Parses user input for amount field.
 * Allows digits, one decimal separator (. or ,), up to 9 integer and 2 decimal digits.
 * Returns null value for empty/invalid, but keeps display string for UX.
 */
export function parseAmountInput(raw: string): ParsedAmount {
  if (!raw || raw.trim() === "") {
    return { value: null, display: "" };
  }

  const normalized = raw.replace(/,/g, ".");
  
  const pattern = /^\d{0,9}(\.\d{0,2})?$/;
  if (!pattern.test(normalized)) {
    return { value: null, display: raw };
  }

  const parsed = parseFloat(normalized);
  if (!isFinite(parsed)) {
    return { value: null, display: normalized };
  }

  return { value: parsed, display: normalized };
}

/**
 * Checks if a number is positive money (> 0, finite).
 */
export function isPositiveMoney(n: number | null | undefined): n is number {
  return typeof n === "number" && isFinite(n) && n > 0;
}

/**
 * Formats a number as money with 2 decimals. Returns "0.00" for null/invalid.
 */
export function fmtMoney(n: number | null | undefined): string {
  if (typeof n === "number" && isFinite(n)) {
    return n.toFixed(2);
  }
  return "0.00";
}

/**
 * Minimum USDC amount for payments.
 */
export const MIN_USDC_AMOUNT = 0.01;

/**
 * Checks if amount meets minimum requirement.
 */
export function meetsMinimum(n: number | null | undefined): boolean {
  return isPositiveMoney(n) && n >= MIN_USDC_AMOUNT;
}
