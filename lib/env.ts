"use client";

import { z } from "zod";

const PublicSchema = z.object({
  NEXT_PUBLIC_BASE_CHAIN_ID: z.coerce.number().int().positive().default(8453),
  NEXT_PUBLIC_USDC_ADDRESS: z.string().min(10),
  NEXT_PUBLIC_ESCROW_ADDRESS: z.string().min(10),
  NEXT_PUBLIC_PLATFORM_FEE_BPS: z.coerce.number().min(0).max(10000).default(100),
  NEXT_PUBLIC_USDC_DECIMALS: z.coerce.number().min(0).max(18).default(6),
});

const _pub = {
  NEXT_PUBLIC_BASE_CHAIN_ID: process.env.NEXT_PUBLIC_BASE_CHAIN_ID,
  NEXT_PUBLIC_USDC_ADDRESS: process.env.NEXT_PUBLIC_USDC_ADDRESS,
  NEXT_PUBLIC_ESCROW_ADDRESS: process.env.NEXT_PUBLIC_ESCROW_ADDRESS,
  NEXT_PUBLIC_PLATFORM_FEE_BPS: process.env.NEXT_PUBLIC_PLATFORM_FEE_BPS,
  NEXT_PUBLIC_USDC_DECIMALS: process.env.NEXT_PUBLIC_USDC_DECIMALS,
};

const parsed = PublicSchema.safeParse(_pub);

let env: z.infer<typeof PublicSchema>;
if (!parsed.success) {
  if (typeof window !== "undefined") {
    console.warn("Public env parse failed, using safe defaults:", parsed.error.flatten().fieldErrors);
  }
  env = {
    NEXT_PUBLIC_BASE_CHAIN_ID: Number(_pub.NEXT_PUBLIC_BASE_CHAIN_ID ?? 8453),
    NEXT_PUBLIC_USDC_ADDRESS: _pub.NEXT_PUBLIC_USDC_ADDRESS ?? "",
    NEXT_PUBLIC_ESCROW_ADDRESS: _pub.NEXT_PUBLIC_ESCROW_ADDRESS ?? "",
    NEXT_PUBLIC_PLATFORM_FEE_BPS: Number(_pub.NEXT_PUBLIC_PLATFORM_FEE_BPS ?? 100),
    NEXT_PUBLIC_USDC_DECIMALS: Number(_pub.NEXT_PUBLIC_USDC_DECIMALS ?? 6),
  };
} else {
  env = parsed.data;
}

export default env;

export const clientEnv = env;
