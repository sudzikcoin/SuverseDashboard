/**
 * Purchase Order Status Constants
 * 
 * Centralized definition of PurchaseOrder statuses to ensure consistency
 * across the application when filtering, displaying, or aggregating orders.
 */

/**
 * Statuses that represent completed/paid purchases that should be counted
 * in statistics and client summaries.
 * 
 * - PAID: Stripe payment completed successfully
 * - PAID_TEST: Demo mode payment (no actual charge)
 */
export const COMPLETED_PURCHASE_STATUSES = [
  "PAID",
  "PAID_TEST",
] as const

/**
 * Statuses that represent incomplete purchases that should NOT be counted
 * in statistics or client summaries.
 */
export const INCOMPLETE_PURCHASE_STATUSES = [
  "PENDING_PAYMENT",
  "PROCESSING",
  "CANCELED",
  "FAILED",
  "REFUNDED",
  "BROKER_PENDING",
  "SETTLED",
] as const

/**
 * TypeScript type for completed purchase statuses
 */
export type CompletedPurchaseStatus = typeof COMPLETED_PURCHASE_STATUSES[number]

/**
 * Helper function to check if a status represents a completed purchase
 */
export function isCompletedPurchaseStatus(status: string): status is CompletedPurchaseStatus {
  return (COMPLETED_PURCHASE_STATUSES as readonly string[]).includes(status)
}
