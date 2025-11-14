import { z } from "zod"

export const createCreditPoolSchema = z.object({
  programName: z.string().min(1, "Program name is required"),
  creditYear: z.coerce.number().int().min(2020).max(2050),
  creditType: z.string().min(1, "Credit type is required"),
  jurisdiction: z.string().min(1, "Jurisdiction is required"),
  programCode: z.string().optional().nullable(),
  registryId: z.string().optional().nullable(),
  totalFaceValueUsd: z.coerce.number().positive("Total face value must be positive"),
  availableFaceValueUsd: z.coerce.number().nonnegative("Available face value must be non-negative"),
  minBlockUsd: z.coerce.number().positive("Minimum block must be positive"),
  pricePerDollar: z.coerce.number().min(0).max(1, "Price per dollar must be between 0 and 1"),
  offerStartDate: z.string().nullable().optional(),
  offerExpiryDate: z.string().nullable().optional(),
  expectedSettlementDays: z.coerce.number().int().positive().nullable().optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).default("PUBLIC"),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "CLOSED"]).default("DRAFT"),
})

export const updateCreditPoolSchema = z.object({
  programName: z.string().min(1).optional(),
  creditYear: z.coerce.number().int().min(2020).max(2050).optional(),
  creditType: z.string().min(1).optional(),
  jurisdiction: z.string().min(1).optional(),
  programCode: z.string().nullable().optional(),
  registryId: z.string().nullable().optional(),
  totalFaceValueUsd: z.coerce.number().positive().optional(),
  availableFaceValueUsd: z.coerce.number().nonnegative().optional(),
  minBlockUsd: z.coerce.number().positive().optional(),
  pricePerDollar: z.coerce.number().min(0).max(1).optional(),
  offerStartDate: z.string().nullable().optional(),
  offerExpiryDate: z.string().nullable().optional(),
  expectedSettlementDays: z.coerce.number().int().positive().nullable().optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "CLOSED"]).optional(),
})

export type CreateCreditPoolInput = z.infer<typeof createCreditPoolSchema>
export type UpdateCreditPoolInput = z.infer<typeof updateCreditPoolSchema>
