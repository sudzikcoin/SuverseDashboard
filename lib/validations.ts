import { z } from "zod"

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["COMPANY", "ACCOUNTANT", "ADMIN"]),
  companyLegalName: z.string().optional(),
  state: z.string().optional(),
  ein: z.string().optional(),
  taxLiability: z.number().optional(),
  targetCloseYear: z.number().optional(),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export const createHoldSchema = z.object({
  inventoryId: z.string(),
  amountUSD: z.number().positive(),
})

export const createCheckoutSchema = z.object({
  inventoryId: z.string(),
  amountUSD: z.number().positive(),
})

export const updateBrokerStatusSchema = z.object({
  status: z.enum(["APPROVED", "NEEDS_INFO", "REJECTED"]),
})

export const createInventorySchema = z.object({
  creditType: z.enum(["ITC", "PTC", "C45Q", "C48C", "C48E", "OTHER"]),
  taxYear: z.number(),
  jurisdiction: z.string().optional(),
  stateRestriction: z.string().optional(),
  faceValueUSD: z.number().positive(),
  minBlockUSD: z.number().positive(),
  pricePerDollar: z.number().positive().max(1),
  closeBy: z.string().optional(),
  brokerName: z.string().optional(),
  notes: z.string().optional(),
})
