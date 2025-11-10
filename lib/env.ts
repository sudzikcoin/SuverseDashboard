import { z } from "zod";

export const clientEnv = (() => {
  const schema = z.object({
    NEXT_PUBLIC_USDC_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid USDC address"),
    NEXT_PUBLIC_ESCROW_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid escrow address"),
    NEXT_PUBLIC_USDC_DECIMALS: z.coerce.number().int().min(0).max(18).default(6),
    NEXT_PUBLIC_BASE_CHAIN_ID: z.coerce.number().int().nonnegative().default(8453),
    NEXT_PUBLIC_PLATFORM_FEE_BPS: z.coerce.number().int().min(0).max(10000).default(100),
  });

  const parsed = schema.safeParse({
    NEXT_PUBLIC_USDC_ADDRESS: process.env.NEXT_PUBLIC_USDC_ADDRESS,
    NEXT_PUBLIC_ESCROW_ADDRESS: process.env.NEXT_PUBLIC_ESCROW_ADDRESS,
    NEXT_PUBLIC_USDC_DECIMALS: process.env.NEXT_PUBLIC_USDC_DECIMALS ?? 6,
    NEXT_PUBLIC_BASE_CHAIN_ID: process.env.NEXT_PUBLIC_BASE_CHAIN_ID ?? 8453,
    NEXT_PUBLIC_PLATFORM_FEE_BPS: process.env.NEXT_PUBLIC_PLATFORM_FEE_BPS ?? 100,
  });

  if (!parsed.success) {
    const msg = parsed.error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join("; ");
    throw new Error("Env validation failed: " + msg);
  }
  return parsed.data;
})();
