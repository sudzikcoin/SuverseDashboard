import { z } from "zod";

const address = z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid 0x address");

const publicSchema = z.object({
  NEXT_PUBLIC_BASE_CHAIN_ID: z.string().default("8453"),
  NEXT_PUBLIC_USDC_ADDRESS: address,
  NEXT_PUBLIC_USDC_DECIMALS: z.string().regex(/^\d+$/, "Decimals must be a number"),
  NEXT_PUBLIC_ESCROW_ADDRESS: address,
  NEXT_PUBLIC_PLATFORM_FEE_BPS: z.string().regex(/^\d+$/).default("100"),
});

export type PublicEnv = z.infer<typeof publicSchema>;

export const env: PublicEnv = publicSchema.parse({
  NEXT_PUBLIC_BASE_CHAIN_ID: process.env.NEXT_PUBLIC_BASE_CHAIN_ID,
  NEXT_PUBLIC_USDC_ADDRESS: process.env.NEXT_PUBLIC_USDC_ADDRESS,
  NEXT_PUBLIC_USDC_DECIMALS: process.env.NEXT_PUBLIC_USDC_DECIMALS,
  NEXT_PUBLIC_ESCROW_ADDRESS: process.env.NEXT_PUBLIC_ESCROW_ADDRESS,
  NEXT_PUBLIC_PLATFORM_FEE_BPS: process.env.NEXT_PUBLIC_PLATFORM_FEE_BPS,
});

export const asNumber = (v: string) => Number.parseInt(v, 10);
