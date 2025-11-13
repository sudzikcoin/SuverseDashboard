import { z } from "zod"

// EIN format: XX-XXXXXXX (9 digits with hyphen)
const EIN_REGEX = /^\d{2}-\d{7}$/

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["COMPANY", "ACCOUNTANT", "ADMIN"]),
  companyLegalName: z.string().optional(),
  state: z.string().optional(),
  ein: z.string().optional().refine(
    (val) => !val || EIN_REGEX.test(val),
    { message: "EIN must be in format XX-XXXXXXX (e.g., 12-3456789)" }
  ),
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

export const verifyCompanySchema = z.object({
  status: z.enum(["VERIFIED", "REJECTED"]),
  note: z.string().nullish(),
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
